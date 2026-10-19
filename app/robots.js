const SITE_URL = (process.env.SITE_URL || process.env.URL || 'https://xignal.netlify.app').replace(/\/+$/, '');

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
