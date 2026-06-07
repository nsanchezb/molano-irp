import https from 'https';
import { createHash } from 'crypto';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

const OTP_TABLE        = process.env.OTP_TABLE   || 'irp-otp';
const ONURIX_CLIENT    = process.env.ONURIX_CLIENT;
const ONURIX_KEY       = process.env.ONURIX_KEY;
const APP_NAME         = process.env.APP_NAME    || 'IRP-Vencejo';
const COOLDOWN_SECONDS = 120;

if (!ONURIX_CLIENT || !ONURIX_KEY) {
  throw new Error('irp-send-otp: ONURIX_CLIENT and ONURIX_KEY are required env vars');
}
const OTP_TTL_SECONDS  = 300;
const IP_WINDOW        = 300;  // 5 minutos
const IP_MAX_REQUESTS  = 10;

function hashPhone(phone) {
  return createHash('sha256').update(phone).digest('hex');
}

async function checkIpRateLimit(ip, now) {
  const ipKey = `ip:${ip}`;
  const res = await ddb.send(new UpdateItemCommand({
    TableName: OTP_TABLE,
    Key: { phoneHash: { S: ipKey } },
    UpdateExpression: 'ADD #cnt :one SET #ttl = if_not_exists(#ttl, :exp)',
    ExpressionAttributeNames: { '#cnt': 'ipCount', '#ttl': 'ttl' },
    ExpressionAttributeValues: {
      ':one': { N: '1' },
      ':exp': { N: String(now + IP_WINDOW) },
    },
    ReturnValues: 'ALL_NEW',
  }));
  return parseInt(res.Attributes?.ipCount?.N || '1', 10);
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
          catch { reject(new Error('Respuesta invalida de Onurix')); }
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

  const now = Math.floor(Date.now() / 1000);
  const ip  = event.requestContext?.http?.sourceIp || 'unknown';

  // Rate limit por IP: máximo 10 OTPs por IP cada 5 minutos
  const ipCount = await checkIpRateLimit(ip, now);
  if (ipCount > IP_MAX_REQUESTS) {
    console.log(JSON.stringify({ event: 'IP_RATE_LIMITED', ip, count: ipCount }));
    return response(429, { error: 'too_many_requests', retryAfter: IP_WINDOW });
  }

  const fullPhone = `57${phone}`;
  const phoneHash = hashPhone(fullPhone);

  // Cooldown por teléfono: mínimo 120s entre OTPs al mismo número
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

  let result;
  try {
    result = await onurixRequest('/api/v1/sms/2fa/send', {
      client:     ONURIX_CLIENT,
      key:        ONURIX_KEY,
      phone:      fullPhone,
      'app-name': APP_NAME,
    });
  } catch {
    return response(503, { error: 'sms_unavailable' });
  }

  if (result.statusCode !== 200 || result.body?.error) {
    return response(503, { error: 'sms_unavailable' });
  }

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
