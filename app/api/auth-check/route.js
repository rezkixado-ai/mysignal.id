import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth.js';

export async function GET() {
  return NextResponse.json({ authorized: await isAuthorized() });
}
