import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ orders: [], message: 'Sifarişlər database-də saxlanmır. Müştəri sifarişləri WhatsApp-a göndərir.' });
}
