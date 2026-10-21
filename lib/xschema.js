// Skema tabel Xignal. Dibuat otomatis (IF NOT EXISTS) saat CMS admin pertama kali dibuka,
// jadi tidak perlu menjalankan SQL manual. Salinan: db/migration-xignal-v3.sql
import { db } from './db.js';

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
)`,
  `CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Kabel FO',
  specs TEXT DEFAULT '',
  price INTEGER,
  price_unit TEXT DEFAULT '/ Unit',
  badge TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features TEXT DEFAULT '',
  is_featured INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`,
  `CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT DEFAULT 'Reels',
  views_label TEXT DEFAULT '',
  thumb_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`,
  `CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Teknologi',
  event_date TEXT,
  end_date TEXT,
  city TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  register_url TEXT DEFAULT '',
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`,
  `CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
)`,
  `CREATE TABLE IF NOT EXISTS timeline_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_label TEXT NOT NULL,
  title TEXT DEFAULT '',
  body TEXT DEFAULT '',
  icon TEXT DEFAULT 'bulb',
  sort_order INTEGER DEFAULT 0
)`,
  `CREATE TABLE IF NOT EXISTS founders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Founder',
  tags TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
)`,
  `CREATE TABLE IF NOT EXISTS article_seo (
  article_id TEXT PRIMARY KEY,
  noindex INTEGER DEFAULT 0,
  canonical TEXT DEFAULT '',
  og_title TEXT DEFAULT '',
  og_description TEXT DEFAULT '',
  og_image TEXT DEFAULT ''
)`,
  `CREATE TABLE IF NOT EXISTS article_redirects (
  old_slug TEXT PRIMARY KEY,
  new_slug TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`,
];

let done = false;
export async function ensureSchema() {
  if (done) return;
  for (const sql of STATEMENTS) await db().execute(sql);
  done = true;
}
