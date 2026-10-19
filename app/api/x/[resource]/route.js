import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db.js';
import { isAuthorized } from '../../../../lib/auth.js';
import { ensureSchema } from '../../../../lib/xschema.js';
import { DEFAULT_SETTINGS } from '../../../../lib/xfallback.js';

export const dynamic = 'force-dynamic';

// Definisi tabel yang boleh dikelola lewat endpoint generik ini.
// cols: kolom yang boleh ditulis (selain id). slugFrom: kolom sumber slug (opsional).
const RESOURCES = {
  products: {
    order: 'sort_order ASC, id DESC', slugFrom: 'name',
    cols: ['slug', 'name', 'category', 'specs', 'price', 'price_unit', 'badge', 'image_url', 'description', 'features', 'is_featured', 'is_published', 'sort_order'],
    defaults: { category: 'Kabel FO', specs: '', price: null, price_unit: '/ Unit', badge: '', image_url: '', description: '', features: '', is_featured: 1, is_published: 1, sort_order: 0 },
    paths: (r) => ['/produk', `/produk/${r.slug}`, '/']
  },
  videos: {
    order: 'sort_order ASC, id DESC',
    cols: ['title', 'platform', 'views_label', 'thumb_url', 'link_url', 'is_published', 'sort_order'],
    defaults: { platform: 'Reels', views_label: '', thumb_url: '', link_url: '', is_published: 1, sort_order: 0 }
  },
  events: {
    order: 'event_date DESC, id DESC', slugFrom: 'title',
    cols: ['slug', 'title', 'category', 'event_date', 'end_date', 'city', 'venue', 'summary', 'description', 'cover_url', 'register_url', 'is_featured', 'is_published'],
    defaults: { category: 'Teknologi', event_date: null, end_date: null, city: '', venue: '', summary: '', description: '', cover_url: '', register_url: '', is_featured: 0, is_published: 1 },
    paths: (r) => ['/event', `/event/${r.slug}`]
  },
  brands: {
    order: 'sort_order ASC, id ASC',
    cols: ['name', 'logo_url', 'link_url', 'is_published', 'sort_order'],
    defaults: { logo_url: '', link_url: '', is_published: 1, sort_order: 0 }
  },
  timeline: {
    table: 'timeline_items', order: 'sort_order ASC, id ASC',
    cols: ['year_label', 'title', 'body', 'icon', 'sort_order'],
    defaults: { title: '', body: '', icon: 'bulb', sort_order: 0 }
  },
  founders: {
    order: 'sort_order ASC, id ASC',
    cols: ['name', 'role', 'tags', 'bio', 'photo_url', 'sort_order'],
    defaults: { role: 'Founder', tags: '', bio: '', photo_url: '', sort_order: 0 }
  }
};

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
const SETTING_KEYS = [...Object.keys(DEFAULT_SETTINGS), 'hero_image_url'];

async function guard() {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  try { await ensureSchema(); } catch (e) { return NextResponse.json({ error: `Database belum siap: ${e.message}` }, { status: 500 }); }
  return null;
}

async function uniqueSlug(table, base, selfId) {
  let slug = base || `item-${Date.now().toString(36)}`;
  for (let i = 0; i < 20; i += 1) {
    const r = await db().execute({ sql: `SELECT id FROM ${table} WHERE slug = ?`, args: [slug] });
    if (!r.rows.length || (selfId != null && String(r.rows[0].id) === String(selfId))) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function ping(cfg, row) {
  if (!cfg.paths || !Number(row.is_published)) return;
  try {
    const { pingIndexNow } = await import('../../../../lib/indexnow.js');
    pingIndexNow(cfg.paths(row));
  } catch { /* IndexNow opsional */ }
}

export async function GET(request, { params }) {
  const denied = await guard(); if (denied) return denied;

  if (params.resource === 'settings') {
    const r = await db().execute('SELECT key, value FROM site_settings');
    const out = { ...DEFAULT_SETTINGS, hero_image_url: '' };
    r.rows.forEach((x) => { if (x.value != null) out[x.key] = x.value; });
    return NextResponse.json(out);
  }

  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const r = await db().execute(`SELECT * FROM ${cfg.table || params.resource} ORDER BY ${cfg.order} LIMIT 500`);
  return NextResponse.json(r.rows.map((x) => ({ ...x })));
}

export async function POST(request, { params }) {
  const denied = await guard(); if (denied) return denied;
  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const table = cfg.table || params.resource;
  const b = await request.json();
  const row = { ...cfg.defaults };
  cfg.cols.forEach((c) => { if (b[c] !== undefined) row[c] = b[c]; });
  if (cfg.slugFrom) row.slug = await uniqueSlug(table, slugify(b.slug || b[cfg.slugFrom]), null);
  const cols = cfg.cols.filter((c) => row[c] !== undefined);
  const res = await db().execute({
    sql: `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    args: cols.map((c) => (row[c] === '' && (c.endsWith('_date') || c === 'price') ? null : row[c]))
  });
  await ping(cfg, row);
  return NextResponse.json({ ok: true, id: Number(res.lastInsertRowid), slug: row.slug });
}

export async function PUT(request, { params }) {
  const denied = await guard(); if (denied) return denied;

  if (params.resource === 'settings') {
    const b = await request.json();
    const values = b.values || {};
    for (const k of Object.keys(values)) {
      if (!SETTING_KEYS.includes(k)) continue;
      await db().execute({ sql: 'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', args: [k, String(values[k] ?? '')] });
    }
    return NextResponse.json({ ok: true });
  }

  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const table = cfg.table || params.resource;
  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const row = { ...b };
  if (cfg.slugFrom) row.slug = await uniqueSlug(table, slugify(b.slug || b[cfg.slugFrom]), b.id);
  const cols = cfg.cols.filter((c) => row[c] !== undefined);
  await db().execute({
    sql: `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    args: [...cols.map((c) => (row[c] === '' && (c.endsWith('_date') || c === 'price') ? null : row[c])), b.id]
  });
  await ping(cfg, row);
  return NextResponse.json({ ok: true, slug: row.slug });
}

export async function DELETE(request, { params }) {
  const denied = await guard(); if (denied) return denied;
  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  await db().execute({ sql: `DELETE FROM ${cfg.table || params.resource} WHERE id = ?`, args: [id] });
  return NextResponse.json({ ok: true });
}
