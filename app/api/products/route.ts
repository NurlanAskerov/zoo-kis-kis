import { NextResponse, type NextRequest } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/admin-auth';
import { getProductsFromDb, hasDatabaseConfig, normalizeProduct, upsertProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET(request: NextRequest) {
  const wantsInactive = request.nextUrl.searchParams.get('includeInactive') === '1';
  const includeInactive = wantsInactive && (await isAdminRequest());

  try {
    const products = await getProductsFromDb(includeInactive);
    return jsonResponse(
      { ok: true, databaseReady: hasDatabaseConfig(), products },
      undefined
    );
  } catch (error) {
    console.error('/api/products error', error);
    return jsonResponse({
      ok: false,
      databaseReady: hasDatabaseConfig(),
      products: [],
      message: error instanceof Error ? error.message : 'Products could not be loaded from database.'
    });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return jsonResponse({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const product = normalizeProduct(body);

  if (!hasDatabaseConfig()) {
    return jsonResponse({ ok: true, saved: false, product, message: 'Database is not configured yet.' });
  }

  try {
    const savedProduct = await upsertProduct(product);
    return jsonResponse({ ok: true, saved: true, product: savedProduct });
  } catch (error) {
    console.error('/api/products POST error', error);
    return jsonResponse({
      ok: false,
      saved: false,
      message: error instanceof Error ? error.message : 'Product could not be saved.'
    }, { status: 500 });
  }
}
