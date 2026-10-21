// URL publik situs. Atur env SITE_URL di Netlify (mis. https://xignal.id) setelah pakai domain sendiri.
export const SITE_URL = (process.env.SITE_URL || process.env.URL || 'https://xignal.netlify.app').replace(/\/+$/, '');
export const SITE_NAME = 'Xignal';
export const abs = (p = '/') => (/^https?:\/\//i.test(p) ? p : `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`);
