import { NextResponse } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { clearAdminCookie } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST() {
  await clearAdminCookie();
  return applyNoStoreHeaders(NextResponse.json({ ok: true }));
}
