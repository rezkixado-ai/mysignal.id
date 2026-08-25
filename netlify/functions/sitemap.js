import { db } from './_lib/db.js';

const SITE_URL = 'https://mysignal.id'; // update once the real domain is live

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/news', priority: '0.9', changefreq: 'daily' },
  { path: '/gallery', priority: '0.6', changefreq: 'weekly' },
  { path: '/about', priority: '0.4', changefreq: 'monthly' },
  { path: '/contact', priority: '0.3', changefreq: 'monthly' }
];

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const handler = async () => {
  let articles = [];
  try {
    const r = await db().execute(
      "SELECT slug, updated_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC"
    );
    articles = r.rows;
  } catch {
    // if the DB is briefly unavailable, still return a valid sitemap of static routes
  }

  const urls = [
    ...STATIC_ROUTES.map((r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
    ...articles.map((a) => `  <url>
    <loc>${SITE_URL}/article/${xmlEscape(a.slug)}</loc>
    <lastmod>${new Date(a.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    body: xml
  };
};
