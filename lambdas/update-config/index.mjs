import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const CONFIG_TABLE  = process.env.CONFIG_TABLE   || 'irp-config';
const DASHBOARD_HASH = process.env.DASHBOARD_HASH || '';

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
  const adminKey = event.headers?.['x-admin-key'] || '';
  if (!DASHBOARD_HASH || adminKey !== DASHBOARD_HASH) {
    return response(401, { error: 'unauthorized' });
  }

  let enabled;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    enabled = body?.enabled;
  } catch {
    return response(400, { error: 'invalid_body' });
  }

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

  return response(200, { updated: true, reactionsEnabled: enabled });
};
