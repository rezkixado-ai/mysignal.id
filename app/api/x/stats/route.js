import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db.js';
import { isAuthorized } from '../../../../lib/auth.js';
import { ensureSchema } from '../../../../lib/xschema.js';
import { getSearchConsole, getGA4, googleConfigured } from '../../../../lib/google.js';

export const dynamic = 'force-dynamic';

const cache = new Map(); // 10 menit, supaya dashboard cepat dan kuota Google aman
async function count(sql) {
  try { const r = await db().execute(sql); return Number(r.rows[0].n); } catch { return null; }
}

export async function GET(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  try { await ensureSchema(); } catch { /* DB belum siap: counts akan null */ }

  const days = [7, 28, 90].includes(Number(new URL(request.url).searchParams.get('days'))) ? Number(new URL(request.url).searchParams.get('days')) : 28;
  const hit = cache.get(days);
  let analytics = hit && Date.now() - hit.t < 600000 ? hit.v : null;
  if (!analytics) {
    const [gsc, ga4] = await Promise.all([getSearchConsole(days), getGA4(days)]);
    analytics = { gsc, ga4, configured: googleConfigured() };
    if (gsc.connected || ga4.connected) cache.set(days, { t: Date.now(), v: analytics });
  }

  const [articles, drafts, products, events, videos] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM articles WHERE is_published = 1'),
    count('SELECT COUNT(*) AS n FROM articles WHERE is_published = 0'),
    count('SELECT COUNT(*) AS n FROM products WHERE is_published = 1'),
    count('SELECT COUNT(*) AS n FROM events WHERE is_published = 1'),
    count('SELECT COUNT(*) AS n FROM videos WHERE is_published = 1')
  ]);

  return NextResponse.json({ days, ...analytics, counts: { articles, drafts, products, events, videos } });
}
