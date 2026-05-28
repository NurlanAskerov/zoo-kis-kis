import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminRequest() });
}
