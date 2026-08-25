import { NextResponse } from 'next/server';
import { createSession } from '../../../lib/auth.js';

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
