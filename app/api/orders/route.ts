import { NextResponse } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST() {
  return applyNoStoreHeaders(NextResponse.json({
    ok: true,
    saved: false,
    message: 'Orders are sent directly through WhatsApp and are not stored in the database.'
  }));
}
