'use client';

import type { CustomerProfile } from './customer-profile';
import { useLanguage } from './LanguageProvider';

type ProfileFieldsProps = {
  value: CustomerProfile;
  onChange: (profile: CustomerProfile) => void;
  showNote?: boolean;
};

export function ProfileFields({ value, onChange, showNote = true }: ProfileFieldsProps) {
  const { t } = useLanguage();

  function setField(key: keyof CustomerProfile, fieldValue: string) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="form-grid compact-form-grid">
      <input className="input" value={value.fullName} onChange={event => setField('fullName', event.target.value)} placeholder={t('fullName')} />
      <input className="input" value={value.phone} onChange={event => setField('phone', event.target.value)} placeholder={t('phone')} />
      <input className="input" value={value.city ?? ''} onChange={event => setField('city', event.target.value)} placeholder={t('city')} />
      <input className="input" value={value.address} onChange={event => setField('address', event.target.value)} placeholder={t('address')} />
      {showNote ? (
        <textarea className="input" value={value.note ?? ''} onChange={event => setField('note', event.target.value)} placeholder={t('note')} />
      ) : null}
    </div>
  );
}
