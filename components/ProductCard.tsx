'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2 } from 'lucide-react';
import { getAudienceLabel, getDepartmentForProductType, getDepartmentLabel, getProductTypeLabel, stockLabels, type Product } from '@/lib/data';
import { AddToCartButton } from './AddToCartButton';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';

async function shareProduct(product: Product, lang: 'az' | 'en' | 'ru') {
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
    // Paylaşma istifadəçi tərəfindən bağlana bilər; kartın işi dayanmasın.
  }
}

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { toggleFavorite, isFavorite } = useCart();
  const primaryAudience = product.audiences?.[0] ?? 'allPets';
  const department = getDepartmentForProductType(product.typeKey);
  const images = product.images?.length ? product.images : [product.image || '/products/cat-food.svg'];
  const hoverImage = images[1];
  const liked = isFavorite(product.slug);
  const mainIsData = images[0]?.startsWith('data:') ?? false;
  const hoverIsData = Boolean(hoverImage?.startsWith('data:'));

  return (
    <article className="product-card">
      <button
        className="product-share-btn"
        aria-label={t('shareProduct')}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void shareProduct(product, lang);
        }}
        type="button"
      >
        <Share2 size={16} />
      </button>
      <Link href={`/products/${product.slug}`} prefetch={false} className="product-media" aria-label={`${product.name[lang]} ${t('details')}`}>
        {product.badge && <span className="product-badge">{product.badge[lang]}</span>}
        <Image
          className={`product-img product-img-primary ${hoverImage ? 'has-hover' : ''}`}
          src={images[0]}
          alt={product.name[lang]}
          unoptimized={mainIsData}
          width={320}
          height={320}
          quality={76}
          sizes="(max-width: 620px) 82vw, (max-width: 980px) 42vw, 260px"
          draggable={false}
          loading="lazy"
        />
        {hoverImage && (
          <Image
            className="product-img product-img-hover"
            src={hoverImage}
            alt={product.name[lang]}
            unoptimized={hoverIsData}
            width={320}
            height={320}
            quality={72}
            sizes="(max-width: 620px) 82vw, (max-width: 980px) 42vw, 260px"
            draggable={false}
            loading="lazy"
          />
        )}
      </Link>
      <div className="product-body">
        <div className="product-meta">
          <span>{getDepartmentLabel(department, lang)}</span>
          <span>{stockLabels[product.stock][lang]}</span>
        </div>
        <Link href={`/products/${product.slug}`} prefetch={false}><h3 className="product-title">{product.name[lang]}</h3></Link>
        <div className="product-tags" aria-label="Product filters">
          <span>{getAudienceLabel(primaryAudience, lang)}</span>
          <span>{getProductTypeLabel(product.typeKey, lang)}</span>
        </div>
        <div className="product-bottom">
          <div>
            <span className="price">{product.price} AZN</span>
            {product.oldPrice && <span className="old-price">{product.oldPrice} AZN</span>}
          </div>
          <div className="product-actions">
            <button
              className={`tiny-btn ${liked ? 'tiny-btn-active' : ''}`}
              aria-label={t('favorites')}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(product.slug);
              }}
              type="button"
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <AddToCartButton slug={product.slug} label="" className="tiny-btn" />
          </div>
        </div>
        <Link className="details-link" href={`/products/${product.slug}`} prefetch={false}>{t('details')}</Link>
      </div>
    </article>
  );
}
