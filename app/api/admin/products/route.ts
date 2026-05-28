import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { products as fallbackProducts } from '@/lib/data';
import { getProductsFromDb, hasDatabaseConfig, normalizeProduct, setProductActive, upsertProduct } from '@/lib/db';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const products = await getProductsFromDb(true);
    return NextResponse.json({ products, databaseReady: hasDatabaseConfig() });
  } catch (error) {
    console.error('/api/admin/products GET error', error);
    return NextResponse.json({
      products: fallbackProducts,
      databaseReady: hasDatabaseConfig(),
      message: error instanceof Error ? error.message : 'Products could not be loaded from database.'
    });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const product = normalizeProduct(await request.json());
  if (!hasDatabaseConfig()) return NextResponse.json({ ok: true, saved: false, product });
  try {
    return NextResponse.json({ ok: true, saved: true, product: await upsertProduct(product) });
  } catch (error) {
    console.error('/api/admin/products POST error', error);
    return NextResponse.json({ ok: false, saved: false, message: error instanceof Error ? error.message : 'Product could not be saved.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.slug) return NextResponse.json({ message: 'slug required' }, { status: 400 });
  if (!hasDatabaseConfig()) return NextResponse.json({ ok: true, saved: false });
  await setProductActive(String(body.slug), Boolean(body.active));
  return NextResponse.json({ ok: true, saved: true });
}
