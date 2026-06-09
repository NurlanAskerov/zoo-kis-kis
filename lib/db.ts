import { createClient } from '@libsql/client';
import {
  getDepartmentForProductType,
  products,
  type AudienceKey,
  type Lang,
  type Product,
  type ProductVariant,
  type ProductCollectionKey,
  type ProductTypeKey,
  type StockKey
} from './data';

let cachedClient: ReturnType<typeof createClient> | null = null;
let cachedSchemaMode: 'wide' | 'legacy' | null = null;

const langs: Lang[] = ['az', 'en', 'ru'];
const validProductTypes = new Set<ProductTypeKey>([
  'dryFood',
  'wetFood',
  'treat',
  'toy',
  'bowl',
  'toilet',
  'litter',
  'bed',
  'leash',
  'carrier',
  'aquarium',
  'cage',
  'grooming',
  'care'
]);
const validAudiences = new Set<AudienceKey>(['cats', 'dogs', 'birds', 'fish', 'hamsters', 'allPets']);
const validCollections = new Set<ProductCollectionKey>(['discount', 'popular', 'new']);
const validStocks = new Set<StockKey>(['inStock', 'lowStock', 'preOrder']);

const hiddenProductionDetailPhrases = [
  'admin paneldən əlavə olunub',
  'filter və stok məlumatları seçilib',
  'filter ve stok melumatlari secilib',
  'filtr və stok məlumatları seçilib',
  'added from admin panel',
  'filter and stock data selected',
  'добавлено через админ-панель',
  'фильтры и статус наличия выбраны'
];

