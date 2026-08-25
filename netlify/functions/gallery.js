import { db, json, newId } from './_lib/db.js';
import { isAuthorized } from './_lib/auth.js';

export const handler = async (event) => {
  const method = event.httpMethod;

  if (method === 'GET') {
    const all = event.queryStringParameters?.all === '1' && isAuthorized(event);
    const rows = await db().execute(
      all
        ? 'SELECT * FROM gallery_items ORDER BY sort_order ASC'
        : 'SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY sort_order ASC'
    );
    return json(200, rows.rows);
  }

  if (!isAuthorized(event)) return json(401, { error: 'Not authorized' });

  if (method === 'POST') {
    const b = JSON.parse(event.body || '{}');
    const id = newId('gal');
    await db().execute({
      sql: `INSERT INTO gallery_items (id, title, tag, media_type, media_url, layout_span, sort_order, is_published)
            VALUES (?,?,?,?,?,?,?,?)`,
      args: [id, b.title || '', b.tag || '', b.media_type || 'image', b.media_url || '', b.layout_span || 'normal', b.sort_order ?? 0, b.is_published ?? 1]
    });
    return json(200, { ok: true, id });
  }

  if (method === 'PUT') {
    const b = JSON.parse(event.body || '{}');
    if (!b.id) return json(400, { error: 'id is required' });
    await db().execute({
      sql: `UPDATE gallery_items SET title=?, tag=?, media_type=?, media_url=?, layout_span=?, sort_order=?, is_published=? WHERE id=?`,
      args: [b.title || '', b.tag || '', b.media_type || 'image', b.media_url || '', b.layout_span || 'normal', b.sort_order ?? 0, b.is_published ?? 1, b.id]
    });
    return json(200, { ok: true });
  }

  if (method === 'DELETE') {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: 'id is required' });
    await db().execute({ sql: 'DELETE FROM gallery_items WHERE id=?', args: [id] });
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
