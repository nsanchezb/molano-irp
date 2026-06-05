import https from 'https';
import { createHash } from 'crypto';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

const sm  = new SecretsManagerClient({ region: 'us-east-1' });
const ddb = new DynamoDBClient({ region: 'us-east-1' });

const OTP_TABLE       = process.env.OTP_TABLE    || 'irp-otp';
const ONURIX_SECRET   = process.env.ONURIX_SECRET || 'irp/onurix';
const COOLDOWN_SECONDS = 120;
const OTP_TTL_SECONDS  = 300;

let cachedOnurix = null;

async function getOnurixConfig() {
  if (cachedOnurix) return cachedOnurix;
  const res = await sm.send(new GetSecretValueCommand({ SecretId: ONURIX_SECRET }));
  cachedOnurix = JSON.parse(res.SecretString);
  return cachedOnurix;
}

function hashPhone(phone) {
  return createHash('sha256').update(phone).digest('hex');
}

function send2FA(client, key, phone, expSeconds) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      _client: String(client),
      _key:    key,
      numero:  phone,
      tiempo_expiracion: String(expSeconds),
    }).toString();

    const req = https.request(
      {
        hostname: 'www.onurix.com',
        path:     '/api/v1/sms/send_code_2fa_sms',
        method:   'POST',
        headers: {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          Accept:           'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Respuesta inválida de Onurix')); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  let phone;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    phone = body?.phone?.replace(/\D/g, '');
  } catch {
    return response(400, { error: 'invalid_body' });
  }

  if (!phone || !/^3\d{9}$/.test(phone)) {
    return response(400, { error: 'invalid_phone' });
  }

  const fullPhone  = `57${phone}`;
  const phoneHash  = hashPhone(fullPhone);
  const now        = Math.floor(Date.now() / 1000);

  // Anti-spam: verificar cooldown
  const existing = await ddb.send(new GetItemCommand({
    TableName: OTP_TABLE,
    Key: { phoneHash: { S: phoneHash } },
  }));

  if (existing.Item) {
    const createdAt = parseInt(existing.Item.createdAt?.N || '0', 10);
    if (now - createdAt < COOLDOWN_SECONDS) {
      return response(429, {
        error: 'too_many_requests',
        retryAfter: COOLDOWN_SECONDS - (now - createdAt),
      });
    }
  }

  // Enviar 2FA via Onurix
  const config = await getOnurixConfig();
  let onurixRes;
  try {
    onurixRes = await send2FA(config.ONURIX_CLIENT, config.ONURIX_KEY, fullPhone, OTP_TTL_SECONDS);
  } catch {
    return response(503, { error: 'sms_unavailable' });
  }

  // Onurix retorna id_transaccion en caso de éxito
  const idTransaccion = onurixRes?.id_transaccion ?? onurixRes?.idTransaccion ?? null;
  if (!idTransaccion || onurixRes?.error) {
    return response(503, { error: 'sms_unavailable' });
  }

  // Guardar id_transaccion en DynamoDB
  await ddb.send(new PutItemCommand({
    TableName: OTP_TABLE,
    Item: {
      phoneHash:      { S: phoneHash },
      idTransaccion:  { S: String(idTransaccion) },
      attempts:       { N: '0' },
      createdAt:      { N: String(now) },
      ttl:            { N: String(now + OTP_TTL_SECONDS) },
    },
  }));

  return response(200, { sent: true, expiresIn: OTP_TTL_SECONDS });
};
