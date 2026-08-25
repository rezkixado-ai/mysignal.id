import { getStore } from '@netlify/blobs';

const COOKIE_NAME = 'mysignal_admin';
const MAX_BYTES = 100 * 1024 * 1024; // 100MB — plenty for hero video clips

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isAuthorized(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;

  const token = decodeURIComponent(match[1]);
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [tag, expiry, sig] = parts;
  const secret = Netlify.env.get('ADMIN_SESSION_SECRET') || 'dev-secret';
  const expected = await hmacHex(secret, `${tag}.${expiry}`);
  if (expected !== sig) return false;
  if (Date.now() > Number(expiry)) return false;

  return true;
}

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected multipart/form-data with a "file" field' }), { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 });
  }

  const contentType = file.type || 'application/octet-stream';
  const isImage = contentType.startsWith('image/');
  const isVideo = contentType.startsWith('video/');
  if (!isImage && !isVideo) {
    return new Response(JSON.stringify({ error: 'Only image/* or video/* files are accepted' }), { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'File too large (max 100MB)' }), { status: 413 });
  }

  const safeName = (file.name || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const key = `media/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;

  const store = getStore('mysignal-media');
  await store.set(key, file, { metadata: { contentType } }); // streamed under the hood, no base64 blow-up

  return new Response(JSON.stringify({
    ok: true,
    key,
    url: `/api/media-serve?key=${encodeURIComponent(key)}`,
    mediaType: isImage ? 'image' : 'video'
  }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/api/media-upload' };
