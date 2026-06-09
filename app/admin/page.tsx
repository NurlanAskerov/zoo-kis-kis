'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, LockKeyhole, LogOut, Pencil, Save, Search, ShieldCheck, Star, Trash2, X } from 'lucide-react';
import {
  audienceOptions,
  collectionOptions,
  getAudienceLabel,
  getDepartmentForProductType,
  getDepartmentLabel,
  getProductTypeLabel,
  getSubcategoryOptionsForDepartment,
  productDepartmentOptions,
  stockLabels,
  type AudienceKey,
  type Product,
  type ProductVariant,
  type ProductCollectionKey,
  type ProductDepartmentKey,
  type ProductTypeKey,
  type StockKey
} from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { useCatalog } from '@/components/CatalogProvider';
import { useLanguage } from '@/components/LanguageProvider';

type BadgePreset = 'none' | 'new' | 'discount' | 'popular' | 'limited' | 'custom';

type ProductVariantFormRow = {
  id: string;
  labelAz: string;
  labelEn: string;
  labelRu: string;
  price: string;
  oldPrice: string;
  stock: StockKey;
};

type ProductForm = {
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  categoryKey: string;
  typeKey: ProductTypeKey;
  audiences: AudienceKey[];
  collections: ProductCollectionKey[];
  price: string;
  oldPrice: string;
  variantsEnabled: boolean;
  variants: ProductVariantFormRow[];
  image: string;
  imagesText: string;
  badgePreset: BadgePreset;
  badgeCustomAz: string;
  badgeCustomEn: string;
  badgeCustomRu: string;
  stock: StockKey;
  active: boolean;
};

type ImageUploadStatus = 'preparing' | 'uploading' | 'uploaded' | 'failed';
type AdminTab = 'active' | 'add' | 'inactive';

type AdminCustomLocalizedOption = {
  key: string;
  label: { az: string; en: string; ru: string };
};

type AdminCustomSubcategory = AdminCustomLocalizedOption & {
  departmentKey: string;
};

type AdminCustomFilters = {
  departments: AdminCustomLocalizedOption[];
  subcategories: AdminCustomSubcategory[];
};

const emptyCustomFilters: AdminCustomFilters = {
  departments: [],
  subcategories: []
};

type AdminFilterForm = {
  departmentAz: string;
  departmentEn: string;
  departmentRu: string;
  subDepartmentKey: string;
  subAz: string;
  subEn: string;
  subRu: string;
};

const initialAdminFilterForm: AdminFilterForm = {
  departmentAz: '',
  departmentEn: '',
  departmentRu: '',
  subDepartmentKey: 'food',
  subAz: '',
  subEn: '',
  subRu: ''
};

type ImageSlot = {
  id: string;
  name: string;
  previewUrl: string;
  url: string;
  status: ImageUploadStatus;
  message?: string;
};

const badgePresets: Record<BadgePreset, { az: string; en: string; ru: string }> = {
  none: { az: '', en: '', ru: '' },
  new: { az: 'Yeni', en: 'New', ru: 'Новинка' },
  discount: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
  popular: { az: 'Populyar', en: 'Popular', ru: 'Популярный' },
  limited: { az: 'Az qalıb', en: 'Limited', ru: 'Мало осталось' },
  custom: { az: '', en: '', ru: '' }
};

const badgePresetLabels: Record<BadgePreset, string> = {
  none: 'Badge olmasın',
  new: 'Yeni',
  discount: 'Endirim',
  popular: 'Populyar',
  limited: 'Az qalıb',
  custom: 'Özüm yazacam'
};

const initialForm: ProductForm = {
  nameAz: 'Yeni məhsul',
  nameEn: '',
  nameRu: '',
  descriptionAz: 'Məhsul haqqında qısa məlumat.',
  descriptionEn: '',
  descriptionRu: '',
  categoryKey: 'dry-food',
  typeKey: 'dryFood',
  audiences: ['cats'],
  collections: ['new'],
  price: '0',
  oldPrice: '',
  variantsEnabled: false,
  variants: [{ id: 'variant-1', labelAz: '', labelEn: '', labelRu: '', price: '', oldPrice: '', stock: 'inStock' }],
  image: '/products/cat-food.svg',
  imagesText: '/products/cat-food.svg\n/products/cat-food-alt.svg',
  badgePreset: 'new',
  badgeCustomAz: '',
  badgeCustomEn: '',
  badgeCustomRu: '',
  stock: 'inStock',
  active: true
};

function toggleItem<T extends string>(items: T[], value: T) {
  return items.includes(value) ? items.filter(item => item !== value) : [...items, value];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9əöğüşıçа-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;
}

function slugifyAdminOption(value: string, prefix: string) {
  const key = slugify(value);
  return `${prefix}-${key}`.replace(/-+/g, '-');
}

function localizedFromAdminInputs(az: string, en: string, ru: string) {
  const cleanAz = az.trim();
  const fallback = cleanAz || en.trim() || ru.trim();

  return {
    az: cleanAz || fallback,
    en: en.trim() || fallback,
    ru: ru.trim() || fallback
  };
}

function loadCustomFilters(): AdminCustomFilters {
  if (typeof window === 'undefined') return emptyCustomFilters;

  try {
    const parsed = JSON.parse(window.localStorage.getItem('zoo-kis-kis-admin-custom-filters') || '{}') as Partial<AdminCustomFilters>;
    return {
      departments: Array.isArray(parsed.departments) ? parsed.departments : [],
      subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : []
    };
  } catch {
    return emptyCustomFilters;
  }
}

function saveCustomFilters(filters: AdminCustomFilters) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('zoo-kis-kis-admin-custom-filters', JSON.stringify(filters));
}


function createVariantFormRow(): ProductVariantFormRow {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    labelAz: '',
    labelEn: '',
    labelRu: '',
    price: '',
    oldPrice: '',
    stock: 'inStock'
  };
}

function buildVariantLabel(row: ProductVariantFormRow) {
  const az = row.labelAz.trim();
  const fallback = az || row.labelEn.trim() || row.labelRu.trim();

  return {
    az: az || fallback,
    en: row.labelEn.trim() || fallback,
    ru: row.labelRu.trim() || fallback
  };
}

