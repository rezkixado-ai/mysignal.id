import { db, json, newId } from './_lib/db.js';
import { isAuthorized } from './_lib/auth.js';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const handler = async (event) => {
  const method = event.httpMethod;
  const qs = event.queryStringParameters || {};

  if (method === 'GET') {
    if (qs.slug) {
      const r = await db().execute({ sql: 'SELECT * FROM articles WHERE slug=?', args: [qs.slug] });
      if (!r.rows.length) return json(404, { error: 'Not found' });
      const media = await db().execute({
        sql: 'SELECT * FROM article_media WHERE article_id=? ORDER BY sort_order ASC',
        args: [r.rows[0].id]
      });
      return json(200, { ...r.rows[0], media: media.rows });
    }

    const all = qs.all === '1' && isAuthorized(event);
    const where = all ? '' : 'WHERE is_published = 1';
    const catFilter = qs.category ? `${where ? 'AND' : 'WHERE'} category = '${String(qs.category).replace(/'/g, "")}'` : '';
    const rows = await db().execute(
      `SELECT * FROM articles ${where} ${catFilter} ORDER BY published_at DESC LIMIT ${Number(qs.limit) || 50}`
    );
    return json(200, rows.rows);
  }

  if (!isAuthorized(event)) return json(401, { error: 'Not authorized' });

  if (method === 'POST') {
    const b = JSON.parse(event.body || '{}');
    const id = newId('art');
    const slug = b.slug ? slugify(b.slug) : slugify(b.title || id);
    await db().execute({
      sql: `INSERT INTO articles
        (id, slug, title, excerpt, body_html, category, article_type, cover_media_type, cover_media_url,
         read_minutes, is_featured, is_breaking, is_published, meta_title, meta_description, focus_keyword)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, slug, b.title || 'Untitled', b.excerpt || '', b.body_html || '', b.category || 'Tech Business',
        b.article_type || 'news', b.cover_media_type || 'image', b.cover_media_url || '',
        b.read_minutes ?? 5, b.is_featured ?? 0, b.is_breaking ?? 0, b.is_published ?? 1,
        b.meta_title || '', b.meta_description || '', b.focus_keyword || ''
      ]
    });

    if (Array.isArray(b.media)) {
      for (let i = 0; i < b.media.length; i++) {
        const m = b.media[i];
        await db().execute({
          sql: `INSERT INTO article_media (id, article_id, media_type, media_url, caption, sort_order)
                VALUES (?,?,?,?,?,?)`,
          args: [newId('med'), id, m.media_type || 'image', m.media_url, m.caption || '', i]
        });
      }
    }
    return json(200, { ok: true, id, slug });
  }

  if (method === 'PUT') {
    const b = JSON.parse(event.body || '{}');
    if (!b.id) return json(400, { error: 'id is required' });
    await db().execute({
      sql: `UPDATE articles SET
        title=?, excerpt=?, body_html=?, category=?, article_type=?, cover_media_type=?, cover_media_url=?,
        read_minutes=?, is_featured=?, is_breaking=?, is_published=?, meta_title=?, meta_description=?,
        focus_keyword=?, updated_at=datetime('now')
        WHERE id=?`,
      args: [
        b.title, b.excerpt || '', b.body_html || '', b.category, b.article_type || 'news',
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
          sql: `INSERT INTO article_media (id, article_id, media_type, media_url, caption, sort_order)
                VALUES (?,?,?,?,?,?)`,
          args: [newId('med'), b.id, m.media_type || 'image', m.media_url, m.caption || '', i]
        });
      }
    }
    return json(200, { ok: true });
  }

  if (method === 'DELETE') {
    const id = qs.id;
    if (!id) return json(400, { error: 'id is required' });
    await db().execute({ sql: 'DELETE FROM articles WHERE id=?', args: [id] });
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
