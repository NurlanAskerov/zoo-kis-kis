import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { hasDatabaseConfig, setProductActive } from '@/lib/db';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const active = Boolean(body.active);

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ ok: true, saved: false, product: { slug: id, active }, message: 'Database is not configured yet.' });
  }

  try {
    await setProductActive(id, active);
    return NextResponse.json({ ok: true, saved: true, product: { slug: id, active } });
  } catch (error) {
    console.error('/api/products/[id] PATCH error', error);
    return NextResponse.json({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Status could not be updated.' }, { status: 500 });
  }
}
