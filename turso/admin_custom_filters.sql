-- Turso SQL console-da çalışdırın.
-- Bu cədvəllər admin paneldə əlavə olunan bölmə və alt bölmələri saxlayır.

CREATE TABLE IF NOT EXISTS admin_departments (
  key TEXT PRIMARY KEY,
  label_az TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_subcategories (
  key TEXT PRIMARY KEY,
  department_key TEXT NOT NULL,
  label_az TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_key) REFERENCES admin_departments(key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_subcategories_department_key
  ON admin_subcategories(department_key);
