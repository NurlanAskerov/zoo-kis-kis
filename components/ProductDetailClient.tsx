'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Heart, Share2, Truck } from 'lucide-react';
import {
  getAudienceLabel,
  getCategoryLabel,
  getProductTypeLabel,
  stockLabels,
  type AudienceKey,
  type Product,
  type ProductVariant
} from '@/lib/data';
import { useCatalog } from './CatalogProvider';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';
import { useCustomerProfile } from './customer-profile';
import { buildProductQuestionMessage, createWhatsAppUrl } from '@/lib/whatsapp';

async function shareProductDetail(product: Product, lang: 'az' | 'en' | 'ru') {
  const path = `/products/${product.slug}`;
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
  const title = product.name?.[lang] || product.name?.az || product.slug;
  const text = `${title} - ${product.price || 0} AZN`;

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard?.writeText(url);
  } catch {
    // İstifadəçi paylaşmanı bağlasa səhifə işini davam etdirsin.
  }
}

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Məhsul';
}

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

function isProductionHiddenDetail(value: string) {
  const normalized = value
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

  return hiddenProductionDetailPhrases.some(phrase => normalized.includes(
    phrase
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
  ));
}


const variantCopy = {
  az: { title: 'Ölçü seç', subtitle: 'Ölçünü seçəndə qiymət avtomatik dəyişir', unavailable: 'Stokda yoxdur' },
  en: { title: 'Choose size', subtitle: 'The price updates when you choose a size', unavailable: 'Out of stock' },
  ru: { title: 'Выберите размер', subtitle: 'Цена обновляется после выбора размера', unavailable: 'Нет в наличии' }
};

function getProductVariants(product: Product) {
  return (product.variants ?? [])
    .filter(variant => variant?.label?.az && Number.isFinite(Number(variant.price)) && Number(variant.price) > 0);
}

function isVariantSelectable(variant: ProductVariant) {
  return (variant.stock ?? 'inStock') !== 'preOrder';
}

function getInitialVariantId(variants: ProductVariant[]) {
  return (variants.find(isVariantSelectable) ?? variants[0])?.id ?? '';
}