function normalizeHiddenDetail(value: string) {
  return value
    .toLocaleLowerCase('az-AZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[əә]/g, 'e')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[ğ]/g, 'g')
    .replace(/[ş]/g, 's')
    .replace(/[ç]/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanProductDetails(details?: Partial<Record<Lang, string[]>>) {
  return langs.reduce((acc, lang) => {
    const items = Array.isArray(details?.[lang]) ? details[lang] : [];
    acc[lang] = items
      .map(item => String(item || '').trim())
      .filter(Boolean)
      .filter(item => {
        const normalized = normalizeHiddenDetail(item);
        return !hiddenProductionDetailPhrases.some(phrase => normalized.includes(normalizeHiddenDetail(phrase)));
      });
    return acc;
  }, {} as Record<Lang, string[]>);
}


function cleanProductVariants(variants?: ProductVariant[]) {
  if (!Array.isArray(variants)) return undefined;

  const cleaned: ProductVariant[] = [];

  variants.forEach((variant, index) => {
    const labelAz = String(variant?.label?.az || '').trim();
    const fallback = labelAz || String(variant?.label?.en || '').trim() || String(variant?.label?.ru || '').trim();
    const price = Number(variant?.price || 0);
    const oldPrice = Number(variant?.oldPrice || 0);
    const stock = validStocks.has(variant?.stock as StockKey) ? variant?.stock as StockKey : 'inStock';

    if (!fallback || !Number.isFinite(price) || price <= 0) return;

    cleaned.push({
      id: String(variant?.id || fallback || `variant-${index + 1}`).trim().replace(/\s+/g, '-'),
      label: {
        az: labelAz || fallback,
        en: String(variant?.label?.en || fallback).trim() || fallback,
        ru: String(variant?.label?.ru || fallback).trim() || fallback
      },
      price,
      oldPrice: Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : undefined,
      stock
    });
  });

  return cleaned.length ? cleaned : undefined;
}

type PublicProductsRuntimeCache = {
  expiresAt: number;
  products: Product[];
};

type PublicProductRuntimeCache = {
  expiresAt: number;
  product?: Product;
};

const DEFAULT_PUBLIC_PRODUCTS_RUNTIME_CACHE_MS = 30_000;
let publicProductsRuntimeCache: PublicProductsRuntimeCache | null = null;
const publicProductBySlugRuntimeCache = new Map<string, PublicProductRuntimeCache>();

function getPublicProductsRuntimeCacheMs() {
  const configuredTtl = Number(process.env.PUBLIC_PRODUCTS_RUNTIME_CACHE_MS);
  return Number.isFinite(configuredTtl) && configuredTtl >= 0 ? configuredTtl : DEFAULT_PUBLIC_PRODUCTS_RUNTIME_CACHE_MS;
}

function getCachedPublicProducts() {
  const ttl = getPublicProductsRuntimeCacheMs();
  if (ttl <= 0 || !publicProductsRuntimeCache) return null;

  if (publicProductsRuntimeCache.expiresAt <= Date.now()) {
    publicProductsRuntimeCache = null;
    publicProductBySlugRuntimeCache.clear();
    return null;
  }

  return publicProductsRuntimeCache.products;
}

function setCachedPublicProducts(products: Product[]) {
  const ttl = getPublicProductsRuntimeCacheMs();
  if (ttl <= 0) return;

  const expiresAt = Date.now() + ttl;
  publicProductsRuntimeCache = { products, expiresAt };
  publicProductBySlugRuntimeCache.clear();

  for (const product of products) {
    publicProductBySlugRuntimeCache.set(product.slug, { product, expiresAt });
  }
}

function getCachedPublicProductBySlug(slug: string): { hit: boolean; product?: Product } {
  const cachedList = getCachedPublicProducts();
  if (cachedList) {
    return { hit: true, product: cachedList.find(product => product.slug === slug) };
  }

  const ttl = getPublicProductsRuntimeCacheMs();
  const cachedProduct = ttl > 0 ? publicProductBySlugRuntimeCache.get(slug) : undefined;

  if (!cachedProduct) return { hit: false };

  if (cachedProduct.expiresAt <= Date.now()) {
    publicProductBySlugRuntimeCache.delete(slug);
    return { hit: false };
  }

  return { hit: true, product: cachedProduct.product };
}

function setCachedPublicProductBySlug(slug: string, product?: Product) {
  const ttl = getPublicProductsRuntimeCacheMs();
  if (ttl <= 0) return;

  publicProductBySlugRuntimeCache.set(slug, { product, expiresAt: Date.now() + ttl });
}

export function clearProductRuntimeCache() {
  publicProductsRuntimeCache = null;
  publicProductBySlugRuntimeCache.clear();
}

export function hasDatabaseConfig() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function getTursoClient() {
  if (!hasDatabaseConfig()) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.');
  }

  if (!cachedClient) {
    cachedClient = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    });
  }

  return cachedClient;
}

