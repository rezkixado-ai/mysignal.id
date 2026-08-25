export const handler = async (event) => {
  const host = event.headers['x-forwarded-host'] || event.headers.host || 'mysignal.id';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  const body = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${origin}/sitemap.xml
`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    body
  };
};
