import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, saved: false, message: 'Orders are sent directly through WhatsApp and are not stored in the database.' });
}
