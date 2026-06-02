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
  type ProductCollectionKey,
  type ProductDepartmentKey,
  type ProductTypeKey,
  type StockKey
} from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { useCatalog } from '@/components/CatalogProvider';
import { useLanguage } from '@/components/LanguageProvider';

type BadgePreset = 'none' | 'new' | 'discount' | 'popular' | 'limited' | 'custom';

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
  popular: { az: 'Populyar', en: 'Popular', ru: 'Популярное' },
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

  return {
    id: baseProduct?.id || slug,
    slug,
    name: {
      az: nameAz,
      en: form.nameEn.trim() || nameAz,
      ru: form.nameRu.trim() || nameAz
    },
    categoryKey: categoryKeyFromType(form.typeKey),
    typeKey: form.typeKey,
    audiences: form.audiences.length ? form.audiences : ['allPets'],
    collections: form.collections,
    price: Number(form.price || 0),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
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
      az: ['Admin paneldən əlavə olunub', 'Filter və stok məlumatları seçilib'],
      en: ['Added from admin panel', 'Filter and stock data selected'],
      ru: ['Добавлено из админ-панели', 'Выбраны фильтры и наличие']
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
    .toLowerCase()
    .replace(/[ə]/g, 'e')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[ğ]/g, 'g')
    .replace(/[ş]/g, 's')
    .replace(/[ç]/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function productMatchesSearch(product: Product, query: string) {
  const needle = normalizeSearch(query);
  if (!needle) return true;

  const haystack = normalizeSearch([
    product.name.az,
    product.name.en,
    product.name.ru,
    product.slug,
    product.price
  ].join(' '));

  return haystack.includes(needle);
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
  const selectedDepartment = getDepartmentForProductType(form.typeKey);
  const adminSubcategoryOptions = getSubcategoryOptionsForDepartment(selectedDepartment);
  const searchedProducts = useMemo(() => adminProducts.filter(product => productMatchesSearch(product, adminSearch)), [adminProducts, adminSearch]);
  const activeProducts = useMemo(() => searchedProducts.filter(product => product.active !== false), [searchedProducts]);
  const inactiveProducts = useMemo(() => searchedProducts.filter(product => product.active === false), [searchedProducts]);
  const totalActiveProducts = useMemo(() => adminProducts.filter(product => product.active !== false).length, [adminProducts]);
  const totalInactiveProducts = useMemo(() => adminProducts.filter(product => product.active === false).length, [adminProducts]);

  function changeDepartment(department: ProductDepartmentKey) {
    const firstSubcategory = getSubcategoryOptionsForDepartment(department)[0]?.key ?? 'dryFood';
    setForm({ ...form, typeKey: firstSubcategory, categoryKey: categoryKeyFromType(firstSubcategory) });
  }

  function changeSubcategory(typeKey: ProductTypeKey) {
    setForm({ ...form, typeKey, categoryKey: categoryKeyFromType(typeKey) });
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
      setMessage('Şəkil R2-yə yükləndi. Məhsulu yadda saxlayanda link bazaya yazılacaq.');
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
        setMessage(data.message || 'Məhsul saxlanmadı. Admin sessiyasını və .env şifrəsini yoxlayın.');
        return;
      }

      const savedProduct = data.product ?? product;
      setAdminProducts(current => {
        const withoutOld = current.filter(item => item.slug !== product.slug && item.slug !== editingProduct?.slug);
        return [savedProduct, ...withoutOld];
      });
      setEditingProduct(savedProduct);
      setMessage(data.saved === false ? 'Məhsul preview üçün hazırdır. Turso məlumatları .env-də yazılandan sonra bazaya saxlanacaq.' : editingProduct ? 'Məhsul redaktə edildi və bazaya yazıldı.' : 'Məhsul bazaya saxlandı.');
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
                  <span>{getDepartmentLabel(getDepartmentForProductType(product.typeKey), lang)} · {getProductTypeLabel(product.typeKey, lang)}</span>
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
                  <input className="input" value={form.nameRu} onChange={event => setForm({ ...form, nameRu: event.target.value })} placeholder="Название RU" />
                  <textarea className="input" value={form.descriptionAz} onChange={event => setForm({ ...form, descriptionAz: event.target.value })} placeholder="Açıqlama AZ" />
                  <textarea className="input" value={form.descriptionEn} onChange={event => setForm({ ...form, descriptionEn: event.target.value })} placeholder="Description EN" />
                  <textarea className="input" value={form.descriptionRu} onChange={event => setForm({ ...form, descriptionRu: event.target.value })} placeholder="Описание RU" />

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
                    <select className="input" value={selectedDepartment} onChange={event => changeDepartment(event.target.value as ProductDepartmentKey)} aria-label={t('department')}>
                      {productDepartmentOptions.map(department => <option value={department.key} key={department.key}>{department.label[lang]}</option>)}
                    </select>
                    <select className="input" value={form.typeKey} onChange={event => changeSubcategory(event.target.value as ProductTypeKey)} aria-label={t('subcategory')}>
                      {adminSubcategoryOptions.map(type => <option value={type.key} key={type.key}>{type.label[lang]}</option>)}
                    </select>
                  </div>

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
