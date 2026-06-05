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

const sm = new SecretsManagerClient({ region: 'us-east-1' });
const ddb = new DynamoDBClient({ region: 'us-east-1' });

const OTP_TABLE = process.env.OTP_TABLE || 'irp-otp';
const JWT_SECRET_NAME = process.env.JWT_SECRET || 'irp/jwt';
const MAX_ATTEMPTS = 3;

let cachedJwt = null;

async function getJwtSecret() {
  if (cachedJwt) return cachedJwt;
  const res = await sm.send(new GetSecretValueCommand({ SecretId: JWT_SECRET_NAME }));
  cachedJwt = JSON.parse(res.SecretString).JWT_SECRET;
  return cachedJwt;
}

function hashPhone(phone) {
  return createHash('sha256').update(phone).digest('hex');
}

function hashCode(code) {
  return createHash('sha256').update(code).digest('hex');
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
  const body = base64url(payload);
  const sig = createHmac('sha256', secret)
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
    phone = body?.phone?.replace(/\D/g, '');
    code = body?.code?.trim();
    entityId = body?.entityId;
    surveyType = body?.surveyType;
  } catch {
    return response(400, { error: 'invalid_body' });
  }

  if (!phone || !/^3\d{9}$/.test(phone)) return response(400, { error: 'invalid_phone' });
  if (!code || !/^\d{6}$/.test(code)) return response(400, { error: 'invalid_code' });
  if (!entityId || !['ciudadania', 'funcionario'].includes(surveyType)) {
    return response(400, { error: 'invalid_params' });
  }

  const fullPhone = `57${phone}`;
  const phoneHash = hashPhone(fullPhone);
  const now = Math.floor(Date.now() / 1000);

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

  const storedHash = record.Item.codeHash?.S;
  const attempts = parseInt(record.Item.attempts?.N || '0', 10);
  const inputHash = hashCode(code);

  if (inputHash !== storedHash) {
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

  // Código correcto — eliminar OTP y emitir JWT
  await ddb.send(new DeleteItemCommand({
    TableName: OTP_TABLE,
    Key: { phoneHash: { S: phoneHash } },
  }));

  const secret = await getJwtSecret();
  const token = createJwt(
    {
      phoneHash,
      entityId,
      surveyType,
      iat: now,
      exp: now + 3600,
    },
    secret
  );

  return response(200, { verified: true, token });
};
