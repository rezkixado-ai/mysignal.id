import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db.js';
import { isAuthorized } from '../../../../lib/auth.js';
import { getPageSearch } from '../../../../lib/google.js';

export const dynamic = 'force-dynamic';

const cache = new Map(); // performa per artikel, 10 menit (hemat kuota Search Console)
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const scope = sp.get('scope');
  const slug = (sp.get('slug') || '').trim();

  // ---- performa Google untuk satu artikel ----
  if (scope === 'gsc') {
    const hit = cache.get(slug);
    if (hit && Date.now() - hit.t < 600000) return NextResponse.json(hit.v);
    const v = await getPageSearch(slug);
    if (v.connected) cache.set(slug, { t: Date.now(), v });
    return NextResponse.json(v);
  }

  // ---- indeks artikel lain (untuk saran internal link + cek keyword kembar) + link masuk ----
  try {
    const id = sp.get('id') || '';
    const all = await db().execute('SELECT id, slug, title, excerpt, category, focus_keyword, is_published, content_blocks, body_html FROM articles ORDER BY published_at DESC LIMIT 500');
    const self = all.rows.find((r) => String(r.id) === id) || (slug ? all.rows.find((r) => r.slug === slug) : null);
    const selfSlug = self?.slug || slug;
    const re = selfSlug ? new RegExp(`/article/${esc(selfSlug)}(?=["'/?#\\s\\\\]|$)`) : null;
    const others = [];
    const incoming = [];
    for (const r of all.rows) {
      if (self && String(r.id) === String(self.id)) continue;
      others.push({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt || '', category: r.category || '', focus_keyword: r.focus_keyword || '', is_published: Number(r.is_published) });
      if (re && Number(r.is_published) === 1 && re.test(`${r.content_blocks || ''} ${r.body_html || ''}`)) incoming.push({ slug: r.slug, title: r.title });
    }
    return NextResponse.json({ self: self ? { id: self.id, slug: self.slug } : null, others, incoming });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Gagal membaca artikel' }, { status: 500 });
  }
}