export const createTablesSql = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,

    name_az TEXT NOT NULL,
    name_en TEXT,
    name_ru TEXT,

    short_description_az TEXT,
    short_description_en TEXT,
    short_description_ru TEXT,

    description_az TEXT,
    description_en TEXT,
    description_ru TEXT,

    audience TEXT NOT NULL,
    department TEXT NOT NULL,
    subcategory TEXT NOT NULL,

    brand TEXT,
    sku TEXT,
    barcode TEXT,

    price REAL NOT NULL,
    old_price REAL,
    currency TEXT NOT NULL DEFAULT 'AZN',

    image_url TEXT,
    images_json TEXT,

    stock_quantity INTEGER DEFAULT 0,
    stock_status TEXT NOT NULL DEFAULT 'in_stock',

    badge_az TEXT,
    badge_en TEXT,
    badge_ru TEXT,

    is_new INTEGER NOT NULL DEFAULT 0,
    is_popular INTEGER NOT NULL DEFAULT 0,
    is_discounted INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,

    weight_value REAL,
    weight_unit TEXT,
    package_size TEXT,
    age_group TEXT,
    breed_size TEXT,
    flavor TEXT,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    country TEXT,

    meta_title TEXT,
    meta_description TEXT,
    extra_json TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    alt_az TEXT,
    alt_en TEXT,
    alt_ru TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_main INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS product_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_active ON products(active)`,
  `CREATE INDEX IF NOT EXISTS idx_products_audience ON products(audience)`,
  `CREATE INDEX IF NOT EXISTS idx_products_department ON products(department)`,
  `CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory)`,
  `CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`,
  `CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular)`,
  `CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new)`,
  `CREATE INDEX IF NOT EXISTS idx_products_discounted ON products(is_discounted)`,
  `CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id)`
];

export async function ensureDatabase() {
  if (!hasDatabaseConfig()) return false;
  const db = getTursoClient();
  for (const sql of createTablesSql) await db.execute(sql);

  const columns = await tableColumns('products');
  if (!columns.includes('image_url')) await db.execute('ALTER TABLE products ADD COLUMN image_url TEXT');
  if (!columns.includes('images_json')) await db.execute('ALTER TABLE products ADD COLUMN images_json TEXT');

  cachedSchemaMode = 'wide';
  return true;
}

async function tableColumns(table: string) {
  const result = await getTursoClient().execute(`PRAGMA table_info(${table})`);
  return result.rows.map(row => String((row as Record<string, unknown>).name));
}

async function getProductSchemaMode(): Promise<'wide' | 'legacy'> {
  if (cachedSchemaMode) return cachedSchemaMode;
  if (!hasDatabaseConfig()) return 'wide';

  const db = getTursoClient();
  const tableCheck = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`);
  if (!tableCheck.rows.length) {
    await ensureDatabase();
    return 'wide';
  }

  const columns = await tableColumns('products');
  cachedSchemaMode = columns.includes('payload') ? 'legacy' : 'wide';

  if (cachedSchemaMode === 'wide') {
    await ensureDatabase();
  }

  return cachedSchemaMode;
}

function localized(az: unknown, en?: unknown, ru?: unknown): Record<Lang, string> {
  const main = String(az || '').trim();
  return {
    az: main,
    en: String(en || main).trim() || main,
    ru: String(ru || main).trim() || main
  };
}

function localizedOptional(az: unknown, en?: unknown, ru?: unknown) {
  const text = localized(az, en, ru);
  return text.az ? text : undefined;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9əöğüşıçа-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;
}

function categoryKeyFromType(typeKey: ProductTypeKey) {
  const map: Partial<Record<ProductTypeKey, string>> = {
    dryFood: 'dry-food',
    wetFood: 'wet-food',
    treat: 'treats',
    toy: 'toys',
    bowl: 'bowls',
    toilet: 'toilets',
    litter: 'litter',
    bed: 'beds',
    leash: 'leashes',
    carrier: 'carriers',
    aquarium: 'aquariums',
    cage: 'dog-cages',
    grooming: 'grooming',
    care: 'care'
  };
  return map[typeKey] ?? 'care';
}

function parseAudiences(value: unknown): AudienceKey[] {
  const values = String(value || 'allPets')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item === 'all' ? 'allPets' : item) as AudienceKey[];
  const filtered = values.filter(item => validAudiences.has(item));
  return filtered.length ? filtered : ['allPets'];
}

function stockFromDb(value: unknown): StockKey {
  const stock = String(value || 'in_stock');
  const map: Record<string, StockKey> = {
    in_stock: 'inStock',
    low_stock: 'lowStock',
    preorder: 'preOrder',
    pre_order: 'preOrder',
    out_of_stock: 'preOrder',
    inStock: 'inStock',
    lowStock: 'lowStock',
    preOrder: 'preOrder'
  };
  const mapped = map[stock] || 'inStock';
  return validStocks.has(mapped) ? mapped : 'inStock';
}

function stockToDb(value: StockKey) {
  if (value === 'lowStock') return 'low_stock';
  if (value === 'preOrder') return 'preorder';
  return 'in_stock';
}

