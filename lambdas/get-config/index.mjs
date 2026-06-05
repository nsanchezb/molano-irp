import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const CONFIG_TABLE = process.env.CONFIG_TABLE || 'irp-config';

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

export const handler = async () => {
  const res = await ddb.send(new GetItemCommand({
    TableName: CONFIG_TABLE,
    Key: { configKey: { S: 'reactions_enabled' } },
  }));
  const enabled = res.Item?.value?.S === '1';
  return response(200, { reactionsEnabled: enabled });
};
