import { NextResponse, type NextRequest } from 'next/server';
import { isAdminPassword, setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';

  if (!(await isAdminPassword(password))) {
    return NextResponse.json({ ok: false, message: 'Wrong password' }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
