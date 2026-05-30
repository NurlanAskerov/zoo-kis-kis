import { NextResponse, type NextRequest } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/server/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  return applyNoStoreHeaders(NextResponse.json({ ok: await isAdminRequest(request) }));
}
