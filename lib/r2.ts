import { randomUUID } from 'crypto';
import { Agent } from 'https';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const maxFileSize = 8 * 1024 * 1024;

let cachedClient: S3Client | null = null;

function clean(value?: string) {
  return (value || '').trim();
}

export function hasR2Config() {
  return Boolean(
    clean(process.env.R2_ACCOUNT_ID) &&
    clean(process.env.R2_ACCESS_KEY_ID) &&
    clean(process.env.R2_SECRET_ACCESS_KEY) &&
    clean(process.env.R2_BUCKET_NAME) &&
    clean(process.env.R2_PUBLIC_URL)
  );
}

export function getR2ConfigStatus() {
  return {
    R2_ACCOUNT_ID: Boolean(clean(process.env.R2_ACCOUNT_ID)),
    R2_ACCESS_KEY_ID: Boolean(clean(process.env.R2_ACCESS_KEY_ID)),
    R2_SECRET_ACCESS_KEY: Boolean(clean(process.env.R2_SECRET_ACCESS_KEY)),
    R2_BUCKET_NAME: Boolean(clean(process.env.R2_BUCKET_NAME)),
    R2_PUBLIC_URL: Boolean(clean(process.env.R2_PUBLIC_URL)),
    R2_ENDPOINT: clean(process.env.R2_ENDPOINT) || `https://${clean(process.env.R2_ACCOUNT_ID)}.r2.cloudflarestorage.com`
  };
}

function getR2Client() {
  if (!hasR2Config()) {
    throw new Error('R2 env dəyərləri tam deyil. R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME və R2_PUBLIC_URL yoxlanmalıdır.');
  }

  if (!cachedClient) {
    const endpoint = clean(process.env.R2_ENDPOINT) || `https://${clean(process.env.R2_ACCOUNT_ID)}.r2.cloudflarestorage.com`;

    cachedClient = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: clean(process.env.R2_ACCESS_KEY_ID),
        secretAccessKey: clean(process.env.R2_SECRET_ACCESS_KEY)
      },
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 15_000,
        socketTimeout: 120_000,
        httpsAgent: new Agent({ keepAlive: false, maxSockets: 3 })
      }),
      maxAttempts: 2
    });
  }

  return cachedClient;
}

function extensionFromContentType(contentType: string) {
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/gif') return 'gif';
  if (contentType === 'image/svg+xml') return 'svg';
  return 'jpg';
}

function safeName(value: string) {
  return value
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 54) || 'product-image';
}

export function createR2ImageKey(fileName: string, contentType: string) {
  const ext = extensionFromContentType(contentType);
  return `products/${Date.now()}-${randomUUID()}-${safeName(fileName)}.${ext}`;
}

function publicUrlForKey(key: string) {
  const base = clean(process.env.R2_PUBLIC_URL).replace(/\/$/, '');
  const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/');
  return `${base}/${encodedKey}`;
}

export async function uploadImageBufferToR2({
  buffer,
  key,
  contentType
}: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) {
  if (!allowedImageTypes.has(contentType)) {
    throw new Error('Bu fayl şəkil formatı kimi tanınmadı. JPG, PNG və ya WebP seçin. iPhone HEIC/Live Photo fayllarını əvvəl JPG/WebP kimi export edin.');
  }

  if (buffer.byteLength > maxFileSize) {
    throw new Error('Şəkil çox böyükdür. Optimizasiyadan sonra maksimum 8MB olmalıdır.');
  }

  try {
    await getR2Client().send(new PutObjectCommand({
      Bucket: clean(process.env.R2_BUCKET_NAME),
      Key: key,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable'
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'R2 upload xətası';
    if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|network|socket|read/i.test(message)) {
      throw new Error('Cloudflare R2 bağlantısı kəsildi. Localda VPN/proxy varsa söndürüb yoxlayın. Production/Vercel-də test edin. Detal: ' + message);
    }
    throw new Error(`R2 upload alınmadı. R2 Account ID, Access Key, Secret Key, bucket adı və public URL dəyərlərini yoxlayın. Detal: ${message}`);
  }

  return { key, url: publicUrlForKey(key) };
}

export async function uploadImageToR2(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'image/jpeg';
  const key = createR2ImageKey(file.name, contentType);
  return uploadImageBufferToR2({ buffer, key, contentType });
}
