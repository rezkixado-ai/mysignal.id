import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db.js';

export const dynamic = 'force-dynamic';

// Cek cepat: 8 artikel terbaru di DB yang dibaca situs ini.
export async function GET() {
  try {
    const r = await db().execute(
      'SELECT id, title, slug, is_published, typeof(is_published) AS t, published_at FROM articles ORDER BY id DESC LIMIT 8'
    );
    const host = (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, '').split('.')[0];
    return NextResponse.json({ db: host, rows: r.rows });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
