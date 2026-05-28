import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/server/adminAuth';

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: await isAdminRequest(request) });
}
