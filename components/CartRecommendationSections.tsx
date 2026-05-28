'use client';

import { getAudienceLabel, getProductTypeLabel, type Product } from '@/lib/data';
import { useCatalog } from './CatalogProvider';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';
import { RecommendationShelf, uniqueProducts } from './RecommendationShelf';

export function CartRecommendationSections({ cartProducts }: { cartProducts: Product[] }) {
  const { t, lang } = useLanguage();
  const { products } = useCatalog();
  const { favorites } = useCart();
  const anchor = cartProducts[0];
  const hidden = new Set(cartProducts.map(item => item.slug));

  const favoriteItems = favorites.filter(item => !hidden.has(item.slug));
  favoriteItems.forEach(item => hidden.add(item.slug));

  if (!anchor) {
    return (
      <div className="recommendation-stack cart-recommendations">
        <RecommendationShelf title={t('favoriteProducts')} items={favoriteItems} limit={4} />
      </div>
    );
  }

  const sameType = products.filter(item => item.typeKey === anchor.typeKey && !hidden.has(item.slug));
  sameType.forEach(item => hidden.add(item.slug));

  const sameAudience = products.filter(item => item.audiences.some(audience => anchor.audiences.includes(audience)) && !hidden.has(item.slug));
  const primaryAudience = anchor.audiences[0];

  return (
    <div className="recommendation-stack cart-recommendations">
      <RecommendationShelf title={t('favoriteProducts')} items={favoriteItems} limit={4} />
      <RecommendationShelf title={t('sameTypeProducts')} subtitle={getProductTypeLabel(anchor.typeKey, lang)} items={sameType} limit={4} />
      <RecommendationShelf title={t('moreForThisPet')} subtitle={primaryAudience ? getAudienceLabel(primaryAudience, lang) : undefined} items={uniqueProducts(sameAudience)} limit={4} />
    </div>
  );
}
