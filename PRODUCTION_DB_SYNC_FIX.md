# Local admin -> production product sync fix

Problem:
- The production CatalogProvider loaded `/api/products` only once and retained that product list for the whole browser session.
- ProductDetailClient did not request `/api/products/[slug]` when the product already existed in the catalog context, so stale context data always won.
- The DB layer also kept public product reads in process memory for 30 seconds. A local write cannot clear a different Vercel function instance's memory.

Fix:
- ProductDetailClient now always requests the current product by slug and the API result overrides catalog context data.
- Product data refreshes when the page opens, returns from browser history, regains focus, or becomes visible.
- CatalogProvider refreshes the public list on mount/focus/pageshow/visibility.
- Requests use `cache: no-store`, a timestamp query, and no-cache request headers.
- Public DB runtime caching defaults to 0 ms.

Vercel:
- Delete `PUBLIC_PRODUCTS_RUNTIME_CACHE_MS` if it has a positive value, or set it to `0` for Production, Preview, and Development.
- Confirm Production uses the same `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` as local.
