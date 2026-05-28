'use client';

import { useLanguage } from './LanguageProvider';

export function ProductsIntro() {
  const { t } = useLanguage();
  return (
    <div className="section-title">
      <p className="eyebrow">{t('productsKicker')}</p>
      <h1>{t('productsTitle')}</h1>
      <p>{t('productsText')}</p>
    </div>
  );
}
