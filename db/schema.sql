CREATE TABLE IF NOT EXISTS products (
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
);

CREATE TABLE IF NOT EXISTS product_images (
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
);

CREATE TABLE IF NOT EXISTS product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  tag TEXT NOT NULL,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS catalog_settings (
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_audience ON products(audience);
CREATE INDEX IF NOT EXISTS idx_products_department ON products(department);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_discounted ON products(is_discounted);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);


-- Existing database migration (run manually if your products table already exists)
ALTER TABLE products ADD COLUMN image_url TEXT;
ALTER TABLE products ADD COLUMN images_json TEXT;
