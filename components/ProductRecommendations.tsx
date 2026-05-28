'use client';

import { getAudienceLabel, getProductTypeLabel, type Product } from '@/lib/data';
import { useCatalog } from './CatalogProvider';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';
import { RecommendationShelf, uniqueProducts } from './RecommendationShelf';

export function ProductRecommendations({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { products } = useCatalog();
  const { favorites } = useCart();
  const hidden = new Set([product.slug]);

  const favoriteItems = favorites.filter(item => !hidden.has(item.slug));
  favoriteItems.forEach(item => hidden.add(item.slug));

  const sameType = products.filter(item => item.typeKey === product.typeKey && !hidden.has(item.slug));
  sameType.forEach(item => hidden.add(item.slug));

  const sameAudience = products.filter(item => item.audiences.some(audience => product.audiences.includes(audience)) && !hidden.has(item.slug));
  const primaryAudience = product.audiences[0];

  return (
    <div className="recommendation-stack">
      <RecommendationShelf
        title={t('favoriteProducts')}
        items={favoriteItems}
        limit={4}
      />
      <RecommendationShelf
        title={t('sameTypeProducts')}
        subtitle={getProductTypeLabel(product.typeKey, lang)}
        items={sameType}
        limit={4}
      />
      <RecommendationShelf
        title={t('moreForThisPet')}
        subtitle={primaryAudience ? getAudienceLabel(primaryAudience, lang) : undefined}
        items={uniqueProducts(sameAudience)}
        limit={4}
      />
    </div>
  );
}
