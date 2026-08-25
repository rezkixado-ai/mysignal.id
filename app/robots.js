const SITE_URL = 'https://mysignal.id'; // update once the real domain is live

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
