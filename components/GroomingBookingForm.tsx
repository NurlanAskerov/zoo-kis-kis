'use client';

import { CheckCircle2 } from 'lucide-react';
import { useCustomerProfile } from './customer-profile';
import { useLanguage } from './LanguageProvider';

export function GroomingBookingForm() {
  const { t } = useLanguage();
  const { isProfileReady } = useCustomerProfile();

  return (
    <div className="info-card booking-card compact-booking-card grooming-how-card">
      <p className="eyebrow">{t('bookGrooming')}</p>
      <h2>{t('groomingFormTitle')}</h2>
      <p>{t('groomingFormText')}</p>
      <div className="list grooming-mini-list">
        <span className="list-item"><CheckCircle2 size={18} /> {t('groomingMiniStep1')}</span>
        <span className="list-item"><CheckCircle2 size={18} /> {t('groomingMiniStep2')}</span>
        <span className="list-item"><CheckCircle2 size={18} /> {t('groomingMiniStep3')}</span>
      </div>
      <p className="microcopy">{isProfileReady ? t('profileReadyGrooming') : t('profileMissingGrooming')}</p>
    </div>
  );
}
