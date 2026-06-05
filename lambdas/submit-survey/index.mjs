import { createHmac, createHash } from 'crypto';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

const sm = new SecretsManagerClient({ region: 'us-east-1' });
const ddb = new DynamoDBClient({ region: 'us-east-1' });

const RESPONSES_TABLE = process.env.RESPONSES_TABLE || 'irp-responses';
const JWT_SECRET_NAME = process.env.JWT_SECRET || 'irp/jwt';

let cachedJwt = null;

async function getJwtSecret() {
  if (cachedJwt) return cachedJwt;
  const res = await sm.send(new GetSecretValueCommand({ SecretId: JWT_SECRET_NAME }));
  cachedJwt = JSON.parse(res.SecretString).JWT_SECRET;
  return cachedJwt;
}

function base64url(str) {
  return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function verifyJwt(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expected = base64url(
    createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64')
  );
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
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
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return response(401, { error: 'unauthorized' });

  const secret = await getJwtSecret();
  const claims = verifyJwt(token, secret);
  if (!claims) return response(401, { error: 'invalid_token' });

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp < now) return response(401, { error: 'token_expired' });

  let answers, consentAt, reactions;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    answers   = body?.answers;
    consentAt = body?.consentAt;
    reactions = body?.reactions;
  } catch {
    return response(400, { error: 'invalid_body' });
  }

  if (!Array.isArray(answers) || answers.length < 13 || answers.length > 16) {
    return response(400, { error: 'invalid_answers' });
  }
  if (!answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5)) {
    return response(400, { error: 'invalid_answers' });
  }

  // Validate optional reactions array (same length as answers, values: 1 | -1 | 0 | null)
  const validReactions =
    Array.isArray(reactions) &&
    reactions.length === answers.length &&
    reactions.every((r) => r === 1 || r === -1 || r === 0 || r === null);

  const { phoneHash, phone, entityId, surveyType } = claims;
  // Un celular puede evaluar múltiples entidades pero solo una vez por entidad,
  // sin importar el rol (ciudadania o funcionario).
  const responseId = createHash('sha256')
    .update(`${phoneHash}:${entityId}`)
    .digest('hex');

  await ddb.send(new PutItemCommand({
    TableName: RESPONSES_TABLE,
    Item: {
      responseId: { S: responseId },
      phoneHash: { S: phoneHash },
      ...(phone && { phone: { S: phone } }),
      entityId: { S: String(entityId) },
      surveyType: { S: surveyType },
      answers: { S: JSON.stringify(answers) },
      ...(validReactions && { reactions: { S: JSON.stringify(reactions) } }),
      createdAt: { N: String(now) },
      ...(consentAt && { consentAt: { N: String(consentAt) } }),
    },
    ConditionExpression: 'attribute_not_exists(responseId)',
  })).catch((err) => {
    if (err.name === 'ConditionalCheckFailedException') return null;
    throw err;
  });

  return response(200, { saved: true });
};
