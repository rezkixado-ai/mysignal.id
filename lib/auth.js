import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mysignal_admin';
const MAX_AGE = 60 * 60 * 8; // 8 hours

function sign(value) {
  const h = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || 'dev-secret');
  h.update(value);
  return h.digest('hex');
}

export async function createSession() {
  const payload = `admin.${Date.now() + MAX_AGE * 1000}`;
  const sig = sign(payload);
  const token = `${payload}.${sig}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: MAX_AGE
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthorized() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [tag, expiry, sig] = parts;
  if (sign(`${tag}.${expiry}`) !== sig) return false;
  if (Date.now() > Number(expiry)) return false;

  return true;
}
