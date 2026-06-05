import https from 'https';
import { createHash } from 'crypto';
import { createHmac } from 'crypto';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

const sm  = new SecretsManagerClient({ region: 'us-east-1' });
const ddb = new DynamoDBClient({ region: 'us-east-1' });

const OTP_TABLE       = process.env.OTP_TABLE     || 'irp-otp';
const JWT_SECRET_NAME = process.env.JWT_SECRET     || 'irp/jwt';
const ONURIX_SECRET   = process.env.ONURIX_SECRET  || 'irp/onurix';
const APP_NAME        = process.env.APP_NAME        || 'IRP';
const MAX_ATTEMPTS    = 3;

let cachedJwt    = null;
let cachedOnurix = null;

async function getJwtSecret() {
  if (cachedJwt) return cachedJwt;
  const res = await sm.send(new GetSecretValueCommand({ SecretId: JWT_SECRET_NAME }));
  cachedJwt = JSON.parse(res.SecretString).JWT_SECRET;
  return cachedJwt;
}

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

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJwt(payload, secret) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body   = base64url(payload);
  const sig    = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
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
  let phone, code, entityId, surveyType;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    phone      = body?.phone?.replace(/\D/g, '');
    code       = body?.code?.trim();
    entityId   = body?.entityId;
    surveyType = body?.surveyType;
  } catch {
    return response(400, { error: 'invalid_body' });
  }

  if (!phone || !/^3\d{9}$/.test(phone))  return response(400, { error: 'invalid_phone' });
  if (!code  || !/^\d{6}$/.test(code))    return response(400, { error: 'invalid_code' });
  if (!entityId || !['ciudadania', 'funcionario'].includes(surveyType)) {
    return response(400, { error: 'invalid_params' });
  }

  const fullPhone = `57${phone}`;
  const phoneHash = hashPhone(fullPhone);
  const now       = Math.floor(Date.now() / 1000);

  // Verificar que existe un OTP activo en DynamoDB
  const record = await ddb.send(new GetItemCommand({
    TableName: OTP_TABLE,
    Key: { phoneHash: { S: phoneHash } },
  }));

  if (!record.Item) return response(404, { error: 'expired' });

  const ttl = parseInt(record.Item.ttl?.N || '0', 10);
  if (now > ttl) {
    await ddb.send(new DeleteItemCommand({
      TableName: OTP_TABLE,
      Key: { phoneHash: { S: phoneHash } },
    }));
    return response(404, { error: 'expired' });
  }

  const attempts = parseInt(record.Item.attempts?.N || '0', 10);

  // Verificar código con Onurix 2FA
  const config = await getOnurixConfig();
  let result;
  try {
    result = await onurixRequest('/api/v1/2fa/verification-code', {
      client:     String(config.ONURIX_CLIENT),
      key:        config.ONURIX_KEY,
      phone:      fullPhone,
      'app-name': APP_NAME,
      code,
    });
  } catch {
    return response(503, { error: 'verification_unavailable' });
  }

  const verified = result.statusCode === 200 && !result.body?.error;

  if (!verified) {
    const newAttempts = attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      await ddb.send(new DeleteItemCommand({
        TableName: OTP_TABLE,
        Key: { phoneHash: { S: phoneHash } },
      }));
      return response(403, { error: 'locked', message: 'Demasiados intentos. Solicita un nuevo código.' });
    }

    await ddb.send(new UpdateItemCommand({
      TableName: OTP_TABLE,
      Key: { phoneHash: { S: phoneHash } },
      UpdateExpression: 'SET attempts = :a',
      ExpressionAttributeValues: { ':a': { N: String(newAttempts) } },
    }));

    return response(401, {
      error: 'invalid_code',
      attemptsLeft: MAX_ATTEMPTS - newAttempts,
    });
  }

  // Código correcto — eliminar registro y emitir JWT
  await ddb.send(new DeleteItemCommand({
    TableName: OTP_TABLE,
    Key: { phoneHash: { S: phoneHash } },
  }));

  const secret = await getJwtSecret();
  const token  = createJwt(
    { phoneHash, phone: fullPhone, entityId, surveyType, iat: now, exp: now + 3600 },
    secret
  );

  return response(200, { verified: true, token });
};
