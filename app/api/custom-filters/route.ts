import { NextResponse } from 'next/server';
import { getCatalogFiltersFromDb, hasDatabaseConfig } from '@/lib/db';
import { applyNoStoreHeaders } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

export async function GET() {
  try {
    const filters = await getCatalogFiltersFromDb();
    return jsonResponse({ ok: true, databaseReady: hasDatabaseConfig(), filters });
  } catch (error) {
    console.error('/api/custom-filters GET error', error);
    return jsonResponse({
      ok: false,
      databaseReady: hasDatabaseConfig(),
      filters: { departments: [], subcategories: [] },
      message: error instanceof Error ? error.message : 'Custom filters could not be loaded.'
    }, { status: 500 });
  }
}
