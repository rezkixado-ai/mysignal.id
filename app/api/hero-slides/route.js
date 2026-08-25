import { NextResponse } from 'next/server';
import { db, newId } from '../../../lib/db.js';
import { isAuthorized } from '../../../lib/auth.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1' && (await isAuthorized());

  const rows = await db().execute(
    all
      ? 'SELECT * FROM hero_slides ORDER BY sort_order ASC'
      : 'SELECT * FROM hero_slides WHERE is_published = 1 ORDER BY sort_order ASC'
  );
  return NextResponse.json(rows.rows);
}

export async function POST(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
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
  return NextResponse.json({ ok: true, id });
}

export async function PUT(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

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
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await db().execute({ sql: 'DELETE FROM hero_slides WHERE id=?', args: [id] });
  return NextResponse.json({ ok: true });
}
