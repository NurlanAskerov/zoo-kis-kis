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
  const primaryAudience = product.audiences[0];
  const department = getDepartmentForProductType(product.typeKey);
  const images = product.images?.length ? product.images : [product.image];
  const hoverImage = images[1];
  const liked = isFavorite(product.slug);

  return (
    <article className="product-card">
      <button
        className="product-share-btn"
        aria-label={t('shareProduct')}
        onClick={() => shareProduct(product, lang)}
        type="button"
      >
        <Share2 size={16} />
      </button>
      <Link href={`/products/${product.slug}`} className="product-media" aria-label={`${product.name[lang]} ${t('details')}`}>
        {product.badge && <span className="product-badge">{product.badge[lang]}</span>}
        <Image
          className={`product-img product-img-primary ${hoverImage ? 'has-hover' : ''}`}
          src={images[0]}
          alt={product.name[lang]}
          unoptimized={images[0].startsWith('http') || images[0].startsWith('data:')}
          width={320}
          height={320}
        />
        {hoverImage && (
          <Image
            className="product-img product-img-hover"
            src={hoverImage}
            alt={product.name[lang]}
            unoptimized={hoverImage.startsWith('http') || hoverImage.startsWith('data:')}
            width={320}
            height={320}
          />
        )}
      </Link>
      <div className="product-body">
        <div className="product-meta">
          <span>{getDepartmentLabel(department, lang)}</span>
          <span>{stockLabels[product.stock][lang]}</span>
        </div>
        <Link href={`/products/${product.slug}`}><h3 className="product-title">{product.name[lang]}</h3></Link>
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
              onClick={() => toggleFavorite(product.slug)}
              type="button"
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <AddToCartButton slug={product.slug} label="" className="tiny-btn" />
          </div>
        </div>
        <Link className="details-link" href={`/products/${product.slug}`}>{t('details')}</Link>
      </div>
    </article>
  );
}
