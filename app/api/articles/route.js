import { NextResponse } from 'next/server';
import { db, newId } from '../../../lib/db.js';
import { isAuthorized } from '../../../lib/auth.js';
import { pingIndexNow } from '../../../lib/indexnow.js';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const r = await db().execute({ sql: 'SELECT * FROM articles WHERE slug=?', args: [slug] });
    if (!r.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const media = await db().execute({
      sql: 'SELECT * FROM article_media WHERE article_id=? ORDER BY sort_order ASC',
      args: [r.rows[0].id]
    });
    return NextResponse.json({ ...r.rows[0], media: media.rows });
  }

  const all = searchParams.get('all') === '1' && (await isAuthorized());
  const category = searchParams.get('category');
  const limit = Number(searchParams.get('limit')) || 50;

  const where = all ? '' : 'WHERE is_published = 1';
  const catFilter = category ? `${where ? 'AND' : 'WHERE'} category = '${category.replace(/'/g, '')}'` : '';

  const rows = await db().execute(
    `SELECT * FROM articles ${where} ${catFilter} ORDER BY published_at DESC LIMIT ${limit}`
  );
  return NextResponse.json(rows.rows);
}

export async function POST(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  const id = newId('art');
  const slug = b.slug ? slugify(b.slug) : slugify(b.title || id);

  // content_blocks is the new Editor.js block-based body (JSON string).
  // body_html is kept for backward compatibility with articles written
  // before this feature and as a fallback if content_blocks is empty.
  const contentBlocksJson = JSON.stringify(b.content_blocks && Array.isArray(b.content_blocks.blocks) ? b.content_blocks : { blocks: [] });

  await db().execute({
    sql: `INSERT INTO articles
      (id, slug, title, excerpt, body_html, content_blocks, category, article_type, cover_media_type, cover_media_url,
       read_minutes, is_featured, is_breaking, is_published, meta_title, meta_description, focus_keyword)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id, slug, b.title || 'Untitled', b.excerpt || '', b.body_html || '', contentBlocksJson, b.category || 'Tech Business',
      b.article_type || 'news', b.cover_media_type || 'image', b.cover_media_url || '',
      b.read_minutes ?? 5, b.is_featured ?? 0, b.is_breaking ?? 0, b.is_published ?? 1,
      b.meta_title || '', b.meta_description || '', b.focus_keyword || ''
    ]
  });

  if (Array.isArray(b.media)) {
    for (let i = 0; i < b.media.length; i++) {
      const m = b.media[i];
      await db().execute({
        sql: `INSERT INTO article_media (id, article_id, media_type, media_url, caption, sort_order) VALUES (?,?,?,?,?,?)`,
        args: [newId('med'), id, m.media_type || 'image', m.media_url, m.caption || '', i]
      });
    }
  }
  if (b.is_published) {
    pingIndexNow([`/article/${slug}`, '/news', '/']);
  }
  return NextResponse.json({ ok: true, id, slug });
}

export async function PUT(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const contentBlocksJson = JSON.stringify(b.content_blocks && Array.isArray(b.content_blocks.blocks) ? b.content_blocks : { blocks: [] });

  await db().execute({
    sql: `UPDATE articles SET
      title=?, excerpt=?, body_html=?, content_blocks=?, category=?, article_type=?, cover_media_type=?, cover_media_url=?,
      read_minutes=?, is_featured=?, is_breaking=?, is_published=?, meta_title=?, meta_description=?,
      focus_keyword=?, updated_at=datetime('now')
      WHERE id=?`,
    args: [
      b.title, b.excerpt || '', b.body_html || '', contentBlocksJson, b.category, b.article_type || 'news',
      b.cover_media_type || 'image', b.cover_media_url || '', b.read_minutes ?? 5,
      b.is_featured ?? 0, b.is_breaking ?? 0, b.is_published ?? 1,
      b.meta_title || '', b.meta_description || '', b.focus_keyword || '', b.id
    ]
  });

  if (Array.isArray(b.media)) {
    await db().execute({ sql: 'DELETE FROM article_media WHERE article_id=?', args: [b.id] });
    for (let i = 0; i < b.media.length; i++) {
      const m = b.media[i];
      await db().execute({
        sql: `INSERT INTO article_media (id, article_id, media_type, media_url, caption, sort_order) VALUES (?,?,?,?,?,?)`,
        args: [newId('med'), b.id, m.media_type || 'image', m.media_url, m.caption || '', i]
      });
    }
  }
  if (b.is_published && b.slug) {
    pingIndexNow([`/article/${b.slug}`, '/news', '/']);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await db().execute({ sql: 'DELETE FROM articles WHERE id=?', args: [id] });
  return NextResponse.json({ ok: true });
}
