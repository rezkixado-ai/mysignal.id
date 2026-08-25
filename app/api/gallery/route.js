import { NextResponse } from 'next/server';
import { db, newId } from '../../../lib/db.js';
import { isAuthorized } from '../../../lib/auth.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1' && (await isAuthorized());

  const rows = await db().execute(
    all
      ? 'SELECT * FROM gallery_items ORDER BY sort_order ASC'
      : 'SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY sort_order ASC'
  );
  return NextResponse.json(rows.rows);
}

export async function POST(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  const id = newId('gal');

  await db().execute({
    sql: `INSERT INTO gallery_items (id, title, tag, media_type, media_url, layout_span, sort_order, is_published)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [id, b.title || '', b.tag || '', b.media_type || 'image', b.media_url || '', b.layout_span || 'normal', b.sort_order ?? 0, b.is_published ?? 1]
  });
  return NextResponse.json({ ok: true, id });
}

export async function PUT(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await db().execute({
    sql: `UPDATE gallery_items SET title=?, tag=?, media_type=?, media_url=?, layout_span=?, sort_order=?, is_published=? WHERE id=?`,
    args: [b.title || '', b.tag || '', b.media_type || 'image', b.media_url || '', b.layout_span || 'normal', b.sort_order ?? 0, b.is_published ?? 1, b.id]
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await db().execute({ sql: 'DELETE FROM gallery_items WHERE id=?', args: [id] });
  return NextResponse.json({ ok: true });
}
