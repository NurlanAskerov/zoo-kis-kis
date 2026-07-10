import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${name}`);
}

function walk(dir, result = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, result);
    else result.push(full);
  }
  return result;
}

const storageTokenA = 'local' + 'Storage';
const storageTokenB = 'session' + 'Storage';
const textFiles = walk(root).filter(file => {
  const relative = path.relative(root, file).replaceAll('\\\\', '/');
  if (!/\.(ts|tsx|js|jsx|mjs)$/.test(file)) return false;
  if (relative.startsWith('scripts/')) return false;
  return true;
});
const storageFiles = textFiles.filter(file => {
  const content = fs.readFileSync(file, 'utf8');
  return content.includes(storageTokenA) || content.includes(storageTokenB);
});

const admin = read('app/admin/page.tsx');
const db = read('lib/db.ts');
const catalog = read('components/CatalogProvider.tsx');
const filters = read('components/ProductFilters.tsx');
const hook = read('components/useCustomFilters.ts');
const detail = read('components/ProductDetailClient.tsx');

assert('No browser storage usage anywhere in app code', storageFiles.length === 0);
assert('Admin saves custom filters through DB API', admin.includes('/api/admin/custom-filters') && admin.includes('saveCustomFiltersToServer'));
assert('Admin loads custom filters only from DB API', admin.includes('loadAdminCustomFilters') && !admin.includes('loadCustomFilters'));
assert('Admin newly added custom department is selected in form', admin.includes('setForm(current => ({ ...current, typeKey: defaultSubcategoryKey as ProductTypeKey, categoryKey: key }))'));
assert('Admin custom subcategory selection writes categoryKey=departmentKey', admin.includes('setForm(current => ({ ...current, typeKey: key as ProductTypeKey, categoryKey: departmentKey }))'));
assert('Public custom filters are read from DB API without client cache', hook.includes('/api/custom-filters?ts=') && !hook.includes('cachedCustomFilters') && !hook.includes('pendingCustomFilters'));
assert('Product catalog always refreshes from DB API', catalog.includes('/api/products?ts=') && catalog.includes('void refreshProducts();'));
assert('Runtime product cache is disabled by default', db.includes('DEFAULT_PUBLIC_PRODUCTS_RUNTIME_CACHE_MS = 0'));
assert('DB custom subcategory table is used to resolve product department', db.includes('resolveProductCategoryKey') && db.includes('departmentFromCustomTable'));
assert('DB upsert corrects categoryKey from custom subcategory table', db.includes('effectiveCategoryKey = matchedSubcategory.departmentKey'));
assert('Product filters include custom departments/subcategories', filters.includes('buildDepartmentOptions') && filters.includes('buildSubcategoryOptions') && filters.includes('waitingForCustomFilters'));
assert('Product detail shows custom department/type labels', detail.includes('customDepartmentLabel') && detail.includes('customTypeLabel'));
assert('Product detail zoom remains enabled', detail.includes('image-zoom-modal'));

if (process.exitCode) {
  console.error('Custom category self-test failed.');
  process.exit(process.exitCode);
}

console.log('All custom category self-tests passed.');
