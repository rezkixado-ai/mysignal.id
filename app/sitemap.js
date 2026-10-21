import { db } from '../lib/db.js';
import { ensureSchema } from '../lib/xschema.js';
import { abs } from '../lib/site.js';

export const dynamic = 'force-dynamic';

async function rows(sql) { try { return (await db().execute(sql)).rows.map((r) => ({ ...r })); } catch { return []; } }

export default async function sitemap() {
  try { await ensureSchema(); } catch { /* tabel opsional */ }
  const now = new Date();
  const fixed = ['/', '/artikel', '/produk', '/event', '/video', '/tentang', '/contact'].map((p) => ({ url: abs(p), lastModified: now, changeFrequency: p === '/' || p === '/artikel' ? 'daily' : 'weekly', priority: p === '/' ? 1 : 0.7 }));
  const arts = await rows(`SELECT a.slug, a.published_at FROM articles a
    LEFT JOIN article_seo s ON s.article_id = a.id
    WHERE a.is_published = 1 AND a.slug IS NOT NULL AND a.slug != '' AND COALESCE(s.noindex, 0) = 0 ORDER BY a.published_at DESC LIMIT 5000`);
  const prods = await rows("SELECT slug FROM products WHERE is_published = 1 AND slug IS NOT NULL AND slug != ''");
  const evs = await rows("SELECT slug FROM events WHERE is_published = 1 AND slug IS NOT NULL AND slug != ''");
  const d = (v) => { const t = v ? new Date(v) : null; return t && !Number.isNaN(+t) ? t : now; };
  return [
    ...fixed,
    ...arts.map((a) => ({ url: abs(`/article/${a.slug}`), lastModified: d(a.published_at), changeFrequency: 'monthly', priority: 0.8 })),
    ...prods.map((p) => ({ url: abs(`/produk/${p.slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.6 })),
    ...evs.map((e) => ({ url: abs(`/event/${e.slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.5 }))
  ];
}
