export const NO_STORE_CACHE_CONTROL = 'private, no-store, no-cache, max-age=0, must-revalidate';

export function applyNoStoreHeaders<T extends Response>(response: T): T {
  response.headers.set('Cache-Control', NO_STORE_CACHE_CONTROL);
  response.headers.set('CDN-Cache-Control', 'no-store');
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