function variantsFromFormRows(rows: ProductVariantFormRow[]): ProductVariant[] {
  const variants: ProductVariant[] = [];

  rows.forEach(row => {
    const label = buildVariantLabel(row);
    const price = Number(row.price || 0);
    const oldPrice = Number(row.oldPrice || 0);

    if (!label.az || !Number.isFinite(price) || price <= 0) return;

    variants.push({
      id: row.id || slugify(label.az),
      label,
      price,
      oldPrice: Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : undefined,
      stock: row.stock
    });
  });

  return variants;
}

function variantRowsFromProduct(product: Product): ProductVariantFormRow[] {
  const variants = product.variants ?? [];
  if (!variants.length) return [createVariantFormRow()];

  return variants.map((variant, index) => ({
    id: variant.id || `variant-${index + 1}`,
    labelAz: variant.label?.az || '',
    labelEn: variant.label?.en || variant.label?.az || '',
    labelRu: variant.label?.ru || variant.label?.az || '',
    price: String(variant.price ?? ''),
    oldPrice: variant.oldPrice ? String(variant.oldPrice) : '',
    stock: variant.stock || 'inStock'
  }));
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

function resolveBadge(form: ProductForm) {
  if (form.badgePreset === 'none') return undefined;

  const preset = form.badgePreset === 'custom'
    ? { az: form.badgeCustomAz.trim(), en: form.badgeCustomEn.trim(), ru: form.badgeCustomRu.trim() }
    : badgePresets[form.badgePreset];

  const az = preset.az || form.badgeCustomAz.trim();
  if (!az) return undefined;

  return {
    az,
    en: preset.en || form.badgeCustomEn.trim() || az,
    ru: preset.ru || form.badgeCustomRu.trim() || az
  };
}

function formToProduct(form: ProductForm, baseProduct?: Product | null): Product {
  const imageList = form.imagesText.split('\n').map(item => item.trim()).filter(Boolean);
  const image = form.image.trim() || imageList[0] || '/products/cat-food.svg';
  const nameAz = form.nameAz.trim() || 'Yeni məhsul';
  const descriptionAz = form.descriptionAz.trim() || 'Məhsul haqqında məlumat.';
  const slug = baseProduct?.slug || slugify(nameAz);
  const variants = form.variantsEnabled ? variantsFromFormRows(form.variants) : [];
  const firstVariantPrice = variants[0]?.price;

  return {
    id: baseProduct?.id || slug,
    slug,
    name: {
      az: nameAz,
      en: form.nameEn.trim() || nameAz,
      ru: form.nameRu.trim() || nameAz
    },
    categoryKey: form.categoryKey || categoryKeyFromType(form.typeKey),
    typeKey: form.typeKey,
    audiences: form.audiences.length ? form.audiences : ['allPets'],
    collections: form.collections,
    price: Number(form.price || firstVariantPrice || 0),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    variants: variants.length ? variants : undefined,
    image,
    images: imageList.length ? imageList : [image],
    badge: resolveBadge(form),
    stock: form.stock,
    active: form.active,
    description: {
      az: descriptionAz,
      en: form.descriptionEn.trim() || descriptionAz,
      ru: form.descriptionRu.trim() || descriptionAz
    },
    details: {
      az: [],
      en: [],
      ru: []
    }
  };
}

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function imageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Şəkil oxunmadı. iPhone HEIC/Live Photo faylıdırsa, JPG və ya WebP kimi göndərin.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
}

function createResizedCanvas(source: HTMLImageElement, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Browser şəkli optimizasiya edə bilmədi.');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, width, height);

  return canvas;
}

async function bestCompressedImage(source: HTMLImageElement) {
  const variants = [
    { maxWidth: 1400, maxHeight: 1400, quality: 0.84, target: 650 * 1024 },
    { maxWidth: 1400, maxHeight: 1400, quality: 0.78, target: 650 * 1024 },
    { maxWidth: 1280, maxHeight: 1280, quality: 0.78, target: 520 * 1024 },
    { maxWidth: 1200, maxHeight: 1200, quality: 0.74, target: 460 * 1024 }
  ];

  let bestBlob: Blob | null = null;
  let bestExtension = 'webp';
  let bestType = 'image/webp';

  for (const variant of variants) {
    const canvas = createResizedCanvas(source, variant.maxWidth, variant.maxHeight);
    const blob = await canvasToBlob(canvas, 'image/webp', variant.quality);

    if (!blob) continue;

    bestBlob = blob;
    bestExtension = 'webp';
    bestType = 'image/webp';

    if (blob.size <= variant.target) {
      return { blob, extension: bestExtension, type: bestType };
    }
  }

  if (bestBlob) {
    return { blob: bestBlob, extension: bestExtension, type: bestType };
  }

  const fallbackCanvas = createResizedCanvas(source, 1280, 1280);
  const fallbackBlob = await canvasToBlob(fallbackCanvas, 'image/jpeg', 0.82);

  if (!fallbackBlob) throw new Error('Şəkil optimizasiya olunmadı. Başqa format seçin.');

  return { blob: fallbackBlob, extension: 'jpg', type: 'image/jpeg' };
}

async function optimizeImageForUpload(file: File) {
  if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    throw new Error('HEIC/Live Photo formatı dəstəklənmir. Şəkli iPhone-da JPG kimi export edib yenidən seçin.');
  }

  if (file.type === 'image/svg+xml') {
    return { file, previewUrl: await fileToDataUrl(file) };
  }

  const source = await imageFromFile(file);
  const { blob, extension, type } = await bestCompressedImage(source);

  const safeBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product-image';
  const optimized = new File([blob], `${safeBase}.${extension}`, { type, lastModified: Date.now() });
  return { file: optimized, previewUrl: await fileToDataUrl(optimized) };
}

function statusText(status: ImageUploadStatus) {
  if (status === 'preparing') return 'Hazırlanır';
  if (status === 'uploading') return 'Arxa fonda yüklənir';
  if (status === 'uploaded') return 'Şəkil yükləndi';
  return 'Upload alınmadı';
}

