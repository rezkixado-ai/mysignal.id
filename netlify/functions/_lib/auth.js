import crypto from 'node:crypto';

const COOKIE_NAME = 'mysignal_admin';
const MAX_AGE = 60 * 60 * 8; // 8 hours

function sign(value) {
  const h = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || 'dev-secret');
  h.update(value);
  return h.digest('hex');
}

export function createSessionCookie() {
  const payload = `admin.${Date.now() + MAX_AGE * 1000}`;
  const sig = sign(payload);
  const token = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthorized(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;

  const token = decodeURIComponent(match[1]);
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [tag, expiry, sig] = parts;
  const payload = `${tag}.${expiry}`;
  if (sign(payload) !== sig) return false;
  if (Date.now() > Number(expiry)) return false;

  return true;
}
