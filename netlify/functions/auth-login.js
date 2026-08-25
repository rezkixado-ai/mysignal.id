import { json } from './_lib/db.js';
import { createSessionCookie } from './_lib/auth.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const { password } = body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return json(401, { error: 'Wrong password' });
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createSessionCookie()
    },
    body: JSON.stringify({ ok: true })
  };
};
