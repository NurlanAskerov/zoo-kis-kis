import { NextResponse } from 'next/server';
import { getCustomFiltersFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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
