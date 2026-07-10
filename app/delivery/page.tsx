'use client';

import { Clock, Info, Truck } from 'lucide-react';
import { deliverySettings } from '@/lib/data';
import { useLanguage } from '@/components/LanguageProvider';

export default function DeliveryPage() {
  const { t, lang } = useLanguage();

  return (
    <main className="page section">
      <div className="container">
        <div className="section-title">
          <p className="eyebrow">{t('delivery')}</p>
          <h1>{t('deliveryPageTitle')}</h1>
          <p>{deliverySettings.deliveryOnlyText[lang]}. {deliverySettings.deliveryTimeText[lang]}.</p>
        </div>
        <div className="product-grid info-grid">
          <div className="info-card">
            <Truck size={30} />
            <h2>{t('toMetro')}</h2>
            <p>Bolt</p>
          </div>
          <div className="info-card">
            <Clock size={30} />
            <h2>{t('toAddress')}</h2>
            <p>{deliverySettings.workingHours}, {deliverySettings.workingDays[lang]}</p>
          </div>
          <div className="info-card">
            <Info size={30} />
            <h2>{t('toRegions')}</h2>
            <p>{deliverySettings.deliveryOnlyText[lang]}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
