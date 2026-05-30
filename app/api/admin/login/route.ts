import { NextResponse, type NextRequest } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminPassword, setAdminCookie } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';

  if (!(await isAdminPassword(password))) {
    return jsonResponse({ ok: false, message: 'Wrong password' }, { status: 401 });
  }

  await setAdminCookie();
  return jsonResponse({ ok: true });
}
