import { NextResponse } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET() {
  if (!(await isAdminRequest())) return jsonResponse({ message: 'Unauthorized' }, { status: 401 });
  return jsonResponse({ orders: [], message: 'Sifarişlər database-də saxlanmır. Müştəri sifarişləri WhatsApp-a göndərir.' });
}
