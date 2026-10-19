import { db } from './db.js';
import {
  DEFAULT_SETTINGS, FALLBACK_PRODUCTS, FALLBACK_VIDEOS, FALLBACK_ARTICLES,
  FALLBACK_EVENTS, FALLBACK_BRANDS, FALLBACK_TIMELINE, FALLBACK_FOUNDERS
} from './xfallback.js';

// libsql rows -> plain objects (safe to pass to client components)
const plain = (rows) => rows.map((r) => ({ ...r }));

async function query(sql, args = []) {
  try {
    const res = await db().execute({ sql, args });
    return plain(res.rows);
  } catch {
    return null; // tabel belum ada / DB tidak bisa dihubungi
  }
}

export async function getSettings() {
  const rows = await query('SELECT key, value FROM site_settings');
  const s = { ...DEFAULT_SETTINGS };
  (rows || []).forEach((r) => { if (r.value != null && (r.value !== '' || r.key.startsWith('promo_'))) s[r.key] = r.value; }); // promo_: kosong = sengaja dikosongkan (mis. tanpa tombol)
  if (!rows && process.env.WA_NUMBER) s.wa_number = process.env.WA_NUMBER;
  return s;
}

export const waLink = (settings, text = 'Halo Xignal, saya ingin berkonsultasi.') =>
  `https://wa.me/${String(settings.wa_number).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export async function getProducts({ featured = false, limit = 50, slug = null } = {}) {
  if (slug) {
    const rows = await query('SELECT * FROM products WHERE slug = ? AND is_published = 1 LIMIT 1', [slug]);
    if (rows && rows[0]) return rows[0];
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
  const rows = await query(
    `SELECT * FROM products WHERE is_published = 1 ${featured ? 'AND is_featured = 1' : ''} ORDER BY sort_order ASC, id DESC LIMIT ?`,
    [limit]
  );
  return rows && rows.length ? rows : FALLBACK_PRODUCTS.slice(0, limit);
}

export async function getVideos(limit = 12) {
  const rows = await query('SELECT * FROM videos WHERE is_published = 1 ORDER BY sort_order ASC, id DESC LIMIT ?', [limit]);
  return rows && rows.length ? rows : FALLBACK_VIDEOS.slice(0, limit);
}

export async function getBrands() {
  const rows = await query('SELECT * FROM brands WHERE is_published = 1 ORDER BY sort_order ASC, id ASC');
  return rows && rows.length ? rows : FALLBACK_BRANDS;
}

export async function getTimeline() {
  const rows = await query('SELECT * FROM timeline_items ORDER BY sort_order ASC, id ASC');
  return rows && rows.length ? rows : FALLBACK_TIMELINE;
}

export async function getFounders() {
  const rows = await query('SELECT * FROM founders ORDER BY sort_order ASC, id ASC');
  return rows && rows.length ? rows : FALLBACK_FOUNDERS;
}

export async function getEvents() {
  const rows = await query('SELECT * FROM events WHERE is_published = 1 ORDER BY is_featured DESC, event_date DESC');
  return rows && rows.length ? rows : FALLBACK_EVENTS;
}

export async function getEvent(slug) {
  const rows = await query('SELECT * FROM events WHERE slug = ? AND is_published = 1 LIMIT 1', [slug]);
  if (rows && rows[0]) return rows[0];
  return FALLBACK_EVENTS.find((e) => e.slug === slug) || null;
}

// Artikel memakai tabel `articles` yang sudah ada.
export async function getArticleList({ limit = 12, offset = 0, category = '', q = '' } = {}) {
  const where = ['is_published = 1'];
  const args = [];
  if (category) { where.push('category = ?'); args.push(category); }
  if (q) { where.push('(title LIKE ? OR excerpt LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  const rows = await query(
    `SELECT id, slug, title, excerpt, category, article_type, cover_media_url, cover_media_type, published_at, read_minutes, is_featured, is_breaking
     FROM articles WHERE ${where.join(' AND ')} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [...args, limit, offset]
  );
  const cnt = await query(`SELECT COUNT(*) AS n FROM articles WHERE ${where.join(' AND ')}`, args);
  const total = cnt && cnt[0] ? Number(cnt[0].n) : 0;
  if (rows && (rows.length || total || category || q)) return { items: rows, total, demo: false };
  return { items: FALLBACK_ARTICLES.slice(offset, offset + limit), total: FALLBACK_ARTICLES.length, demo: true };
}

export async function getArticleCategories() {
  const rows = await query('SELECT DISTINCT category FROM articles WHERE is_published = 1 AND category IS NOT NULL ORDER BY category');
  return rows && rows.length ? rows.map((r) => r.category) : ['Internet', 'Fiber Optik', 'Networking', 'Cybersecurity', 'Artificial Intelligence'];
}

// ---------- format helpers ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function fmtDate(d) {
  if (!d) return '';
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return String(d);
  return `${String(t.getDate()).padStart(2, '0')} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
}
export function fmtRange(a, b) {
  if (!a) return '';
  if (!b || b === a) return fmtDate(a);
  const x = new Date(a), y = new Date(b);
  if (x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear()) return `${x.getDate()} - ${y.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
  return `${fmtDate(a)} - ${fmtDate(b)}`;
}
export const rupiah = (n) => (n == null || n === '' ? null : `Rp ${Number(n).toLocaleString('id-ID')}`);
export const splitSpecs = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);

// Gambar hero: pengaturan `hero_image_url`, atau slide pertama dari Hero Slider (CMS lama).
// Semua slide gambar yang tayang (urut sesuai sort_order). Kalau belum ada slide, pakai hero_image_url.
export async function getHeroSlides(settings) {
  const rows = await query("SELECT media_url, title, cta_url FROM hero_slides WHERE is_published = 1 AND media_type = 'image' AND media_url != '' ORDER BY sort_order ASC, id ASC LIMIT 8");
  if (rows && rows.length) return rows.map((r) => ({ src: r.media_url, title: r.title || '', href: r.cta_url || '' }));
  return settings.hero_image_url ? [{ src: settings.hero_image_url, title: '', href: '' }] : [];
}

export async function getHeroImage(settings) {
  if (settings.hero_image_url) return settings.hero_image_url;
  const rows = await query("SELECT media_url FROM hero_slides WHERE is_published = 1 AND media_type = 'image' ORDER BY sort_order ASC LIMIT 1");
  return rows && rows[0] ? rows[0].media_url : '';
}
