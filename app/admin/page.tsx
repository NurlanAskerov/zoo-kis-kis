'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, LockKeyhole, LogOut, Save, ShieldCheck, Star, Trash2 } from 'lucide-react';
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

function formToProduct(form: ProductForm): Product {
  const imageList = form.imagesText.split('\n').map(item => item.trim()).filter(Boolean);
  const image = form.image.trim() || imageList[0] || '/products/cat-food.svg';
  const nameAz = form.nameAz.trim() || 'Yeni məhsul';
  const descriptionAz = form.descriptionAz.trim() || 'Məhsul haqqında məlumat.';

  return {
    id: Date.now(),
    slug: slugify(nameAz),
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

async function optimizeImageForUpload(file: File) {
  if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    throw new Error('HEIC/Live Photo formatı dəstəklənmir. Şəkli iPhone-da JPG kimi export edib yenidən seçin.');
  }

  if (file.type === 'image/svg+xml') {
    return { file, previewUrl: await fileToDataUrl(file) };
  }

  const source = await imageFromFile(file);
  const maxWidth = 1600;
  const maxHeight = 2000;
  const ratio = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Browser şəkli optimizasiya edə bilmədi.');
  context.drawImage(source, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, 'image/webp', 0.82);
  let type = 'image/webp';
  let extension = 'webp';

  if (!blob) {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.82);
    type = 'image/jpeg';
    extension = 'jpg';
  }

  if (!blob) throw new Error('Şəkil optimizasiya olunmadı. Başqa format seçin.');

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
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() => initialForm.imagesText.split('\n').filter(Boolean).map((url, index) => ({ id: `initial-${index}`, name: `Şəkil ${index + 1}`, previewUrl: url, url, status: 'uploaded' as ImageUploadStatus })));
  const [orders, setOrders] = useState<Array<Record<string, string | number | null>>>([]);
  const selectedDepartment = getDepartmentForProductType(form.typeKey);
  const adminSubcategoryOptions = getSubcategoryOptionsForDepartment(selectedDepartment);

  function changeDepartment(department: ProductDepartmentKey) {
    const firstSubcategory = getSubcategoryOptionsForDepartment(department)[0]?.key ?? 'dryFood';
    setForm({ ...form, typeKey: firstSubcategory, categoryKey: categoryKeyFromType(firstSubcategory) });
  }

  function changeSubcategory(typeKey: ProductTypeKey) {
    setForm({ ...form, typeKey, categoryKey: categoryKeyFromType(typeKey) });
  }

  const previewProduct = useMemo(() => formToProduct(form), [form]);

  async function checkSession() {
    const response = await fetch('/api/admin/me', { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => ({}));
    if (data.authenticated) {
      setLoggedIn(true);
      await refreshProducts();
      await loadAdminProducts();
      await loadOrders();
    }
  }

  async function loadOrders() {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => ({ orders: [] }));
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  }

  async function loadAdminProducts() {
    const response = await fetch('/api/products?includeInactive=1', { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => ({ products: [] })) as { products?: Product[] };
    if (Array.isArray(data.products)) setAdminProducts(data.products);
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
    await loadOrders();
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

  async function saveProduct() {
    setSaving(true);
    setMessage('');
    const product = formToProduct(form);
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage('Məhsul saxlanmadı. Admin sessiyasını və .env şifrəsini yoxlayın.');
      return;
    }

    setMessage(data.saved === false ? 'Məhsul preview üçün hazırdır. Turso məlumatları .env-də yazılandan sonra bazaya saxlanacaq.' : 'Məhsul bazaya saxlandı.');
    await refreshProducts();
    await loadAdminProducts();
  }

  async function toggleActive(product: Product) {
    const response = await fetch(`/api/products/${product.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: product.active === false })
    });
    if (response.ok) {
      await refreshProducts();
      await loadAdminProducts();
    }
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

        <div className="admin-grid enhanced-admin-grid">
          <aside className="sidebar">
            <a href="#products">{t('products')}</a>
            <a href="#add">{t('addProduct')}</a>
            <a href="#orders">{t('orders')}</a>
            <a href="#preview">{t('productPreview')}</a>
          </aside>

          <div className="admin-main-stack">
            <section id="products" className="info-card">
              <p className="eyebrow">{t('products')}</p>
              <h2>{t('productList')}</h2>
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('name')}</th>
                      <th>{t('department')}</th>
                      <th>{t('price')}</th>
                      <th>{t('stock')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map(product => (
                      <tr key={product.slug}>
                        <td>{product.name[lang]}</td>
                        <td>{getDepartmentLabel(getDepartmentForProductType(product.typeKey), lang)} · {getProductTypeLabel(product.typeKey, lang)}</td>
                        <td>{product.price} AZN</td>
                        <td>{stockLabels[product.stock][lang]}</td>
                        <td>
                          <button className={`switch ${product.active === false ? '' : 'on'}`} type="button" onClick={() => toggleActive(product)} aria-label="active toggle">
                            <span />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="add" className="info-card admin-editor-card">
              <div>
                <p className="eyebrow">{t('addProduct')}</p>
                <h2>{t('adminProductEditor')}</h2>
                <p>{t('adminProductEditorText')}</p>
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
                    <small>Şəkil seçilən kimi preview görünür. Böyük şəkillər browser-də kiçildilir və upload arxa fonda R2-yə gedir.</small>
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
                  <button className="btn btn-primary" type="button" onClick={saveProduct} disabled={saving}><Save size={17} /> {saving ? t('saving') : t('save')}</button>
                  {message ? <p className="form-success">{message}</p> : null}
                </form>

                <aside id="preview" className="admin-preview-panel">
                  <p className="eyebrow">{t('productPreview')}</p>
                  <h3>{t('previewText')}</h3>
                  <ProductCard product={previewProduct} />
                </aside>
              </div>
            </section>

            <section id="orders" className="info-card">
              <p className="eyebrow">{t('orders')}</p>
              <h2>{t('lastOrders')}</h2>
              <p className="microcopy">Sifariş WhatsApp-a göndəriləndə backend qoşuludursa burada da görünür. Backend qoşulmayıbsa müştəri yenə WhatsApp-a yönləndirilir.</p>
              {orders.length ? (
                <div className="admin-product-list">
                  {orders.map(order => (
                    <div className="admin-product-row" key={String(order.id)}>
                      <div>
                        <strong>{String(order.customer_name || t('customer'))}</strong>
                        <span>{String(order.customer_phone || '-')} · {String(order.customer_address || '-')} · {String(order.total || 0)} AZN</span>
                      </div>
                      <span className="status-pill">{String(order.status || t('pending'))}</span>
                    </div>
                  ))}
                </div>
              ) : <p>Hələ sifariş yoxdur və ya database qoşulmayıb.</p>}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