function typeFromDb(value: unknown): ProductTypeKey {
  const raw = String(value || 'care');
  if (validProductTypes.has(raw as ProductTypeKey)) return raw as ProductTypeKey;

  const map: Record<string, ProductTypeKey> = {
    'dry-food': 'dryFood',
    'wet-food': 'wetFood',
    treats: 'treat',
    treat: 'treat',
    toys: 'toy',
    toy: 'toy',
    bowls: 'bowl',
    bowl: 'bowl',
    toilet: 'toilet',
    toilets: 'toilet',
    litter: 'litter',
    beds: 'bed',
    bed: 'bed',
    leashes: 'leash',
    leash: 'leash',
    carrier: 'carrier',
    carriers: 'carrier',
    aquarium: 'aquarium',
    aquariums: 'aquarium',
    cage: 'cage',
    cages: 'cage',
    grooming: 'grooming',
    care: 'care'
  };
  return map[raw] || 'care';
}

function collectionsFromRow(row: Record<string, unknown>): ProductCollectionKey[] {
  const collections: ProductCollectionKey[] = [];
  if (Number(row.is_discounted || 0) === 1 || Number(row.old_price || 0) > Number(row.price || 0)) collections.push('discount');
  if (Number(row.is_popular || 0) === 1) collections.push('popular');
  if (Number(row.is_new || 0) === 1) collections.push('new');

  const extra = safeJson(row.extra_json);
  if (Array.isArray(extra.collections)) {
    extra.collections.forEach((item: unknown) => {
      const key = String(item) as ProductCollectionKey;
      if (validCollections.has(key) && !collections.includes(key)) collections.push(key);
    });
  }

  return collections;
}

