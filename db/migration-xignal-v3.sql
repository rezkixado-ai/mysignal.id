-- Xignal v3: jalankan SEKALI di Turso (shell atau dashboard SQL console).
-- Aman diulang: semua pakai IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Kabel FO',   -- 'Kabel FO' | 'OLT/ONU' | 'Tools' (bebas)
  specs TEXT DEFAULT '',                       -- pisahkan dengan | contoh: G.657A1 | LSZH | 1 Core
  price INTEGER,                               -- rupiah, NULL = "Hubungi sales"
  price_unit TEXT DEFAULT '/ Unit',
  badge TEXT DEFAULT '',                       -- mis. Best Seller
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features TEXT DEFAULT '',                    -- satu fitur per baris
  is_featured INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT DEFAULT 'Reels',
  views_label TEXT DEFAULT '',                 -- teks bebas, mis. 12.4K
  thumb_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',                    -- link Instagram/YouTube/TikTok
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Teknologi',
  event_date TEXT,                             -- YYYY-MM-DD
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
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS timeline_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_label TEXT NOT NULL,
  title TEXT DEFAULT '',
  body TEXT DEFAULT '',
  icon TEXT DEFAULT 'bulb',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS founders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Founder',
  tags TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);
