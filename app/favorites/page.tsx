'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/components/cart-context';
import { useLanguage } from '@/components/LanguageProvider';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useCart();
  const { t } = useLanguage();

  return (
    <main className="page section">
      <div className="container">
        <div className="section-title">
          <p className="eyebrow">{t('favorites')}</p>
          <h1>{t('favoritesTitle')}</h1>
          <p>{t('favoritesText')}</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty favorites-empty">
            <Heart size={34} />
            <h2>{t('favoritesEmptyTitle')}</h2>
            <p>{t('favoritesEmptyText')}</p>
            <Link href="/products" className="btn btn-primary">{t('goToProducts')}</Link>
          </div>
        ) : (
          <>
            <div className="favorites-toolbar">
              <span>{favorites.length} {t('results')}</span>
              <button className="btn btn-soft" onClick={clearFavorites} type="button">{t('clearFavorites')}</button>
            </div>
            <div className="product-grid">
              {favorites.map(product => <ProductCard key={product.slug} product={product} />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
