import {
  emptyCatalogFilters,
  productDepartmentOptions,
  productTypeOptions,
  type CatalogFilters,
  type CatalogLocalizedOption,
  type CatalogSubcategoryOption,
  type LocalizedText
} from './data';

const staticDepartmentKeys = new Set(productDepartmentOptions.map(option => option.key));
const staticSubcategoryKeys = new Set(productTypeOptions.map(option => option.key));

function slugifyCatalogKey(value: unknown) {
  const slug = String(value || '')
    .toLocaleLowerCase('az-AZ')
    .trim()
    .replace(/[^a-z0-9əöğüşıçа-яё_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);

  return slug;
}

/**
 * Older admin builds stored internal prefixes such as
 * `custom-section-pets` and `custom-sub-custom-section-pets-food` in the
 * products table. They are implementation details, not catalog values.
 * Keep accepting those values, but expose and persist clean keys.
 */
export function cleanLegacyCatalogKey(value: unknown) {
  let key = slugifyCatalogKey(value);
  let previous = '';

  while (key && key !== previous) {
    previous = key;
    key = key
      .replace(/^custom-section-+/, '')
      .replace(/^custom-sub-+/, '')
      .replace(/^-+|-+$/g, '');
  }

  return key.slice(0, 140);
}

function normalizeLabel(value: unknown): LocalizedText | null {
  const raw = value && typeof value === 'object' ? value as Partial<LocalizedText> : {};
  const az = String(raw.az || '').trim().slice(0, 120);
  const en = String(raw.en || '').trim().slice(0, 120);
  const ru = String(raw.ru || '').trim().slice(0, 120);
  const fallback = az || en || ru;

  if (!fallback) return null;

  return {
    az: az || fallback,
    en: en || fallback,
    ru: ru || fallback
  };
}

function normalizeDepartments(value: unknown): CatalogLocalizedOption[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const departments: CatalogLocalizedOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Partial<CatalogLocalizedOption>;
    const label = normalizeLabel(row.label);
    if (!label) continue;

    const key = cleanLegacyCatalogKey(row.key || label.az);
    if (!key || staticDepartmentKeys.has(key) || seen.has(key)) continue;

    seen.add(key);
    departments.push({ key, label });
  }

  return departments;
}

function normalizeSubcategories(value: unknown, departments: CatalogLocalizedOption[]): CatalogSubcategoryOption[] {
  if (!Array.isArray(value)) return [];

  const allowedDepartments = new Set([
    ...staticDepartmentKeys,
    ...departments.map(option => option.key)
  ]);
  const seen = new Set<string>();
  const subcategories: CatalogSubcategoryOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Partial<CatalogSubcategoryOption>;
    const label = normalizeLabel(row.label);
    if (!label) continue;

    const departmentKey = cleanLegacyCatalogKey(row.departmentKey);
    if (!allowedDepartments.has(departmentKey)) continue;

    const key = cleanLegacyCatalogKey(row.key || `${departmentKey}-${label.az}`);
    if (!key || staticSubcategoryKeys.has(key) || seen.has(key)) continue;

    seen.add(key);
    subcategories.push({ key, departmentKey, label });
  }

  return subcategories;
}

function addDefaultSubcategories(
  departments: CatalogLocalizedOption[],
  subcategories: CatalogSubcategoryOption[]
) {
  const result = [...subcategories];
  const usedKeys = new Set(result.map(option => option.key));

  for (const department of departments) {
    if (result.some(option => option.departmentKey === department.key)) continue;

    const baseKey = cleanLegacyCatalogKey(department.key) || 'subcategory';
    let key = baseKey;
    let suffix = 2;
    while (usedKeys.has(key) || staticSubcategoryKeys.has(key)) {
      key = cleanLegacyCatalogKey(`${baseKey}-${suffix}`);
      suffix += 1;
    }

    usedKeys.add(key);
    result.push({
      key,
      departmentKey: department.key,
      label: department.label
    });
  }

  return result;
}

export function normalizeCatalogFilters(value: unknown): CatalogFilters {
  const input = value && typeof value === 'object' ? value as Partial<CatalogFilters> : emptyCatalogFilters;
  const departments = normalizeDepartments(input.departments);
  const subcategories = addDefaultSubcategories(
    departments,
    normalizeSubcategories(input.subcategories, departments)
  );

  return { departments, subcategories };
}

export function mergeCatalogFilters(...sources: unknown[]): CatalogFilters {
  const combined = sources.reduce<CatalogFilters>((acc, source) => {
    const current = source && typeof source === 'object' ? source as Partial<CatalogFilters> : {};
    if (Array.isArray(current.departments)) acc.departments.push(...current.departments);
    if (Array.isArray(current.subcategories)) acc.subcategories.push(...current.subcategories);
    return acc;
  }, { departments: [], subcategories: [] });

  return normalizeCatalogFilters(combined);
}

export function catalogFiltersEqual(left: CatalogFilters, right: CatalogFilters) {
  return JSON.stringify(normalizeCatalogFilters(left)) === JSON.stringify(normalizeCatalogFilters(right));
}
