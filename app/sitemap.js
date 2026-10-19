import { db } from '../lib/db.js';

export const dynamic = 'force-dynamic';

// Domain: env SITE_URL, lalu URL (diinjeksi Netlify), lalu fallback Netlify.
const SITE_URL = (process.env.SITE_URL || process.env.URL || 'https://xignal.netlify.app').replace(/\/+$/, '');

const toDate = (v) => {
  if (!v) return undefined;
  const d = new Date(String(v).includes('T') ? v : `${v}Z`.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

// Satu tabel gagal tidak boleh menggagalkan seluruh sitemap, tapi harus terlihat di log.
async function rows(label, sql) {
  try {
    const r = await db().execute(sql);
    return r.rows;
  } catch (err) {
    console.warn(`[sitemap] query ${label} gagal:`, err?.message || err);
    return [];
  }
}

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/produk`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/artikel`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/event`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/video`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/gallery`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/tentang`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 }
  ];

  const [articles, products, events] = await Promise.all([
    rows('articles', 'SELECT slug, updated_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC'),
    rows('products', 'SELECT slug, created_at FROM products WHERE is_published = 1 ORDER BY sort_order ASC, id DESC'),
    rows('events', 'SELECT slug, created_at FROM events WHERE is_published = 1 ORDER BY event_date DESC')
  ]);

  const dynamicRoutes = [
    ...articles.map((a) => ({ url: `${SITE_URL}/article/${a.slug}`, lastModified: toDate(a.updated_at), changeFrequency: 'weekly', priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/produk/${p.slug}`, lastModified: toDate(p.created_at), changeFrequency: 'weekly', priority: 0.8 })),
    ...events.map((e) => ({ url: `${SITE_URL}/event/${e.slug}`, lastModified: toDate(e.created_at), changeFrequency: 'monthly', priority: 0.6 }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
