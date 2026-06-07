import { createHash, createHmac } from 'crypto';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const CONFIG_TABLE   = process.env.CONFIG_TABLE   || 'irp-config';
const DASHBOARD_HASH = process.env.DASHBOARD_HASH || '';
const JWT_SECRET     = process.env.JWT_SECRET     || '';
const TOKEN_TTL      = 8 * 3600;

if (!DASHBOARD_HASH || !JWT_SECRET) {
  throw new Error('irp-update-config: DASHBOARD_HASH and JWT_SECRET are required env vars');
}

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createAdminJwt() {
  const now    = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body   = b64url({ role: 'admin', iat: now, exp: now + TOKEN_TTL });
  const sig    = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}

function verifyAdminJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [header, payload, sig] = parts;
  const expected = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (sig !== expected) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.role === 'admin' && claims.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
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
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return response(400, { error: 'invalid_body' });
  }

  const adminKey = event.headers?.['x-admin-key'] || '';
  const action   = body?.action;

  if (action === 'check') {
    if (!DASHBOARD_HASH || sha256(adminKey) !== DASHBOARD_HASH) {
      console.log(JSON.stringify({ event: 'AUTH_FAILED', action: 'check', ip: event.requestContext?.http?.sourceIp }));
      return response(401, { error: 'unauthorized' });
    }
    return response(200, { token: createAdminJwt() });
  }

  // Todas las demás acciones requieren el token efímero, no la contraseña
  if (!JWT_SECRET || !verifyAdminJwt(adminKey)) {
    console.log(JSON.stringify({ event: 'AUTH_FAILED', action: 'write', ip: event.requestContext?.http?.sourceIp }));
    return response(401, { error: 'unauthorized' });
  }

  const { enabled } = body;
  if (typeof enabled !== 'boolean') {
    return response(400, { error: 'invalid_params' });
  }

  await ddb.send(new PutItemCommand({
    TableName: CONFIG_TABLE,
    Item: {
      configKey: { S: 'reactions_enabled' },
      value:     { S: enabled ? '1' : '0' },
    },
  }));

  console.log(JSON.stringify({ event: 'CONFIG_CHANGED', reactionsEnabled: enabled }));
  return response(200, { updated: true, reactionsEnabled: enabled });
};
