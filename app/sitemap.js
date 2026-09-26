import { db } from '../lib/db.js';

// Netlify automatically injects `URL` at both build and runtime, set to
// whatever this deploy's actual primary domain is (currently
// xignal.netlify.app; will become mysignal.id automatically once that
// domain is attached — no code change needed then). The hardcoded fallback
// only kicks in for local `npm run dev`, where that env var isn't set.
const SITE_URL = process.env.URL || 'https://mysignal.id';

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/gallery`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.3 }
  ];

  let articleRoutes = [];
  try {
    const r = await db().execute("SELECT slug, updated_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC");
    articleRoutes = r.rows.map((a) => ({
      url: `${SITE_URL}/article/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7
    }));
  } catch {
    // DB unavailable at build/request time — still return static routes
  }

  return [...staticRoutes, ...articleRoutes];
}
