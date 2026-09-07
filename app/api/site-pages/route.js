import { NextResponse } from 'next/server';
import { db } from '../../../lib/db.js';
import { isAuthorized } from '../../../lib/auth.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const r = await db().execute({ sql: 'SELECT * FROM site_pages WHERE slug=?', args: [slug] });
  if (!r.rows.length) return NextResponse.json(null);
  return NextResponse.json(r.rows[0]);
}

export async function PUT(request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const b = await request.json();
  if (!b.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const contentBlocksJson = JSON.stringify(b.content_blocks && Array.isArray(b.content_blocks.blocks) ? b.content_blocks : { blocks: [] });

  await db().execute({
    sql: `INSERT INTO site_pages (slug, title, content_blocks, meta_title, meta_description, updated_at)
      VALUES (?,?,?,?,?,datetime('now'))
      ON CONFLICT(slug) DO UPDATE SET
        title=excluded.title,
        content_blocks=excluded.content_blocks,
        meta_title=excluded.meta_title,
        meta_description=excluded.meta_description,
        updated_at=datetime('now')`,
    args: [b.slug, b.title || '', contentBlocksJson, b.meta_title || '', b.meta_description || '']
  });

  return NextResponse.json({ ok: true });
}