function imageSlotsFromUrls(urls: string[], prefix = 'image'): ImageSlot[] {
  return urls.filter(Boolean).map((url, index) => ({
    id: `${prefix}-${index}-${url}`,
    name: `Şəkil ${index + 1}`,
    previewUrl: url,
    url,
    status: 'uploaded' as ImageUploadStatus
  }));
}

function initialImageSlots() {
  return imageSlotsFromUrls(initialForm.imagesText.split('\n').map(item => item.trim()).filter(Boolean), 'initial');
}

function badgePresetFromProduct(product: Product): BadgePreset {
  const badgeAz = product.badge?.az?.trim().toLowerCase();
  if (!badgeAz) return 'none';

  const preset = (Object.entries(badgePresets) as [BadgePreset, { az: string; en: string; ru: string }][])
    .find(([key, value]) => key !== 'none' && key !== 'custom' && value.az.toLowerCase() === badgeAz)?.[0];

  return preset || 'custom';
}

function productToForm(product: Product): ProductForm {
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  const badgePreset = badgePresetFromProduct(product);
  const isCustomBadge = badgePreset === 'custom';

  return {
    nameAz: product.name.az || '',
    nameEn: product.name.en || product.name.az || '',
    nameRu: product.name.ru || product.name.az || '',
    descriptionAz: product.description.az || '',
    descriptionEn: product.description.en || product.description.az || '',
    descriptionRu: product.description.ru || product.description.az || '',
    categoryKey: product.categoryKey || categoryKeyFromType(product.typeKey),
    typeKey: product.typeKey,
    audiences: product.audiences?.length ? product.audiences : ['allPets'],
    collections: product.collections ?? [],
    price: String(product.price ?? 0),
    oldPrice: product.oldPrice ? String(product.oldPrice) : '',
    variantsEnabled: Boolean(product.variants?.length),
    variants: variantRowsFromProduct(product),
    image: images[0] || product.image || '/products/cat-food.svg',
    imagesText: images.join('\n'),
    badgePreset,
    badgeCustomAz: isCustomBadge ? product.badge?.az || '' : '',
    badgeCustomEn: isCustomBadge ? product.badge?.en || '' : '',
    badgeCustomRu: isCustomBadge ? product.badge?.ru || '' : '',
    stock: product.stock,
    active: product.active !== false
  };
}

