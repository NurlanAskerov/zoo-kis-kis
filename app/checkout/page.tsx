'use client';

import Link from 'next/link';
import { MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { WhatsappOrderForm } from '@/components/WhatsappOrderForm';
import { useCart } from '@/components/cart-context';
import { useLanguage } from '@/components/LanguageProvider';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items } = useCart();

  return (
    <main className="page section page-spaced">
      <div className="container checkout-layout">
        <section className="info-card checkout-main-card">
          <p className="eyebrow">{t('checkoutKicker')}</p>
          <h1>{t('checkoutTitle')}</h1>
          <p>{t('checkoutText')}</p>
          <WhatsappOrderForm />
        </section>

        <aside className="green-block checkout-help-card">
          <MessageCircle size={36} />
          <h2>{t('whatsappFastTitle')}</h2>
          <p>{t('whatsappFastText')}</p>
          <div className="list checkout-tips">
            <span className="list-item"><ShoppingBag size={18} /> {items.length ? `${items.length} ${t('products')}` : t('cartEmptyTitle')}</span>
            <span className="list-item"><ShieldCheck size={18} /> {t('profileFormHint')}</span>
          </div>
          <Link href="/profile" className="btn btn-soft">{t('profile')}</Link>
        </aside>
      </div>
    </main>
  );
}
