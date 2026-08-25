import { db, json, newId } from './_lib/db.js';
import { isAuthorized } from './_lib/auth.js';

export const handler = async (event) => {
  const method = event.httpMethod;

  // ---- PUBLIC: list published slides, ordered ----
  if (method === 'GET') {
    const all = event.queryStringParameters?.all === '1' && isAuthorized(event);
    const rows = await db().execute(
      all
        ? 'SELECT * FROM hero_slides ORDER BY sort_order ASC'
        : "SELECT * FROM hero_slides WHERE is_published = 1 ORDER BY sort_order ASC"
    );
    return json(200, rows.rows);
  }

  // ---- everything else requires admin session ----
  if (!isAuthorized(event)) return json(401, { error: 'Not authorized' });

  if (method === 'POST') {
    const b = JSON.parse(event.body || '{}');
    const id = newId('slide');
    await db().execute({
      sql: `INSERT INTO hero_slides
        (id, eyebrow, title, description, cta_label, cta_url, media_type, media_url, ken_burns, sort_order, is_published)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, b.eyebrow || '', b.title || '', b.description || '', b.cta_label || 'Read Article',
        b.cta_url || '#', b.media_type || 'image', b.media_url || '', b.ken_burns || 'zoom-in',
        b.sort_order ?? 0, b.is_published ?? 1
      ]
    });
    return json(200, { ok: true, id });
  }

  if (method === 'PUT') {
    const b = JSON.parse(event.body || '{}');
    if (!b.id) return json(400, { error: 'id is required' });
    await db().execute({
      sql: `UPDATE hero_slides SET
        eyebrow=?, title=?, description=?, cta_label=?, cta_url=?, media_type=?, media_url=?,
        ken_burns=?, sort_order=?, is_published=?, updated_at=datetime('now')
        WHERE id=?`,
      args: [
        b.eyebrow || '', b.title || '', b.description || '', b.cta_label || 'Read Article',
        b.cta_url || '#', b.media_type || 'image', b.media_url || '', b.ken_burns || 'zoom-in',
        b.sort_order ?? 0, b.is_published ?? 1, b.id
      ]
    });
    return json(200, { ok: true });
  }

  if (method === 'DELETE') {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: 'id is required' });
    await db().execute({ sql: 'DELETE FROM hero_slides WHERE id=?', args: [id] });
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
