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

const OTP_TABLE        = process.env.OTP_TABLE     || 'irp-otp';
const ONURIX_SECRET    = process.env.ONURIX_SECRET  || 'irp/onurix';
const APP_NAME         = process.env.APP_NAME       || 'IRP';
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

function onurixRequest(path, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const req = https.request(
      {
        hostname: 'www.onurix.com',
        path,
        method: 'POST',
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
          try { resolve({ statusCode: res.statusCode, body: JSON.parse(data) }); }
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

  const fullPhone = `57${phone}`;
  const phoneHash = hashPhone(fullPhone);
  const now       = Math.floor(Date.now() / 1000);

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

  // Enviar OTP via Onurix 2FA
  const config = await getOnurixConfig();
  let result;
  try {
    result = await onurixRequest('/api/v1/sms/2fa/send', {
      client:     String(config.ONURIX_CLIENT),
      key:        config.ONURIX_KEY,
      phone:      fullPhone,
      'app-name': APP_NAME,
    });
  } catch {
    return response(503, { error: 'sms_unavailable' });
  }

  if (result.statusCode !== 200 || result.body?.error) {
    return response(503, { error: 'sms_unavailable' });
  }

  // Guardar registro en DynamoDB (para cooldown, TTL y control de intentos)
  await ddb.send(new PutItemCommand({
    TableName: OTP_TABLE,
    Item: {
      phoneHash: { S: phoneHash },
      attempts:  { N: '0' },
      createdAt: { N: String(now) },
      ttl:       { N: String(now + OTP_TTL_SECONDS) },
    },
  }));

  return response(200, { sent: true, expiresIn: OTP_TTL_SECONDS });
};
