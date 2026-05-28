'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Heart, Share2, Truck } from 'lucide-react';
import {
  getAudienceLabel,
  getCategoryLabel,
  getProductTypeLabel,
  stockLabels,
  type AudienceKey,
  type Product
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
    .trim()
    .replace(/\b\w/g, letter => letter.toLocaleUpperCase('az-AZ')) || 'Məhsul';
}

function createMinimalProduct(slug: string): Product {
  const title = titleFromSlug(slug);
  return {
    id: slug,
    slug,
    name: { az: title, en: title, ru: title },
    categoryKey: 'care',
    typeKey: 'care',
    audiences: ['allPets'],
    collections: [],
    price: 0,
    image: '/products/cat-food.svg',
    images: ['/products/cat-food.svg'],
    stock: 'inStock',
    active: true,
    description: { az: '', en: '', ru: '' },
    details: { az: [], en: [], ru: [] }
  };
}

export function ProductDetailClient({ product: initialProduct, slug }: { product?: Product; slug: string }) {
  const { t, lang } = useLanguage();
  const { findProduct, loading } = useCatalog();
  const { profile } = useCustomerProfile();
  const { toggleFavorite, isFavorite } = useCart();
  const [remoteProduct, setRemoteProduct] = useState<Product | undefined>(initialProduct);
  const [remoteLoading, setRemoteLoading] = useState(!initialProduct);

  const product = findProduct(slug) ?? remoteProduct;
  const displayProduct = product ?? createMinimalProduct(slug);
  const isMinimalFallback = !product;
  const gallery = displayProduct.images?.length ? displayProduct.images : [displayProduct.image || '/products/cat-food.svg'];
  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? '');

  useEffect(() => {
    setRemoteProduct(initialProduct);
    setRemoteLoading(!initialProduct);
  }, [initialProduct, slug]);

  useEffect(() => {
    if (product || loading) return;

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
        // Səhifə boş qalmasın deyə minimal məlumat göstərilir.
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [product, loading, slug]);

  useEffect(() => {
    const firstImage = gallery[0] || '/products/cat-food.svg';
    if (!selectedImage || !gallery.includes(selectedImage)) setSelectedImage(firstImage);
  }, [gallery, selectedImage]);

  const liked = isFavorite(displayProduct.slug);
  const displayImage = selectedImage || displayProduct.image || '/products/cat-food.svg';
  const whatsappUrl = createWhatsAppUrl(buildProductQuestionMessage(displayProduct, lang, profile));
  const productDetails = displayProduct.details?.[lang]?.length ? displayProduct.details[lang] : [];
  const productAudiences: AudienceKey[] = displayProduct.audiences?.length ? displayProduct.audiences : ['allPets'];
  const productTitle = displayProduct.name?.[lang] || displayProduct.name?.az || titleFromSlug(slug);
  const productDescription = displayProduct.description?.[lang] || displayProduct.description?.az || '';

  return (
    <main className="page section">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">{t('home')}</Link> / <Link href="/products">{t('products')}</Link> / <span>{productTitle}</span>
        </div>

        {remoteLoading && !product ? (
          <div className="detail-loading-note">Məhsul məlumatları yüklənir...</div>
        ) : null}

        <div className="detail">
          <div className="detail-media">
            {displayProduct.badge && <span className="product-badge detail-badge">{displayProduct.badge[lang]}</span>}
            <div className="detail-main-image">
              <Image
                src={displayImage}
                alt={productTitle}
                width={620}
                height={620}
                priority
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
            <p className="eyebrow">{getCategoryLabel(displayProduct.categoryKey, lang)}</p>
            <h1>{productTitle}</h1>
            {productDescription ? <p>{productDescription}</p> : null}
            {isMinimalFallback ? (
              <p className="microcopy">Bu məhsulun tam məlumatları hələ yüklənməyib. Ad və link saxlanıldı, database cavabı gələndə məlumatlar avtomatik tamamlanacaq.</p>
            ) : null}
            <div className="product-tags detail-tags">
              {productAudiences.map(audience => <span key={audience}>{getAudienceLabel(audience, lang)}</span>)}
              <span>{getProductTypeLabel(displayProduct.typeKey, lang)}</span>
              <span>{stockLabels[displayProduct.stock]?.[lang] ?? stockLabels.inStock[lang]}</span>
            </div>
            <div className="detail-price">
              <span className="price">{displayProduct.price || 0} AZN</span>
              {displayProduct.oldPrice && <span className="old-price">{displayProduct.oldPrice} AZN</span>}
            </div>
            {productDetails.length ? (
              <div className="list">
                {productDetails.map(item => <span className="list-item" key={item}><CheckCircle2 size={18} /> {item}</span>)}
              </div>
            ) : null}
            <div className="detail-actions hero-cta">
              {!isMinimalFallback ? <AddToCartButton slug={displayProduct.slug} /> : null}
              <a className="btn btn-soft" href={whatsappUrl} target="_blank" rel="noreferrer"><Truck size={17} /> {t('shareOnWhatsapp')}</a>
              <button className="btn btn-soft" type="button" onClick={() => shareProductDetail(displayProduct, lang)}><Share2 size={17} /> {t('shareProduct')}</button>
              {!isMinimalFallback ? (
                <button className={liked ? 'btn btn-red favorite-action-active' : 'btn btn-red'} onClick={() => toggleFavorite(displayProduct.slug)} type="button">
                  <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {t('favorites')}
                </button>
              ) : null}
            </div>
            <Link className="details-link" href="/products">← {t('backToProducts')}</Link>
          </div>
        </div>
        {!isMinimalFallback ? <ProductRecommendations product={displayProduct} /> : null}
      </div>
    </main>
  );
}
