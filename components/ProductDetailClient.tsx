'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Heart, Share2, Truck } from 'lucide-react';
import { getAudienceLabel, getCategoryLabel, getProductTypeLabel, stockLabels, type Product } from '@/lib/data';
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
  const title = product.name[lang];
  const text = `${title} - ${product.price} AZN`;

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

export function ProductDetailClient({ product: initialProduct, slug }: { product?: Product; slug: string }) {
  const { t, lang } = useLanguage();
  const { findProduct } = useCatalog();
  const { profile } = useCustomerProfile();
  const product = findProduct(slug) ?? initialProduct;
  const { toggleFavorite, isFavorite } = useCart();
  const gallery = product ? (product.images?.length ? product.images : [product.image]) : [];
  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? '');

  useEffect(() => {
    if (gallery[0] && !gallery.includes(selectedImage)) setSelectedImage(gallery[0]);
  }, [gallery, selectedImage]);

  if (!product) {
    return (
      <main className="page section">
        <div className="container empty">
          <p className="eyebrow">{t('products')}</p>
          <h1>{t('noProducts')}</h1>
          <Link href="/products" className="btn btn-primary">{t('backToProducts')}</Link>
        </div>
      </main>
    );
  }

  const liked = isFavorite(product.slug);
  const displayImage = selectedImage || product.image || '/products/cat-food.svg';
  const whatsappUrl = createWhatsAppUrl(buildProductQuestionMessage(product, lang, profile));
  const productDetails = product.details?.[lang]?.length ? product.details[lang] : [];

  return (
    <main className="page section">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">{t('home')}</Link> / <Link href="/products">{t('products')}</Link> / <span>{product.name[lang]}</span>
        </div>
        <div className="detail">
          <div className="detail-media">
            {product.badge && <span className="product-badge detail-badge">{product.badge[lang]}</span>}
            <div className="detail-main-image">
              <Image
                src={displayImage}
                alt={product.name[lang]}
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
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`${t('otherImages')} ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name[lang]} ${index + 1}`}
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
            <p className="eyebrow">{getCategoryLabel(product.categoryKey, lang)}</p>
            <h1>{product.name[lang]}</h1>
            <p>{product.description[lang]}</p>
            <div className="product-tags detail-tags">
              {product.audiences.map(audience => <span key={audience}>{getAudienceLabel(audience, lang)}</span>)}
              <span>{getProductTypeLabel(product.typeKey, lang)}</span>
              <span>{stockLabels[product.stock][lang]}</span>
            </div>
            <div className="detail-price">
              <span className="price">{product.price} AZN</span>
              {product.oldPrice && <span className="old-price">{product.oldPrice} AZN</span>}
            </div>
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