export function ProductDetailClient({ product: initialProduct, slug }: { product?: Product; slug: string }) {
  const { t, lang } = useLanguage();
  const { findProduct, loading: catalogLoading } = useCatalog();
  const { profile } = useCustomerProfile();
  const { toggleFavorite, isFavorite } = useCart();
  const [remoteProduct, setRemoteProduct] = useState<Product | undefined>(initialProduct);
  const [remoteLoading, setRemoteLoading] = useState(!initialProduct);
  const [remoteTried, setRemoteTried] = useState(Boolean(initialProduct));
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const catalogProduct = findProduct(slug);
  const product = catalogProduct ?? remoteProduct;
  const productVariants = product ? getProductVariants(product) : [];

  useEffect(() => {
    if (!productVariants.length) {
      setSelectedVariantId('');
      return;
    }

    setSelectedVariantId(current => {
      const currentVariant = productVariants.find(variant => variant.id === current);
      if (currentVariant && isVariantSelectable(currentVariant)) return current;
      return getInitialVariantId(productVariants);
    });
  }, [product?.slug, productVariants.length]);

  useEffect(() => {
    setRemoteProduct(initialProduct);
    setRemoteLoading(!initialProduct);
    setRemoteTried(Boolean(initialProduct));
  }, [initialProduct, slug]);

  useEffect(() => {
    if (product || catalogLoading || remoteTried) return;

    let cancelled = false;

    async function loadProduct() {
      setRemoteLoading(true);
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const data = await response.json().catch(() => ({})) as { product?: Product | null };

        if (!cancelled && data.product) {
          setRemoteProduct(data.product);
        }
      } catch {
        // boş qalsın, fake məhsul göstərməyək
      } finally {
        if (!cancelled) {
          setRemoteLoading(false);
          setRemoteTried(true);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [product, catalogLoading, remoteTried, slug]);

  const gallery = product ? (product.images?.length ? product.images : [product.image || '/products/cat-food.svg']) : [];
  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? '');

  useEffect(() => {
    const firstImage = gallery[0] || '';
    if (firstImage && (!selectedImage || !gallery.includes(selectedImage))) setSelectedImage(firstImage);
  }, [gallery, selectedImage]);

  if (!product) {
    const isStillLoading = catalogLoading || remoteLoading || !remoteTried;

    return (
      <main className="page section">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t('home')}</Link> / <Link href="/products">{t('products')}</Link> / <span>{titleFromSlug(slug)}</span>
          </div>

          {isStillLoading ? (
            <div className="detail detail-skeleton" aria-label="Məhsul yüklənir">
              <div className="detail-media">
                <div className="detail-main-image product-detail-skeleton-image" />
              </div>
              <div className="detail-content">
                <div className="product-detail-skeleton-line short" />
                <div className="product-detail-skeleton-title" />
                <div className="product-detail-skeleton-line" />
                <div className="product-detail-skeleton-line medium" />
              </div>
            </div>
          ) : (
            <div className="empty">
              <p className="eyebrow">{t('products')}</p>
              <h1>{titleFromSlug(slug)}</h1>
              <p>Məhsul məlumatı tapılmadı və fake məhsul göstərilmir. Admin paneldə məhsulun aktiv olduğuna və slug dəyərinin düzgün olduğuna baxın.</p>
              <Link href="/products" className="btn btn-primary">{t('backToProducts')}</Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  const liked = isFavorite(product.slug);
  const displayImage = selectedImage || product.image || '/products/cat-food.svg';
  const productDetails = (product.details?.[lang]?.length ? product.details[lang] : []).filter(item => !isProductionHiddenDetail(item));
  const selectedVariant = productVariants.find(variant => variant.id === selectedVariantId) ?? productVariants.find(isVariantSelectable) ?? productVariants[0];
  const selectedPrice = selectedVariant ? Number(selectedVariant.price || 0) : Number(product.price || 0);
  const selectedOldPrice = selectedVariant?.oldPrice ? Number(selectedVariant.oldPrice) : Number(product.oldPrice || 0);
  const selectedStock = selectedVariant?.stock ?? product.stock;
  const whatsappUrl = createWhatsAppUrl(buildProductQuestionMessage(product, lang, profile, selectedVariant));
  const productAudiences: AudienceKey[] = product.audiences?.length ? product.audiences : ['allPets'];
  const productTitle = product.name?.[lang] || product.name?.az || titleFromSlug(slug);
  const productDescription = product.description?.[lang] || product.description?.az || '';

  return (
    <main className="page section">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">{t('home')}</Link> / <Link href="/products">{t('products')}</Link> / <span>{productTitle}</span>
        </div>
        <div className="detail">
          <div className="detail-media">
            {product.badge && <span className="product-badge detail-badge">{product.badge[lang]}</span>}
            <div className="detail-main-image">
              <Image
                src={displayImage}
                alt={productTitle}
                width={620}
                height={620}
                priority
                quality={82}
                sizes="(max-width: 768px) 94vw, 620px"
                draggable={false}
                unoptimized={displayImage.startsWith('data:')}
              />
            </div>
            {gallery.length > 1 && (
              <div className="detail-thumbs" aria-label={t('otherImages')}>
                {gallery.map((image, index) => (
                  <button
                    type="button"
                    className={selectedImage === image ? 'detail-thumb active' : 'detail-thumb'}
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`${t('otherImages')} ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${productTitle} ${index + 1}`}
                      width={88}
                      height={88}
                      quality={68}
                      sizes="88px"
                      draggable={false}
                      unoptimized={image.startsWith('data:')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="detail-content">
            <p className="eyebrow">{getCategoryLabel(product.categoryKey, lang)}</p>
            <h1>{productTitle}</h1>
            {productDescription ? <p>{productDescription}</p> : null}
            <div className="product-tags detail-tags">
              {productAudiences.map(audience => <span key={audience}>{getAudienceLabel(audience, lang)}</span>)}
              <span>{getProductTypeLabel(product.typeKey, lang)}</span>
              <span className={selectedStock === 'preOrder' ? 'muted-stock' : ''}>{stockLabels[selectedStock]?.[lang] ?? stockLabels.inStock[lang]}</span>
            </div>
            <div className="detail-price">
              <span className="price">{selectedPrice || 0} AZN</span>
              {selectedOldPrice > selectedPrice ? <span className="old-price">{selectedOldPrice} AZN</span> : null}
            </div>
            {productVariants.length ? (
              <div className="product-variant-panel">
                <div className="product-variant-head">
                  <strong>{variantCopy[lang].title}</strong>
                  <span>{variantCopy[lang].subtitle}</span>
                </div>
                <div className="product-variant-choice-list" role="list" aria-label={variantCopy[lang].title}>
                  {productVariants.map(variant => {
                    const selectable = isVariantSelectable(variant);
                    const active = selectedVariant?.id === variant.id;
                    return (
                      <button
                        className={`product-variant-choice ${active ? 'active' : ''} ${selectable ? '' : 'disabled'}`}
                        key={variant.id}
                        type="button"
                        disabled={!selectable}
                        onClick={() => setSelectedVariantId(variant.id)}
                      >
                        <span>{variant.label?.[lang] || variant.label?.az}</span>
                        {!selectable ? <small>{variantCopy[lang].unavailable}</small> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {productDetails.length ? (
              <div className="list">
                {productDetails.map(item => <span className="list-item" key={item}><CheckCircle2 size={18} /> {item}</span>)}
              </div>
            ) : null}
            <div className="detail-actions hero-cta">
              <AddToCartButton slug={product.slug} />
              <a className="btn btn-soft" href={whatsappUrl} target="_blank" rel="noreferrer"><Truck size={17} /> {t('shareOnWhatsapp')}</a>
              <button className="btn btn-soft" type="button" onClick={() => shareProductDetail(product, lang)}><Share2 size={17} /> {t('shareProduct')}</button>
              <button className={liked ? 'btn btn-red favorite-action-active' : 'btn btn-red'} onClick={() => toggleFavorite(product.slug)} type="button">
                <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {t('favorites')}
              </button>
            </div>
            <Link className="details-link" href="/products">← {t('backToProducts')}</Link>
          </div>
        </div>
        <ProductRecommendations product={product} />
      </div>
    </main>
  );
}