function normalizeSearch(value: string) {
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
    .replace(/[^a-z0-9а-яё\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function productMatchesSearch(product: Product, query: string) {
  const needle = normalizeSearch(query);
  if (!needle) return true;

  const tokens = needle.split(' ').filter(Boolean);
  const productNames = [product.name.az, product.name.en, product.name.ru]
    .filter(Boolean)
    .map(normalizeSearch)
    .filter(Boolean);

  if (!tokens.length || !productNames.length) return true;

  return productNames.some(name => {
    const words = name.split(' ').filter(Boolean);
    return tokens.every(token => words.some(word => word === token || word.startsWith(token) || word.includes(token)));
  });
}



function makeUniqueSlug(baseSlug: string, products: Product[]) {
  const cleanBase = slugify(baseSlug || 'product');
  const usedSlugs = new Set(products.map(product => product.slug).filter(Boolean));
  const usedIds = new Set(products.map(product => product.id).filter(Boolean));

  if (!usedSlugs.has(cleanBase) && !usedIds.has(cleanBase)) return cleanBase;

  let counter = 2;
  while (usedSlugs.has(`${cleanBase}-${counter}`) || usedIds.has(`${cleanBase}-${counter}`)) {
    counter += 1;
  }

  return `${cleanBase}-${counter}`;
}

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const { products, refreshProducts } = useCatalog();
  const [adminProducts, setAdminProducts] = useState<Product[]>(products);
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(initialImageSlots);
  const [adminTab, setAdminTab] = useState<AdminTab>('active');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglePendingSlugs, setTogglePendingSlugs] = useState<Set<string>>(() => new Set());
  const [deletePendingSlugs, setDeletePendingSlugs] = useState<Set<string>>(() => new Set());
  const [customFilters, setCustomFilters] = useState<AdminCustomFilters>(emptyCustomFilters);
  const [filterForm, setFilterForm] = useState<AdminFilterForm>(initialAdminFilterForm);

  const adminDepartmentOptions = useMemo(() => [
    ...productDepartmentOptions.map(department => ({ ...department, key: department.key as string })),
    ...customFilters.departments.map(department => ({
      key: department.key,
      label: department.label,
      subcategories: customFilters.subcategories
        .filter(subcategory => subcategory.departmentKey === department.key)
        .map(subcategory => subcategory.key as ProductTypeKey)
    }))
  ], [customFilters]);

  const selectedDepartment = customFilters.subcategories.find(subcategory => subcategory.key === form.typeKey)?.departmentKey
    || getDepartmentForProductType(form.typeKey);

  const adminSubcategoryOptions = useMemo(() => {
    const customSubcategories = customFilters.subcategories
      .filter(subcategory => subcategory.departmentKey === selectedDepartment)
      .map(subcategory => ({ key: subcategory.key as ProductTypeKey, label: subcategory.label }));

    const staticSubcategories = getSubcategoryOptionsForDepartment(selectedDepartment as ProductDepartmentKey)
      .filter(type => !customSubcategories.some(custom => custom.key === type.key));

    return [...staticSubcategories, ...customSubcategories];
  }, [customFilters, selectedDepartment]);
  const searchedProducts = useMemo(() => adminProducts.filter(product => productMatchesSearch(product, adminSearch)), [adminProducts, adminSearch]);
  const activeProducts = useMemo(() => searchedProducts.filter(product => product.active !== false), [searchedProducts]);
  const inactiveProducts = useMemo(() => searchedProducts.filter(product => product.active === false), [searchedProducts]);
  const totalActiveProducts = useMemo(() => adminProducts.filter(product => product.active !== false).length, [adminProducts]);
  const totalInactiveProducts = useMemo(() => adminProducts.filter(product => product.active === false).length, [adminProducts]);

  function changeDepartment(department: string) {
    const customFirstSubcategory = customFilters.subcategories.find(subcategory => subcategory.departmentKey === department)?.key as ProductTypeKey | undefined;
    const firstSubcategory = getSubcategoryOptionsForDepartment(department as ProductDepartmentKey)[0]?.key ?? customFirstSubcategory ?? 'dryFood';
    setForm({ ...form, typeKey: firstSubcategory, categoryKey: categoryKeyFromType(firstSubcategory) || department });
    setFilterForm(current => ({ ...current, subDepartmentKey: department }));
  }

  function changeSubcategory(typeKey: ProductTypeKey) {
    const customSubcategory = customFilters.subcategories.find(subcategory => subcategory.key === typeKey);
    setForm({ ...form, typeKey, categoryKey: customSubcategory?.departmentKey || categoryKeyFromType(typeKey) });
  }

  function getAdminDepartmentLabel(departmentKey: string) {
    return adminDepartmentOptions.find(department => department.key === departmentKey)?.label[lang] || getDepartmentLabel(departmentKey as ProductDepartmentKey, lang);
  }

  function getAdminProductTypeLabel(typeKey: ProductTypeKey) {
    return customFilters.subcategories.find(subcategory => subcategory.key === typeKey)?.label[lang] || getProductTypeLabel(typeKey, lang);
  }

  function addCustomDepartment() {
    const label = localizedFromAdminInputs(filterForm.departmentAz, filterForm.departmentEn, filterForm.departmentRu);
    if (!label.az) {
      setMessage('Bölmə adı AZ/EN/RU sahələrindən ən azı birində yazılmalıdır.');
      return;
    }

    const key = slugifyAdminOption(label.az, 'custom-section');
    const nextFilters = {
      ...customFilters,
      departments: customFilters.departments.some(department => department.key === key)
        ? customFilters.departments
        : [...customFilters.departments, { key, label }]
    };

    setCustomFilters(nextFilters);
    saveCustomFilters(nextFilters);
    setFilterForm(current => ({ ...current, departmentAz: '', departmentEn: '', departmentRu: '', subDepartmentKey: key }));
    setMessage('Yeni bölmə əlavə edildi. İndi bu bölməyə alt bölmə əlavə edə bilərsiniz.');
  }

  function addCustomSubcategory() {
    const label = localizedFromAdminInputs(filterForm.subAz, filterForm.subEn, filterForm.subRu);
    if (!label.az) {
      setMessage('Alt bölmə adı AZ/EN/RU sahələrindən ən azı birində yazılmalıdır.');
      return;
    }

    const departmentKey = filterForm.subDepartmentKey || selectedDepartment;
    const key = slugifyAdminOption(`${departmentKey}-${label.az}`, 'custom-sub');
    const nextFilters = {
      ...customFilters,
      subcategories: customFilters.subcategories.some(subcategory => subcategory.key === key)
        ? customFilters.subcategories
        : [...customFilters.subcategories, { key, departmentKey, label }]
    };

    setCustomFilters(nextFilters);
    saveCustomFilters(nextFilters);
    setFilterForm(current => ({ ...current, subAz: '', subEn: '', subRu: '' }));
    setForm(current => ({ ...current, typeKey: key as ProductTypeKey, categoryKey: departmentKey }));
    setMessage('Yeni alt bölmə əlavə edildi və məhsul formasında seçildi.');
  }

  function updateVariantRow(id: string, patch: Partial<ProductVariantFormRow>) {
    setForm(current => ({
      ...current,
      variants: current.variants.map(row => row.id === id ? { ...row, ...patch } : row)
    }));
  }

  function addVariantRow() {
    setForm(current => ({ ...current, variants: [...current.variants, createVariantFormRow()] }));
  }

  function removeVariantRow(id: string) {
    setForm(current => {
      const nextVariants = current.variants.filter(row => row.id !== id);
      return { ...current, variants: nextVariants.length ? nextVariants : [createVariantFormRow()] };
    });
  }

  const previewProduct = useMemo(() => formToProduct(form, editingProduct), [form, editingProduct]);

  async function checkSession() {
    const response = await fetch('/api/admin/me', { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => ({}));
    if (data.authenticated) {
      setLoggedIn(true);
      await refreshProducts();
      await loadAdminProducts();
    }
  }


  async function loadAdminProducts() {
    const response = await fetch('/api/products?includeInactive=1', { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => ({ products: [] })) as { databaseReady?: boolean; products?: Product[] };
    if (Array.isArray(data.products) && (data.databaseReady !== false || data.products.length > 0)) {
      setAdminProducts(data.products);
    }
  }

  useEffect(() => {
    checkSession();
    const storedFilters = loadCustomFilters();
    setCustomFilters(storedFilters);
    setFilterForm(current => ({ ...current, subDepartmentKey: storedFilters.departments[0]?.key || current.subDepartmentKey }));
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoginError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      setLoginError('Şifrə düzgün deyil.');
      return;
    }
    setLoggedIn(true);
    setPassword('');
    await refreshProducts();
    await loadAdminProducts();
    setAdminTab('active');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setLoggedIn(false);
  }

  function syncImageForm(slots: ImageSlot[]) {
    const urls = slots.map(slot => slot.url || slot.previewUrl).filter(Boolean);
    setForm(current => ({ ...current, image: urls[0] || '', imagesText: urls.join('\n') }));
  }

  async function uploadSlot(slotId: string, file: File) {
    setImageSlots(current => current.map(slot => slot.id === slotId ? { ...slot, status: 'uploading', message: 'Arxa fonda yüklənir' } : slot));

    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; url?: string; message?: string };

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message || 'Şəkil R2-yə yüklənmədi.');
      }

      setImageSlots(current => {
        const next = current.map(slot => slot.id === slotId ? { ...slot, url: data.url!, previewUrl: data.url!, status: 'uploaded' as ImageUploadStatus, message: 'Şəkil yükləndi' } : slot);
        syncImageForm(next);
        return next;
      });
      setMessage('Şəkil yükləndi. Məhsulu yadda saxlayanda link istifadə olunacaq.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload alınmadı';
      setImageSlots(current => {
        const next = current.map(slot => slot.id === slotId ? { ...slot, status: 'failed' as ImageUploadStatus, message } : slot);
        syncImageForm(next);
        return next;
      });
      setMessage('Bəzi şəkillər R2-yə yüklənmədi. Preview saxlanıldı, amma Vercel production-da və R2 env-lərini yoxlamaq lazımdır.');
    }
  }

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingImages(true);
    setMessage('Şəkillər hazırlanır. Preview dərhal görünəcək, upload arxa fonda gedəcək.');

    for (const file of files) {
      const slotId = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        const pendingSlot: ImageSlot = {
          id: slotId,
          name: file.name,
          previewUrl: '',
          url: '',
          status: 'preparing',
          message: 'Hazırlanır'
        };
        setImageSlots(current => [...current, pendingSlot]);

        const optimized = await optimizeImageForUpload(file);
        setImageSlots(current => {
          const next = current.map(slot => slot.id === slotId ? { ...slot, name: optimized.file.name, previewUrl: optimized.previewUrl, url: optimized.previewUrl, status: 'uploading' as ImageUploadStatus, message: 'Arxa fonda yüklənir' } : slot);
          syncImageForm(next);
          return next;
        });
        void uploadSlot(slotId, optimized.file);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Şəkil hazırlanmadı';
        setImageSlots(current => current.map(slot => slot.id === slotId ? { ...slot, status: 'failed' as ImageUploadStatus, message } : slot));
        setMessage(message);
      }
    }

    setUploadingImages(false);
    event.target.value = '';
  }

  function makeMainImage(id: string) {
    setImageSlots(current => {
      const selected = current.find(slot => slot.id === id);
      if (!selected) return current;
      const next = [selected, ...current.filter(slot => slot.id !== id)];
      syncImageForm(next);
      return next;
    });
  }

  function removeImage(id: string) {
    setImageSlots(current => {
      const next = current.filter(slot => slot.id !== id);
      syncImageForm(next);
      return next;
    });
  }

  function startNewProduct() {
    setEditingProduct(null);
    setForm(initialForm);
    setImageSlots(initialImageSlots());
    setMessage('');
    setAdminTab('add');
  }

  function startEditProduct(product: Product) {
    const nextForm = productToForm(product);
    const images = nextForm.imagesText.split('\n').map(item => item.trim()).filter(Boolean);
    setEditingProduct(product);
    setForm(nextForm);
    setImageSlots(imageSlotsFromUrls(images, `edit-${product.slug}`));
    setMessage('');
    setAdminTab('add');

    window.requestAnimationFrame(() => {
      document.getElementById('add')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function cancelEdit() {
    startNewProduct();
  }

  async function saveProduct() {
    if (saving) return;

    setSaving(true);
    setMessage('');
    const product = formToProduct(form, editingProduct);

    if (!editingProduct) {
      const uniqueSlug = makeUniqueSlug(product.slug, adminProducts);
      product.slug = uniqueSlug;
      product.id = uniqueSlug;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; saved?: boolean; product?: Product; message?: string };

      if (!response.ok || data.ok === false) {
        setMessage(data.message || 'Məhsul saxlanmadı. Admin girişini və şifrəni yoxlayın.');
        return;
      }

      const savedProduct = data.product ?? product;
      setAdminProducts(current => {
        const withoutOld = current.filter(item => item.slug !== product.slug && item.slug !== editingProduct?.slug);
        return [savedProduct, ...withoutOld];
      });
      setEditingProduct(savedProduct);
      setMessage(data.saved === false ? 'Məhsul saxlanmağa hazırdır.' : editingProduct ? 'Məhsul redaktə edildi.' : 'Məhsul saxlandı.');
      await refreshProducts();
      await loadAdminProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Məhsul saxlanmadı. Bağlantını yoxlayın.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: Product) {
    const nextActive = product.active === false;
    const slug = product.slug;
    if (togglePendingSlugs.has(slug)) return;

    setTogglePendingSlugs(current => new Set(current).add(slug));
    setAdminProducts(current => current.map(item => item.slug === slug ? { ...item, active: nextActive } : item));
    setMessage('');

    try {
      const response = await fetch(`/api/products/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive })
      });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Status dəyişmədi.');
      }

      void refreshProducts();
      void loadAdminProducts();
    } catch (error) {
      setAdminProducts(current => current.map(item => item.slug === slug ? { ...item, active: product.active } : item));
      setMessage(error instanceof Error ? error.message : 'Status dəyişmədi. Yenidən yoxlayın.');
    } finally {
      setTogglePendingSlugs(current => {
        const next = new Set(current);
        next.delete(slug);
        return next;
      });
    }
  }


  async function deleteAdminProduct(product: Product) {
    const slug = product.slug;
    if (deletePendingSlugs.has(slug)) return;

    const confirmed = window.confirm(`“${product.name.az}” məhsulu tam silinsin? Bu əməliyyat geri qaytarılmır.`);
    if (!confirmed) return;

    setDeletePendingSlugs(current => new Set(current).add(slug));
    setMessage('');
    const previousProducts = adminProducts;
    setAdminProducts(current => current.filter(item => item.slug !== slug));

    if (editingProduct?.slug === slug) {
      setEditingProduct(null);
      setForm(initialForm);
      setImageSlots(initialImageSlots());
      setAdminTab('active');
    }

    try {
      const response = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Məhsul silinmədi.');
      }

      setMessage('Məhsul silindi.');
      void refreshProducts();
      void loadAdminProducts();
    } catch (error) {
      setAdminProducts(previousProducts);
      setMessage(error instanceof Error ? error.message : 'Məhsul silinmədi. Yenidən yoxlayın.');
    } finally {
      setDeletePendingSlugs(current => {
        const next = new Set(current);
        next.delete(slug);
        return next;
      });
    }
  }


  function renderProductList(list: Product[], emptyText: string) {
    return list.length ? (
      <div className="admin-product-cards">
        {list.map(product => {
          const pending = togglePendingSlugs.has(product.slug);
          const deleting = deletePendingSlugs.has(product.slug);

          return (
            <div className={deleting ? 'admin-product-card deleting' : 'admin-product-card'} key={product.slug}>
              <div className="admin-product-mini">
                <img src={(product.images?.[0] || product.image)} alt={product.name[lang]} draggable={false} />
                <div>
                  <strong>{product.name[lang]}</strong>
                  <span>{getAdminDepartmentLabel(customFilters.subcategories.find(subcategory => subcategory.key === product.typeKey)?.departmentKey || getDepartmentForProductType(product.typeKey))} · {getAdminProductTypeLabel(product.typeKey)}</span>
                  <small>{stockLabels[product.stock][lang]} · {product.price} AZN</small>
                </div>
              </div>
              <div className="admin-product-row-actions">
                <button className="tiny-btn admin-edit-btn" type="button" onClick={() => startEditProduct(product)} disabled={deleting}>
                  <Pencil size={15} /> Redaktə et
                </button>
                <button className="tiny-btn admin-delete-btn" type="button" onClick={() => deleteAdminProduct(product)} disabled={deleting} aria-label="Məhsulu sil">
                  {deleting ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />} Sil
                </button>
                <button className={`switch ${product.active === false ? '' : 'on'} ${pending ? 'pending' : ''}`} type="button" onClick={() => toggleActive(product)} aria-label="active toggle" disabled={pending || deleting}>
                  <span />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="admin-empty-state">
        <p>{emptyText}</p>
        <button className="btn btn-primary" type="button" onClick={startNewProduct}><ImagePlus size={17} /> Yeni məhsul əlavə et</button>
      </div>
    );
  }

  function renderAdminSearch() {
    return (
      <div className="admin-search-row">
        <Search size={17} aria-hidden="true" />
        <input
          className="input"
          value={adminSearch}
          onChange={event => setAdminSearch(event.target.value)}
          placeholder="Məhsul adına görə axtar..."
          aria-label="Məhsul adına görə axtar"
        />
        {adminSearch ? (
          <button className="tiny-btn" type="button" onClick={() => setAdminSearch('')} aria-label="Axtarışı təmizlə">
            <X size={15} /> Təmizlə
          </button>
        ) : null}
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <main className="page section page-spaced">
        <div className="container admin-login-wrap">
          <form className="info-card admin-login-card" onSubmit={login}>
            <div className="login-icon"><LockKeyhole size={28} /></div>
            <p className="eyebrow">{t('adminPanel')}</p>
            <h1>{t('adminLoginTitle')}</h1>
            <p>{t('adminLoginText')}</p>
            <input className="input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={t('adminPassword')} />
            <button className="btn btn-primary" type="submit"><ShieldCheck size={18} /> {t('login')}</button>
            {loginError ? <p className="form-error">{loginError}</p> : null}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="page section page-spaced admin-page">
      <div className="container">
        <div className="section-title admin-title-row">
          <div>
            <p className="eyebrow">{t('adminPanel')}</p>
            <h1>{t('adminTitle')}</h1>
            <p>{t('adminText')}</p>
          </div>
          <button className="btn btn-soft" type="button" onClick={logout}><LogOut size={17} /> {t('logout')}</button>
        </div>

        <div className="admin-dashboard">
          <div className="admin-summary-grid">
            <button className={adminTab === 'active' ? 'admin-summary-card active' : 'admin-summary-card'} type="button" onClick={() => setAdminTab('active')}>
              <span>Aktiv məhsullar</span>
              <strong>{totalActiveProducts}</strong>
            </button>
            <button className={adminTab === 'add' ? 'admin-summary-card active' : 'admin-summary-card'} type="button" onClick={startNewProduct}>
              <span>{editingProduct ? 'Redaktə edilir' : 'Yeni məhsul'}</span>
              <strong>{editingProduct ? '✎' : '+'}</strong>
            </button>
            <button className={adminTab === 'inactive' ? 'admin-summary-card active' : 'admin-summary-card'} type="button" onClick={() => setAdminTab('inactive')}>
              <span>Passiv məhsullar</span>
              <strong>{totalInactiveProducts}</strong>
            </button>
          </div>

          <div className="admin-tabbar" role="tablist" aria-label="Admin panel tabs">
            <button className={adminTab === 'active' ? 'active' : ''} type="button" onClick={() => setAdminTab('active')}>Aktiv məhsullar</button>
            <button className={adminTab === 'add' ? 'active' : ''} type="button" onClick={startNewProduct}>+ Yeni məhsul əlavə et</button>
            <button className={adminTab === 'inactive' ? 'active' : ''} type="button" onClick={() => setAdminTab('inactive')}>Passiv məhsullar</button>
          </div>

          {adminTab === 'active' ? (
            <section id="products" className="info-card admin-products-panel">
              <div className="admin-panel-head">
                <div>
                  <p className="eyebrow">{t('products')}</p>
                  <h2>Aktiv məhsullar</h2>
                  <p className="microcopy">Saytda görünən məhsullar. Məhsulu gizlətmək üçün toggle-i söndür.</p>
                </div>
                <button className="btn btn-primary" type="button" onClick={startNewProduct}><ImagePlus size={17} /> Yeni məhsul əlavə et</button>
              </div>
              {renderAdminSearch()}
              {message ? <p className="form-success">{message}</p> : null}
              {renderProductList(activeProducts, adminSearch.trim() ? 'Axtarışa uyğun aktiv məhsul tapılmadı.' : 'Aktiv məhsul yoxdur. İlk məhsulu əlavə edin.')}
            </section>
          ) : null}

          {adminTab === 'add' ? (
            <section id="add" className="info-card admin-editor-card">
              <div className="admin-editor-head">
                <div>
                  <p className="eyebrow">{editingProduct ? 'Məhsul redaktəsi' : t('addProduct')}</p>
                  <h2>{editingProduct ? form.nameAz || 'Məhsulu redaktə et' : t('adminProductEditor')}</h2>
                  <p>{editingProduct ? 'Dəyişiklikləri saxlayanda mövcud məhsul yenilənəcək, yeni dublikat yaranmayacaq.' : t('adminProductEditorText')}</p>
                </div>
                {editingProduct ? (
                  <button className="btn btn-soft" type="button" onClick={cancelEdit}>
                    <X size={17} /> Redaktəni bitir
                  </button>
                ) : null}
              </div>

              <div className="admin-editor-layout">
                <form className="form-grid admin-product-form" onSubmit={event => event.preventDefault()}>
                  <div className="form-section-title">AZ / EN / RU</div>
                  <input className="input" value={form.nameAz} onChange={event => setForm({ ...form, nameAz: event.target.value })} placeholder="Məhsul adı AZ" />
                  <input className="input" value={form.nameEn} onChange={event => setForm({ ...form, nameEn: event.target.value })} placeholder="Product name EN" />
                  <input className="input" value={form.nameRu} onChange={event => setForm({ ...form, nameRu: event.target.value })} placeholder="Название на RU" />
                  <textarea className="input" value={form.descriptionAz} onChange={event => setForm({ ...form, descriptionAz: event.target.value })} placeholder="Açıqlama AZ" />
                  <textarea className="input" value={form.descriptionEn} onChange={event => setForm({ ...form, descriptionEn: event.target.value })} placeholder="Description EN" />
                  <textarea className="input" value={form.descriptionRu} onChange={event => setForm({ ...form, descriptionRu: event.target.value })} placeholder="Описание на RU" />

                  <div className="form-section-title">Şəkillər</div>
                  <label className="file-upload-box add-image-box">
                    {uploadingImages ? <Loader2 size={22} className="spin" /> : <ImagePlus size={22} />}
                    <span>+ Şəkil əlavə et</span>
                    <small>Şəkil seçilən kimi preview görünür. Böyük şəkillər keyfiyyəti qorunaraq WebP-ə çevrilir, ölçüsü azaldılır və upload arxa fonda R2-yə gedir.</small>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple onChange={handleImages} />
                  </label>

                  <div className="admin-image-list">
                    {imageSlots.map((slot, index) => (
                      <div className={`admin-image-item ${slot.status}`} key={slot.id}>
                        <div className="admin-image-thumb">
                          {slot.previewUrl ? <img src={slot.previewUrl} alt={slot.name} draggable={false} /> : <ImagePlus size={22} />}
                        </div>
                        <div className="admin-image-info">
                          <strong>{index + 1}. {slot.name}</strong>
                          <span className="admin-image-status">
                            {slot.status === 'uploaded' ? <CheckCircle2 size={14} /> : slot.status === 'failed' ? <AlertTriangle size={14} /> : <Loader2 size={14} className="spin" />}
                            {statusText(slot.status)}
                          </span>
                          {slot.message ? <small>{slot.message}</small> : null}
                        </div>
                        <div className="admin-image-actions">
                          <button className="tiny-btn" type="button" onClick={() => makeMainImage(slot.id)} disabled={index === 0}>
                            <Star size={15} /> Əsas et
                          </button>
                          <button className="tiny-btn" type="button" onClick={() => removeImage(slot.id)} aria-label="Şəkli sil">
                            <Trash2 size={15} /> Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="microcopy">Birinci şəkil əsas məhsul şəkli sayılır. R2 alınmasa da preview qalır, amma publish üçün R2 env-lərini yoxlayın.</p>

                  <div className="form-section-title">{t('filtersAndPrice')}</div>
                  <div className="form-row-2">
                    <select className="input" value={selectedDepartment} onChange={event => changeDepartment(event.target.value)} aria-label={t('department')}>
                      {adminDepartmentOptions.map(department => <option value={department.key} key={department.key}>{department.label[lang]}</option>)}
                    </select>
                    <select className="input" value={form.typeKey} onChange={event => changeSubcategory(event.target.value as ProductTypeKey)} aria-label={t('subcategory')}>
                      {adminSubcategoryOptions.map(type => <option value={type.key} key={type.key}>{type.label[lang]}</option>)}
                    </select>
                  </div>

                  <details className="admin-custom-filter-box">
                    <summary>+ Bölmə / alt bölmə əlavə et</summary>
                    <div className="admin-custom-filter-grid">
                      <div>
                        <p className="microcopy"><strong>Yeni bölmə</strong> — adı 3 dildə yazın.</p>
                        <div className="form-row-3">
                          <input className="input" value={filterForm.departmentAz} onChange={event => setFilterForm({ ...filterForm, departmentAz: event.target.value })} placeholder="Bölmə AZ" />
                          <input className="input" value={filterForm.departmentEn} onChange={event => setFilterForm({ ...filterForm, departmentEn: event.target.value })} placeholder="Section EN" />
                          <input className="input" value={filterForm.departmentRu} onChange={event => setFilterForm({ ...filterForm, departmentRu: event.target.value })} placeholder="Раздел RU" />
                        </div>
                        <button className="tiny-btn admin-custom-filter-btn" type="button" onClick={addCustomDepartment}>Bölmə əlavə et</button>
                      </div>

                      <div>
                        <p className="microcopy"><strong>Yeni alt bölmə</strong> — hansı bölməyə aid olduğunu seçin.</p>
                        <select className="input" value={filterForm.subDepartmentKey} onChange={event => setFilterForm({ ...filterForm, subDepartmentKey: event.target.value })}>
                          {adminDepartmentOptions.map(department => <option value={department.key} key={department.key}>{department.label[lang]}</option>)}
                        </select>
                        <div className="form-row-3">
                          <input className="input" value={filterForm.subAz} onChange={event => setFilterForm({ ...filterForm, subAz: event.target.value })} placeholder="Alt bölmə AZ" />
                          <input className="input" value={filterForm.subEn} onChange={event => setFilterForm({ ...filterForm, subEn: event.target.value })} placeholder="Subsection EN" />
                          <input className="input" value={filterForm.subRu} onChange={event => setFilterForm({ ...filterForm, subRu: event.target.value })} placeholder="Подраздел RU" />
                        </div>
                        <button className="tiny-btn admin-custom-filter-btn" type="button" onClick={addCustomSubcategory}>Alt bölmə əlavə et</button>
                      </div>
                    </div>
                  </details>

                  <div className="check-grid">
                    {audienceOptions.map(audience => (
                      <label className="check-pill" key={audience.key}>
                        <input type="checkbox" checked={form.audiences.includes(audience.key)} onChange={() => setForm({ ...form, audiences: toggleItem(form.audiences, audience.key) })} />
                        {getAudienceLabel(audience.key, lang)}
                      </label>
                    ))}
                  </div>

                  <div className="check-grid">
                    {collectionOptions.map(collection => (
                      <label className="check-pill" key={collection.key}>
                        <input type="checkbox" checked={form.collections.includes(collection.key)} onChange={() => setForm({ ...form, collections: toggleItem(form.collections, collection.key) })} />
                        {collection.label[lang]}
                      </label>
                    ))}
                  </div>

                  <div className="form-row-3">
                    <input className="input" type="number" min="0" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} placeholder={t('price')} />
                    <input className="input" type="number" min="0" value={form.oldPrice} onChange={event => setForm({ ...form, oldPrice: event.target.value })} placeholder={t('oldPriceField')} />
                    <select className="input" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value as StockKey })}>
                      {Object.entries(stockLabels).map(([key, label]) => <option value={key} key={key}>{label[lang]}</option>)}
                    </select>
                  </div>

                  <div className="admin-variant-box">
                    <label className="toggle-row admin-variant-toggle">
                      <span>
                        <strong>Ölçü / variant qiymətləri</strong>
                        <small>XS, S, M, L, 60×60, 60×90, 1 litr və s. üçün ayrıca qiymət yazın.</small>
                      </span>
                      <button type="button" className={`switch ${form.variantsEnabled ? 'on' : ''}`} onClick={() => setForm({ ...form, variantsEnabled: !form.variantsEnabled })}><span /></button>
                    </label>
                    {form.variantsEnabled ? (
                      <div className="admin-variant-list">
                        <p className="microcopy">Məhsulun ölçüsü, həcmi və ya paket variantı varsa əlavə edin. Müştəri məhsul səhifəsində hər variantın qiymətini görəcək.</p>
                        {form.variants.map((variant, index) => (
                          <div className="admin-variant-row" key={variant.id}>
                            <div className="admin-variant-row-head">
                              <strong>Ölçü {index + 1}</strong>
                              <button className="tiny-btn admin-variant-remove" type="button" onClick={() => removeVariantRow(variant.id)} disabled={form.variants.length === 1} aria-label="Ölçünü sil">
                                <Trash2 size={14} /> Sil
                              </button>
                            </div>
                            <div className="form-row-3">
                              <input className="input" value={variant.labelAz} onChange={event => updateVariantRow(variant.id, { labelAz: event.target.value })} placeholder="Ölçü AZ — XS, 60×60, 1 litr" />
                              <input className="input" value={variant.labelEn} onChange={event => updateVariantRow(variant.id, { labelEn: event.target.value })} placeholder="Size EN" />
                              <input className="input" value={variant.labelRu} onChange={event => updateVariantRow(variant.id, { labelRu: event.target.value })} placeholder="Размер RU" />
                            </div>
                            <div className="form-row-3">
                              <input className="input" type="number" min="0" step="0.01" value={variant.price} onChange={event => updateVariantRow(variant.id, { price: event.target.value })} placeholder="Qiymət AZN" />
                              <input className="input" type="number" min="0" step="0.01" value={variant.oldPrice} onChange={event => updateVariantRow(variant.id, { oldPrice: event.target.value })} placeholder="Köhnə qiymət" />
                              <select className="input" value={variant.stock} onChange={event => updateVariantRow(variant.id, { stock: event.target.value as StockKey })}>
                                {Object.entries(stockLabels).map(([key, label]) => <option value={key} key={key}>{label[lang]}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                        <button className="btn btn-soft admin-variant-add" type="button" onClick={addVariantRow}>+ Ölçü əlavə et</button>
                      </div>
                    ) : null}
                  </div>

                  <div className="form-section-title">Kart badge</div>
                  <select className="input" value={form.badgePreset} onChange={event => setForm({ ...form, badgePreset: event.target.value as BadgePreset })}>
                    {Object.entries(badgePresetLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  {form.badgePreset === 'custom' ? (
                    <div className="form-row-3">
                      <input className="input" value={form.badgeCustomAz} onChange={event => setForm({ ...form, badgeCustomAz: event.target.value })} placeholder="Badge AZ" />
                      <input className="input" value={form.badgeCustomEn} onChange={event => setForm({ ...form, badgeCustomEn: event.target.value })} placeholder="Badge EN" />
                      <input className="input" value={form.badgeCustomRu} onChange={event => setForm({ ...form, badgeCustomRu: event.target.value })} placeholder="Badge RU" />
                    </div>
                  ) : null}

                  <label className="toggle-row">
                    <span>{form.active ? t('activeProduct') : t('inactiveProduct')}</span>
                    <button type="button" className={`switch ${form.active ? 'on' : ''}`} onClick={() => setForm({ ...form, active: !form.active })}><span /></button>
                  </label>
                  <button className="btn btn-primary" type="button" onClick={saveProduct} disabled={saving}><Save size={17} /> {saving ? t('saving') : editingProduct ? 'Redaktəni saxla' : t('save')}</button>
                  {message ? <p className="form-success">{message}</p> : null}
                </form>

                <aside id="preview" className="admin-preview-panel">
                  <p className="eyebrow">{t('productPreview')}</p>
                  <h3>{t('previewText')}</h3>
                  <ProductCard product={previewProduct} />
                </aside>
              </div>
            </section>
          ) : null}

          {adminTab === 'inactive' ? (
            <section id="inactive-products" className="info-card admin-products-panel">
              <div className="admin-panel-head">
                <div>
                  <p className="eyebrow">Passiv</p>
                  <h2>Passiv məhsullar</h2>
                  <p className="microcopy">Bu məhsullar saytda görünmür. Toggle-i yandıranda yenidən aktiv olur.</p>
                </div>
                <button className="btn btn-primary" type="button" onClick={startNewProduct}><ImagePlus size={17} /> Yeni məhsul əlavə et</button>
              </div>
              {renderAdminSearch()}
              {message ? <p className="form-success">{message}</p> : null}
              {renderProductList(inactiveProducts, adminSearch.trim() ? 'Axtarışa uyğun passiv məhsul tapılmadı.' : 'Passiv məhsul yoxdur.')}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
