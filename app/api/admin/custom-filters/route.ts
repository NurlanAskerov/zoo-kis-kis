import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCatalogFiltersFromDb, hasDatabaseConfig, saveCatalogFiltersToDb } from '@/lib/db';
import { applyNoStoreHeaders } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return jsonResponse({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filters = await getCatalogFiltersFromDb();
    return jsonResponse({ ok: true, databaseReady: hasDatabaseConfig(), filters });
  } catch (error) {
    console.error('/api/admin/custom-filters GET error', error);
    return jsonResponse({
      ok: false,
      databaseReady: hasDatabaseConfig(),
      filters: { departments: [], subcategories: [] },
      message: error instanceof Error ? error.message : 'Custom filters could not be loaded.'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return jsonResponse({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const filters = await saveCatalogFiltersToDb(body?.filters ?? body);
    return jsonResponse({
      ok: true,
      saved: hasDatabaseConfig(),
      databaseReady: hasDatabaseConfig(),
      filters,
      message: hasDatabaseConfig() ? undefined : 'Database is not configured yet.'
    });
  } catch (error) {
    console.error('/api/admin/custom-filters POST error', error);
    return jsonResponse({
      ok: false,
      saved: false,
      message: error instanceof Error ? error.message : 'Custom filters could not be saved.'
    }, { status: 500 });
  }
}
