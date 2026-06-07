const ORIGIN_SECRET = process.env.ORIGIN_SECRET;

if (!ORIGIN_SECRET) {
  throw new Error('irp-origin-authorizer: ORIGIN_SECRET is required env var');
}

export const handler = async (event) => {
  const received = event.headers?.['x-origin-secret'] || '';
  const authorized = received === ORIGIN_SECRET;
  if (!authorized) {
    console.log(JSON.stringify({ event: 'ORIGIN_BLOCKED', path: event.rawPath }));
  }
  return { isAuthorized: authorized };
};
