'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';

export function AddToCartButton({ slug, label, className = 'btn btn-primary' }: { slug: string; label?: string; className?: string }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const text = label === undefined ? t('addToCart') : label;
  return (
    <button
      className={className}
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(slug);
      }}
    >
      <ShoppingBag size={17} /> {text}
    </button>
  );
}
