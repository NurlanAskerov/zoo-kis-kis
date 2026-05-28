import { cookies } from 'next/headers';

const cookieName = 'zoo_admin_session';

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''; 
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || ''; 
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function buildAdminToken() {
  return sha256(`zoo-kis-kis-admin:${getPassword()}:${getSecret()}`);
}

export async function isAdminPassword(password: string) {
  return Boolean(getPassword()) && password === getPassword();
}

export async function isAdminRequest() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  return Boolean(token && token === await buildAdminToken());
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(cookieName, await buildAdminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.set(cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
}
