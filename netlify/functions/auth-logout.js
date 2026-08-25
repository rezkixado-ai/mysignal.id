import { clearSessionCookie } from './_lib/auth.js';

export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie()
    },
    body: JSON.stringify({ ok: true })
  };
};
