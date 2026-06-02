import { NextResponse, type NextRequest } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/admin-auth';
import { deleteProduct, getProductBySlugFromDb, hasDatabaseConfig, setProductActive } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const wantsInactive = request.nextUrl.searchParams.get('includeInactive') === '1';
  const includeInactive = wantsInactive && (await isAdminRequest());

  try {
    const product = await getProductBySlugFromDb(id, includeInactive);
    if (!product) {
      return jsonResponse({ ok: false, product: null, message: 'Məhsul tapılmadı.' }, { status: 404 });
    }

    return jsonResponse({ ok: true, product });
  } catch (error) {
    console.error('/api/products/[id] GET error', error);
    return jsonResponse({
      ok: false,
      product: null,
      message: error instanceof Error ? error.message : 'Məhsul oxunmadı.'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return jsonResponse({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const active = Boolean(body.active);

  if (!hasDatabaseConfig()) {
    return jsonResponse({ ok: true, saved: false, product: { slug: id, active }, message: 'Database is not configured yet.' });
  }

  try {
    await setProductActive(id, active);
    return jsonResponse({ ok: true, saved: true, product: { slug: id, active } });
  } catch (error) {
    console.error('/api/products/[id] PATCH error', error);
    return jsonResponse({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Status could not be updated.' }, { status: 500 });
  }
}


export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return jsonResponse({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  if (!hasDatabaseConfig()) {
    return jsonResponse({ ok: true, saved: false, deleted: true, product: { slug: id }, message: 'Database is not configured yet.' });
  }

  try {
    await deleteProduct(id);
    return jsonResponse({ ok: true, saved: true, deleted: true, product: { slug: id } });
  } catch (error) {
    console.error('/api/products/[id] DELETE error', error);
    return jsonResponse({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Məhsul silinmədi.' }, { status: 500 });
  }
}
