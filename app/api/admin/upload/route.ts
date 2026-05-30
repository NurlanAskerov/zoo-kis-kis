import { NextResponse } from 'next/server';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { isAdminRequest } from '@/lib/admin-auth';
import { createR2ImageKey, getR2ConfigStatus, hasR2Config, uploadImageBufferToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return applyNoStoreHeaders(NextResponse.json(body, init));
}

async function isAuthorized(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const adminToken = process.env.ADMIN_TOKEN?.trim();

  if (adminToken && token && token === adminToken) return true;
  return isAdminRequest();
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return jsonResponse({ ok: false, message: 'İcazə yoxdur' }, { status: 401 });
  }

  if (!hasR2Config()) {
    return jsonResponse({
      ok: false,
      message: 'R2 env dəyərləri tam deyil',
      config: getR2ConfigStatus()
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ ok: false, message: 'Şəkil seçilməyib' }, { status: 400 });
    }

    const contentType = file.type || 'image/jpeg';
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = createR2ImageKey(file.name, contentType);
    const uploaded = await uploadImageBufferToR2({ buffer, key, contentType });

    return jsonResponse({ ok: true, url: uploaded.url, key: uploaded.key });
  } catch (error) {
    console.error('/api/admin/upload error', error);
    return jsonResponse({
      ok: false,
      message: error instanceof Error ? error.message : 'Şəkil yüklənmədi',
      config: getR2ConfigStatus()
    }, { status: 500 });
  }
}