function safeJson(value: unknown): Record<string, any> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseImagesJson(value: unknown) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(item => String(item || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getString(row: Record<string, unknown>, key: string) {
  return String(row[key] || '').trim();
}

export function normalizeProduct(input: Partial<Product>): Product {
  const fallback = products[0];
  const nameAz = String(input.name?.az || '').trim() || 'Yeni məhsul';
  const slug = String(input.slug || nameAz || `product-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9əöğüşıçа-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;

  const image = input.image || input.images?.[0] || '/products/cat-food.svg';
  const typeKey = validProductTypes.has(input.typeKey as ProductTypeKey) ? input.typeKey as ProductTypeKey : fallback.typeKey;

  const normalizedAudiences: AudienceKey[] = (input.audiences ?? [])
    .filter((item): item is AudienceKey => validAudiences.has(item as AudienceKey));

  const normalizedCollections: ProductCollectionKey[] = (input.collections ?? [])
    .filter((item): item is ProductCollectionKey => validCollections.has(item as ProductCollectionKey));

  const normalizedVariants = cleanProductVariants(input.variants);

  return {
    id: input.id || slug,
    slug,
    name: input.name ?? { az: nameAz, en: nameAz, ru: nameAz },
    categoryKey: input.categoryKey || categoryKeyFromType(typeKey),
    typeKey,
    audiences: normalizedAudiences.length ? normalizedAudiences : ['allPets'],
    collections: normalizedCollections,
    price: Number(input.price || normalizedVariants?.[0]?.price || 0),
    oldPrice: input.oldPrice ? Number(input.oldPrice) : undefined,
    variants: normalizedVariants,
    image,
    images: input.images?.length ? input.images : [image],
    badge: input.badge,
    stock: input.stock || 'inStock',
    description: input.description ?? { az: '', en: '', ru: '' },
    details: cleanProductDetails(input.details),
    active: input.active !== false
  };
}

function legacyProductFromRow(row: Record<string, unknown>): Product | null {
  try {
    const payload = JSON.parse(String(row.payload || '{}')) as Partial<Product>;
    return normalizeProduct({ ...payload, active: Number(row.active ?? 1) === 1 });
  } catch {
    return null;
  }
}

async function getImagesMap(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.map(id => String(id || '').trim()).filter(Boolean)));
  const map = new Map<string, string[]>();

  if (!uniqueIds.length) return map;

  const placeholders = uniqueIds.map(() => '?').join(',');
  const result = await getTursoClient().execute({
    sql: `SELECT product_id, image_url FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_main DESC, sort_order ASC, id ASC`,
    args: uniqueIds
  });

  result.rows.forEach(row => {
    const data = row as Record<string, unknown>;
    const productId = String(data.product_id || '').trim();
    const imageUrl = String(data.image_url || '').trim();
    if (!productId || !imageUrl) return;

    const existing = map.get(productId) ?? [];
    existing.push(imageUrl);
    map.set(productId, existing);
  });

  return map;
}

function wideProductFromRow(row: Record<string, unknown>, imagesMap = new Map<string, string[]>()): Product {
  const typeKey = typeFromDb(row.subcategory);
  const tableImages = imagesMap.get(String(row.id || row.slug)) ?? [];
  const jsonImages = parseImagesJson(row.images_json);
  const imageUrl = getString(row, 'image_url');
  const images = tableImages.length ? tableImages : (jsonImages.length ? jsonImages : (imageUrl ? [imageUrl] : []));
  const mainImage = images[0] || '/products/cat-food.svg';
  const extra = safeJson(row.extra_json);
  const detailsFromExtra = extra.details && typeof extra.details === 'object' ? extra.details : undefined;
  const details = langs.reduce((acc, lang) => {
    const extraItems = Array.isArray(detailsFromExtra?.[lang]) ? detailsFromExtra[lang] : [];
    acc[lang] = extraItems.length ? extraItems : [
      getString(row, 'brand') ? `Marka: ${getString(row, 'brand')}` : '',
      getString(row, 'package_size') ? `Ölçü: ${getString(row, 'package_size')}` : '',
      getString(row, 'flavor') ? `Dad/tərkib: ${getString(row, 'flavor')}` : ''
    ].filter(Boolean);
    return acc;
  }, {} as Record<Lang, string[]>);

  return normalizeProduct({
    id: String(row.id || row.slug),
    slug: getString(row, 'slug') || slugify(getString(row, 'name_az')),
    name: localized(row.name_az, row.name_en, row.name_ru),
    categoryKey: categoryKeyFromType(typeKey),
    typeKey,
    audiences: parseAudiences(row.audience),
    collections: collectionsFromRow(row),
    price: Number(row.price || 0),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    image: mainImage,
    images,
    badge: localizedOptional(row.badge_az, row.badge_en, row.badge_ru),
    stock: stockFromDb(row.stock_status),
    active: Number(row.active ?? 1) === 1,
    description: localized(row.description_az || row.short_description_az, row.description_en || row.short_description_en, row.description_ru || row.short_description_ru),
    details,
    variants: cleanProductVariants(extra.variants as ProductVariant[] | undefined)
  });
}

export async function getProductsFromDb(includeInactive = false) {
  if (!hasDatabaseConfig()) return [];

  if (!includeInactive) {
    const cachedProducts = getCachedPublicProducts();
    if (cachedProducts) return cachedProducts;
  }

  const mode = await getProductSchemaMode();
  let productList: Product[];

  if (mode === 'legacy') {
    const result = await getTursoClient().execute('SELECT payload, active FROM products ORDER BY updated_at DESC');
    const dbProducts = result.rows
      .map(row => legacyProductFromRow(row as Record<string, unknown>))
      .filter((product): product is Product => Boolean(product));
    productList = includeInactive ? dbProducts : dbProducts.filter(product => product.active !== false);
  } else {
    const result = await getTursoClient().execute('SELECT * FROM products ORDER BY sort_order ASC, updated_at DESC');
    const rows = result.rows.map(row => row as Record<string, unknown>);
    const imageIds = rows.map(row => String(row.id || row.slug || '').trim()).filter(Boolean);
    const imagesMap = await getImagesMap(imageIds);
    const dbProducts = rows.map(row => wideProductFromRow(row, imagesMap));
    const normalized = dbProducts.filter(Boolean);
    productList = includeInactive ? normalized : normalized.filter(product => product.active !== false);
  }

  if (!includeInactive) setCachedPublicProducts(productList);

  return productList;
}

export async function getAllProductsForAdmin() {
  return getProductsFromDb(true);
}

export async function getProductBySlugFromDb(slug: string, includeInactive = true): Promise<Product | undefined> {
  const cleanSlug = String(slug || '').trim();
  if (!cleanSlug) return undefined;

  if (!hasDatabaseConfig()) {
    return undefined;
  }

  if (!includeInactive) {
    const cachedProduct = getCachedPublicProductBySlug(cleanSlug);
    if (cachedProduct.hit) return cachedProduct.product;
  }

  const mode = await getProductSchemaMode();

  if (mode === 'legacy') {
    const result = await getTursoClient().execute({
      sql: 'SELECT payload, active FROM products WHERE slug = ? LIMIT 1',
      args: [cleanSlug]
    });
    const product = result.rows[0] ? legacyProductFromRow(result.rows[0] as Record<string, unknown>) ?? undefined : undefined;
    const visibleProduct = includeInactive ? product : (product?.active === false ? undefined : product);
    if (!includeInactive) setCachedPublicProductBySlug(cleanSlug, visibleProduct);
    return visibleProduct;
  }

  const result = await getTursoClient().execute({
    sql: 'SELECT * FROM products WHERE slug = ? LIMIT 1',
    args: [cleanSlug]
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    if (!includeInactive) setCachedPublicProductBySlug(cleanSlug);
    return undefined;
  }

  const productId = String(row.id || row.slug || '').trim();
  const imagesMap = await getImagesMap(productId ? [productId] : []);
  const product = wideProductFromRow(row, imagesMap);
  const visibleProduct = includeInactive ? product : (product.active === false ? undefined : product);

  if (!includeInactive) setCachedPublicProductBySlug(cleanSlug, visibleProduct);

  return visibleProduct;
}

async function upsertLegacyProduct(product: Product) {
  const normalized = normalizeProduct(product);
  const payload = JSON.stringify(normalized);
  await getTursoClient().execute({
    sql: `INSERT INTO products (slug, payload, active, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(slug) DO UPDATE SET
            payload = excluded.payload,
            active = excluded.active,
            updated_at = CURRENT_TIMESTAMP`,
    args: [normalized.slug, payload, normalized.active === false ? 0 : 1]
  });
  clearProductRuntimeCache();
  return normalized;
}

export async function upsertProduct(product: Product) {
  if (!hasDatabaseConfig()) return normalizeProduct(product);

  const mode = await getProductSchemaMode();
  if (mode === 'legacy') return upsertLegacyProduct(product);

  const normalized = normalizeProduct(product);
  const productId = normalized.slug;
  const department = getDepartmentForProductType(normalized.typeKey);
  const collections = normalized.collections ?? [];
  const badge = normalized.badge ?? { az: '', en: '', ru: '' };
  const extra = {
    categoryKey: normalized.categoryKey,
    collections,
    details: normalized.details,
    variants: normalized.variants ?? []
  };

  await getTursoClient().execute({
    sql: `INSERT INTO products (
            id, slug, active, name_az, name_en, name_ru,
            short_description_az, short_description_en, short_description_ru,
            description_az, description_en, description_ru,
            audience, department, subcategory,
            price, old_price, image_url, images_json, stock_status,
            badge_az, badge_en, badge_ru,
            is_new, is_popular, is_discounted, is_featured,
            extra_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            slug = excluded.slug,
            active = excluded.active,
            name_az = excluded.name_az,
            name_en = excluded.name_en,
            name_ru = excluded.name_ru,
            short_description_az = excluded.short_description_az,
            short_description_en = excluded.short_description_en,
            short_description_ru = excluded.short_description_ru,
            description_az = excluded.description_az,
            description_en = excluded.description_en,
            description_ru = excluded.description_ru,
            audience = excluded.audience,
            department = excluded.department,
            subcategory = excluded.subcategory,
            price = excluded.price,
            old_price = excluded.old_price,
            image_url = excluded.image_url,
            images_json = excluded.images_json,
            stock_status = excluded.stock_status,
            badge_az = excluded.badge_az,
            badge_en = excluded.badge_en,
            badge_ru = excluded.badge_ru,
            is_new = excluded.is_new,
            is_popular = excluded.is_popular,
            is_discounted = excluded.is_discounted,
            is_featured = excluded.is_featured,
            extra_json = excluded.extra_json,
            updated_at = CURRENT_TIMESTAMP`,
    args: [
      productId,
      normalized.slug,
      normalized.active === false ? 0 : 1,
      normalized.name.az,
      normalized.name.en,
      normalized.name.ru,
      normalized.description.az,
      normalized.description.en,
      normalized.description.ru,
      normalized.description.az,
      normalized.description.en,
      normalized.description.ru,
      normalized.audiences.join(','),
      department,
      normalized.typeKey,
      normalized.price,
      normalized.oldPrice ?? null,
      (normalized.images?.[0] || normalized.image || null),
      JSON.stringify(normalized.images?.length ? normalized.images : [normalized.image]),
      stockToDb(normalized.stock),
      badge.az || null,
      badge.en || null,
      badge.ru || null,
      collections.includes('new') ? 1 : 0,
      collections.includes('popular') ? 1 : 0,
      collections.includes('discount') || Boolean(normalized.oldPrice) ? 1 : 0,
      0,
      JSON.stringify(extra)
    ]
  });

  await getTursoClient().execute({ sql: 'DELETE FROM product_images WHERE product_id = ?', args: [productId] });
  const images = normalized.images?.length ? normalized.images : [normalized.image];
  for (const [index, image] of images.entries()) {
    await getTursoClient().execute({
      sql: `INSERT INTO product_images (product_id, image_url, alt_az, alt_en, alt_ru, sort_order, is_main)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [productId, image, normalized.name.az, normalized.name.en, normalized.name.ru, index, index === 0 ? 1 : 0]
    });
  }

  clearProductRuntimeCache();
  return normalized;
}

export async function setProductActive(slugOrId: string, active: boolean) {
  if (!hasDatabaseConfig()) return;
  const mode = await getProductSchemaMode();
  if (mode === 'legacy') {
    await getTursoClient().execute({
      sql: 'UPDATE products SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?',
      args: [active ? 1 : 0, slugOrId]
    });
    clearProductRuntimeCache();
    return;
  }

  await getTursoClient().execute({
    sql: 'UPDATE products SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ? OR id = ?',
    args: [active ? 1 : 0, slugOrId, slugOrId]
  });
  clearProductRuntimeCache();
}


export async function deleteProduct(slugOrId: string) {
  if (!hasDatabaseConfig()) return;
  const clean = String(slugOrId || '').trim();
  if (!clean) return;

  const mode = await getProductSchemaMode();

  if (mode === 'legacy') {
    await getTursoClient().execute({
      sql: 'DELETE FROM products WHERE slug = ?',
      args: [clean]
    });
    clearProductRuntimeCache();
    return;
  }

  const lookup = await getTursoClient().execute({
    sql: 'SELECT id FROM products WHERE slug = ? OR id = ? LIMIT 1',
    args: [clean, clean]
  });
  const productId = lookup.rows[0] ? String((lookup.rows[0] as Record<string, unknown>).id || clean) : clean;

  await getTursoClient().execute({ sql: 'DELETE FROM product_images WHERE product_id = ?', args: [productId] });
  await getTursoClient().execute({ sql: 'DELETE FROM product_tags WHERE product_id = ?', args: [productId] });
  await getTursoClient().execute({
    sql: 'DELETE FROM products WHERE slug = ? OR id = ?',
    args: [clean, clean]
  });

  clearProductRuntimeCache();
}
