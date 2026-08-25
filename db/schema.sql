-- ===================== HERO SLIDES =====================
CREATE TABLE IF NOT EXISTS hero_slides (
  id TEXT PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cta_label TEXT DEFAULT 'Read Article',
  cta_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video'
  media_url TEXT NOT NULL,                  -- Netlify Blobs URL/key
  ken_burns TEXT DEFAULT 'zoom-in',          -- 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'none'
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ===================== ARTICLES (Latest Signals / Deeper Signals) =====================
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_html TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,          -- Cybersecurity | Cloud | Network | Fiber Optic | AI | Big Tech | Tech Business | Hardware
  article_type TEXT NOT NULL DEFAULT 'news', -- 'news' | 'analysis' | 'explainer' | 'insight' | 'opinion'
  cover_media_type TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video'
  cover_media_url TEXT,
  read_minutes INTEGER DEFAULT 5,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_breaking INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- media embedded inside an article body (in-line images/videos, ordered)
CREATE TABLE IF NOT EXISTS article_media (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video'
  media_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ===================== GALLERY =====================
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT,
  tag TEXT,                         -- e.g. "Fiber Optic", "AI"
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video'
  media_url TEXT NOT NULL,
  layout_span TEXT DEFAULT 'normal', -- 'normal' | 'wide' | 'big' (masonry sizing)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ===================== SIGNAL SOURCES (marquee) =====================
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(sort_order, is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_article_media_article ON article_media(article_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_items(sort_order, is_published);
