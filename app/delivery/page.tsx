'use client';

import { MapPin, PackageCheck, Truck } from 'lucide-react';
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
          <p>{t('deliveryPageText')}: {deliverySettings.workingHours}, {deliverySettings.workingDays[lang]}.</p>
        </div>
        <div className="product-grid info-grid">
          <div className="info-card">
            <Truck size={30} />
            <h2>{t('toMetro')}</h2>
            <p>{deliverySettings.metroDeliveryPrice}</p>
          </div>
          <div className="info-card">
            <MapPin size={30} />
            <h2>{t('toAddress')}</h2>
            <p>{deliverySettings.addressDeliveryFromPrice[lang]}. {deliverySettings.addressDeliveryNote[lang]}.</p>
          </div>
          <div className="info-card">
            <PackageCheck size={30} />
            <h2>{t('toRegions')}</h2>
            <p>{deliverySettings.regionPostDeliveryTime[lang]}. {deliverySettings.regionPostDeliveryFromPrice[lang]}; {deliverySettings.postDeliveryNote[lang]}.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
