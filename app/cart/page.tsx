'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart-context';
import { useCatalog } from '@/components/CatalogProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { getProductCategoryLabel } from '@/lib/data';
import { CartRecommendationSections } from '@/components/CartRecommendationSections';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { catalogFilters } = useCatalog();
  const { t, lang } = useLanguage();

  if (items.length === 0) {
    return (
      <main className="page section">
        <div className="container">
          <div className="empty">
            <p className="eyebrow">{t('cart')}</p>
            <h1>{t('cartEmptyTitle')}</h1>
            <p>{t('cartEmptyText')}</p>
            <Link href="/products" className="btn btn-primary">{t('goToProducts')}</Link>
          </div>
          <CartRecommendationSections cartProducts={[]} />
        </div>
      </main>
    );
  }

  return (
    <main className="page section cart-page-with-sticky">
      <div className="container">
        <div className="section-title compact-cart-title">
          <p className="eyebrow">{t('cart')}</p>
          <h1>{t('cartTitle')}</h1>
          <p>{t('cartText')}</p>
        </div>
        <div className="cart-layout trendy-cart-layout">
          <div className="cart-products-list">
            {items.map(item => (
              <div className="cart-item" key={item.slug}>
                <Image src={item.product.image} alt={item.product.name[lang]} width={92} height={92} />
                <div>
                  <h3>{item.product.name[lang]}</h3>
                  <p>{getProductCategoryLabel(item.product, lang, catalogFilters)} · {item.product.price} AZN</p>
                  <div className="qty">
                    <button onClick={() => updateQuantity(item.slug, item.quantity - 1)} aria-label="minus"><Minus size={15} /></button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => updateQuantity(item.slug, item.quantity + 1)} aria-label="plus"><Plus size={15} /></button>
                  </div>
                </div>
                <button className="btn btn-red cart-remove-btn" onClick={() => removeFromCart(item.slug)}><Trash2 size={16} /> {t('remove')}</button>
              </div>
            ))}
          </div>
          <aside className="info-card cart-summary-card">
            <p className="eyebrow">{t('summary')}</p>
            <h2>{subtotal} AZN</h2>
            <p>{t('deliveryPriceInfo')}</p>
            <Link href="/checkout" className="btn btn-primary">{t('checkout')}</Link>
            <button className="btn btn-soft" style={{ marginTop: 10 }} onClick={clearCart}>{t('clearCart')}</button>
          </aside>
        </div>
        <CartRecommendationSections cartProducts={items.map(item => item.product)} />
      </div>
      <div className="mobile-cart-sticky" aria-label={t('summary')}>
        <div>
          <span>{t('summary')}</span>
          <strong>{subtotal} AZN</strong>
        </div>
        <Link href="/checkout" className="btn btn-primary">{t('checkout')}</Link>
      </div>
    </main>
  );
}
