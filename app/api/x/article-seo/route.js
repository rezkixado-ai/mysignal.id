import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db.js';
import { isAuthorized } from '../../../../lib/auth.js';
import { ensureSchema } from '../../../../lib/xschema.js';

export const dynamic = 'force-dynamic';

async function guard() {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  try { await ensureSchema(); } catch (e) { return NextResponse.json({ error: `Database belum siap: ${e.message}` }, { status: 500 }); }
  return null;
}
const clean = (v, n = 500) => String(v ?? '').trim().slice(0, n);

// GET ?id=…  → pengaturan SEO lanjutan satu artikel
export async function GET(request) {
  const bad = await guard(); if (bad) return bad;
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  const r = await db().execute({ sql: 'SELECT noindex, canonical, og_title, og_description, og_image FROM article_seo WHERE article_id = ?', args: [id] });
  const row = r.rows[0] ? { ...r.rows[0] } : {};
  return NextResponse.json({ noindex: Number(row.noindex) || 0, canonical: row.canonical || '', og_title: row.og_title || '', og_description: row.og_description || '', og_image: row.og_image || '' });
}

// PUT { id, noindex, canonical, og_*  }            → simpan SEO lanjutan
// PUT { redirect: { from, to } }                    → catat redirect 301 saat slug diganti
export async function PUT(request) {
  const bad = await guard(); if (bad) return bad;
  const body = await request.json().catch(() => ({}));

  if (body.redirect) {
    const from = clean(body.redirect.from, 200); const to = clean(body.redirect.to, 200);
    if (!from || !to || from === to) return NextResponse.json({ ok: true, skipped: true });
    // rantai: yang tadinya menuju `from` ikut diarahkan ke `to`; kalau `to` pernah jadi slug lama, hapus.
    await db().execute({ sql: 'UPDATE article_redirects SET new_slug = ? WHERE new_slug = ?', args: [to, from] });
    await db().execute({ sql: 'DELETE FROM article_redirects WHERE old_slug = ?', args: [to] });
    await db().execute({ sql: 'INSERT INTO article_redirects (old_slug, new_slug) VALUES (?, ?) ON CONFLICT(old_slug) DO UPDATE SET new_slug = excluded.new_slug', args: [from, to] });
    return NextResponse.json({ ok: true });
  }

  const id = clean(body.id, 80);
  if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });
  const canonical = clean(body.canonical, 400);
  if (canonical && !/^(https?:\/\/|\/)/i.test(canonical)) return NextResponse.json({ error: 'Canonical harus berupa URL (https://…) atau path (/article/…)' }, { status: 400 });
  await db().execute({
    sql: `INSERT INTO article_seo (article_id, noindex, canonical, og_title, og_description, og_image) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(article_id) DO UPDATE SET noindex = excluded.noindex, canonical = excluded.canonical, og_title = excluded.og_title, og_description = excluded.og_description, og_image = excluded.og_image`,
    args: [id, body.noindex ? 1 : 0, canonical, clean(body.og_title, 120), clean(body.og_description, 300), clean(body.og_image, 500)]
  });
  return NextResponse.json({ ok: true });
}
