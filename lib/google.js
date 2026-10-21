import crypto from 'crypto';

// Akses Google API (Search Console + GA4) lewat service account, tanpa library tambahan.
// Env: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY (boleh berisi \n literal),
//      GSC_SITE_URL (mis. sc-domain:xignal.id atau https://xignal.id/), GA4_PROPERTY_ID (opsional).

const b64 = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
let tokenCache = { token: null, exp: 0, scope: '' };

export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

async function accessToken(scope) {
  if (tokenCache.token && tokenCache.scope === scope && Date.now() < tokenCache.exp - 60000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'RS256', typ: 'JWT' });
  const claim = b64({ iss: process.env.GOOGLE_CLIENT_EMAIL, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const sig = crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claim}.${sig}` })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Gagal login ke Google');
  tokenCache = { token: data.access_token, exp: Date.now() + data.expires_in * 1000, scope };
  return data.access_token;
}

const iso = (d) => d.toISOString().slice(0, 10);

// ---------------- Search Console ----------------
async function gscQuery(body) {
  const site = process.env.GSC_SITE_URL;
  const token = await accessToken('https://www.googleapis.com/auth/webmasters.readonly');
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Search Console error');
  return data.rows || [];
}

export async function getSearchConsole(days = 28) {
  if (!googleConfigured() || !process.env.GSC_SITE_URL) return { connected: false };
  const end = new Date(Date.now() - 2 * 86400000); // data GSC tertunda ±2 hari
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const base = { startDate: iso(start), endDate: iso(end) };
  try {
    const [byDate, byDevice, byQuery, byPage] = await Promise.all([
      gscQuery({ ...base, dimensions: ['date'], rowLimit: 500 }),
      gscQuery({ ...base, dimensions: ['device'] }),
      gscQuery({ ...base, dimensions: ['query'], rowLimit: 5 }),
      gscQuery({ ...base, dimensions: ['page'], rowLimit: 5 })
    ]);
    const sum = (k) => byDate.reduce((a, r) => a + (r[k] || 0), 0);
    const clicks = sum('clicks');
    const impressions = sum('impressions');
    const position = byDate.length ? byDate.reduce((a, r) => a + r.position * r.impressions, 0) / Math.max(1, impressions) : 0;
    return {
      connected: true,
      range: base,
      totals: { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position },
      series: byDate.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
      devices: byDevice.map((r) => ({ label: r.keys[0], value: r.clicks })),
      queries: byQuery.map((r) => ({ label: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
      pages: byPage.map((r) => ({ label: r.keys[0], clicks: r.clicks, impressions: r.impressions }))
    };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}

// Performa satu artikel (/article/<slug>) di Google: total 28 hari vs 28 hari sebelumnya, tren harian, dan query pembawa trafik.
export async function getPageSearch(slug, days = 28) {
  if (!googleConfigured() || !process.env.GSC_SITE_URL) return { connected: false };
  if (!slug) return { connected: true, empty: true };
  const end = new Date(Date.now() - 2 * 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const pEnd = new Date(start.getTime() - 86400000);
  const pStart = new Date(pEnd.getTime() - (days - 1) * 86400000);
  const rx = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = { dimensionFilterGroups: [{ groupType: 'and', filters: [{ dimension: 'page', operator: 'includingRegex', expression: `/article/${rx}/?$` }] }] };
  const cur = { startDate: iso(start), endDate: iso(end), ...filter };
  const tot = (rows) => (rows[0] ? { clicks: rows[0].clicks, impressions: rows[0].impressions, ctr: rows[0].ctr, position: rows[0].position } : { clicks: 0, impressions: 0, ctr: 0, position: 0 });
  try {
    const [now, prev, byQuery, byDate] = await Promise.all([
      gscQuery(cur),
      gscQuery({ startDate: iso(pStart), endDate: iso(pEnd), ...filter }),
      gscQuery({ ...cur, dimensions: ['query'], rowLimit: 25 }),
      gscQuery({ ...cur, dimensions: ['date'], rowLimit: 100 })
    ]);
    return {
      connected: true,
      empty: !now.length,
      range: { startDate: cur.startDate, endDate: cur.endDate },
      totals: tot(now),
      prev: tot(prev),
      series: byDate.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
      queries: byQuery.map((r) => ({ q: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }))
    };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}

// ---------------- GA4 (aktif otomatis kalau GA4_PROPERTY_ID diisi) ----------------
async function ga4Report(body) {
  const token = await accessToken('https://www.googleapis.com/auth/analytics.readonly');
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'GA4 error');
  return data.rows || [];
}

export async function getGA4(days = 28) {
  if (!googleConfigured() || !process.env.GA4_PROPERTY_ID) return { connected: false };
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
  try {
    const [byDate, byChannel] = await Promise.all([
      ga4Report({ dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
      ga4Report({ dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 6 })
    ]);
    const series = byDate.map((r) => {
      const d = r.dimensionValues[0].value;
      return { date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, visitors: Number(r.metricValues[0].value), views: Number(r.metricValues[1].value) };
    });
    return {
      connected: true,
      totals: { visitors: series.reduce((a, r) => a + r.visitors, 0), views: series.reduce((a, r) => a + r.views, 0) },
      series,
      channels: byChannel.map((r) => ({ label: r.dimensionValues[0].value, value: Number(r.metricValues[0].value) }))
    };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
