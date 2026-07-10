import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCustomFiltersFromDb, upsertCustomFiltersToDb, type AdminCustomFilters } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filters = await getCustomFiltersFromDb();
    return NextResponse.json({ ok: true, filters });
  } catch (error) {
    return NextResponse.json(
      { ok: false, filters: { departments: [], subcategories: [] }, message: error instanceof Error ? error.message : 'Custom filters could not be loaded.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({})) as Partial<AdminCustomFilters>;
    const filters = await upsertCustomFiltersToDb({
      departments: Array.isArray(body.departments) ? body.departments : [],
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : []
    });

    return NextResponse.json({ ok: true, filters });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Custom filters could not be saved.' },
      { status: 500 }
    );
  }
}
