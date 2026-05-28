import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { products as fallbackProducts } from '@/lib/data';
import { getProductsFromDb, hasDatabaseConfig, normalizeProduct, upsertProduct } from '@/lib/db';

export async function GET(request: NextRequest) {
  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1' && (await isAdminRequest());
  try {
    const products = await getProductsFromDb(includeInactive);
    return NextResponse.json({ ok: true, databaseReady: hasDatabaseConfig(), products });
  } catch (error) {
    console.error('/api/products error', error);
    const products = includeInactive ? fallbackProducts : fallbackProducts.filter(product => product.active !== false);
    return NextResponse.json({
      ok: false,
      databaseReady: hasDatabaseConfig(),
      products,
      message: error instanceof Error ? error.message : 'Products could not be loaded from database.'
    });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const product = normalizeProduct(body);

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ ok: true, saved: false, product, message: 'Database is not configured yet.' });
  }

  try {
    const savedProduct = await upsertProduct(product);
    return NextResponse.json({ ok: true, saved: true, product: savedProduct });
  } catch (error) {
    console.error('/api/products POST error', error);
    return NextResponse.json({
      ok: false,
      saved: false,
      message: error instanceof Error ? error.message : 'Product could not be saved.'
    }, { status: 500 });
  }
}
