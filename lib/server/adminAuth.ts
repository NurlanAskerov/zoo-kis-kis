import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export const adminCookieName = 'zoo_kis_kis_admin';

function getExpectedPassword() {
  return process.env.ADMIN_PASSWORD || 'zookiskis-admin';
}

function getSessionToken() {
  return process.env.ADMIN_SESSION_SECRET || getExpectedPassword();
}

export async function isAdminRequest(request?: NextRequest) {
  const token = request?.cookies.get(adminCookieName)?.value ?? (await cookies()).get(adminCookieName)?.value;
  return Boolean(token && token === getSessionToken());
}

export function validateAdminPassword(password: string) {
  return password === getExpectedPassword();
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set(adminCookieName, getSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return response;
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(adminCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return response;
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}
