import { NextResponse } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/admin-auth';
import { products as fallbackProducts } from '@/lib/data';
import { deleteProduct, getProductsFromDb, hasDatabaseConfig, normalizeProduct, setProductActive, upsertProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET() {
  if (!(await isAdminRequest())) return jsonResponse({ message: 'Unauthorized' }, { status: 401 });
  try {
    const products = await getProductsFromDb(true);
    return jsonResponse({ products, databaseReady: hasDatabaseConfig() });
  } catch (error) {
    console.error('/api/admin/products GET error', error);
    return jsonResponse({
      products: fallbackProducts,
      databaseReady: hasDatabaseConfig(),
      message: error instanceof Error ? error.message : 'Products could not be loaded from database.'
    });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return jsonResponse({ message: 'Unauthorized' }, { status: 401 });
  const product = normalizeProduct(await request.json());
  if (!hasDatabaseConfig()) return jsonResponse({ ok: true, saved: false, product });
  try {
    return jsonResponse({ ok: true, saved: true, product: await upsertProduct(product) });
  } catch (error) {
    console.error('/api/admin/products POST error', error);
    return jsonResponse({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Product could not be saved.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return jsonResponse({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.slug) return jsonResponse({ message: 'slug required' }, { status: 400 });
  if (!hasDatabaseConfig()) return jsonResponse({ ok: true, saved: false });
  await setProductActive(String(body.slug), Boolean(body.active));
  return jsonResponse({ ok: true, saved: true });
}


export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) return jsonResponse({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!body.slug) return jsonResponse({ ok: false, message: 'slug required' }, { status: 400 });
  if (!hasDatabaseConfig()) return jsonResponse({ ok: true, saved: false, deleted: true });
  try {
    await deleteProduct(String(body.slug));
    return jsonResponse({ ok: true, saved: true, deleted: true });
  } catch (error) {
    console.error('/api/admin/products DELETE error', error);
    return jsonResponse({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Product could not be deleted.' }, { status: 500 });
  }
}
