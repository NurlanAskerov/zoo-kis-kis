'use client';

import { MessageCircle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { brand } from '@/lib/data';
import { useLanguage } from './LanguageProvider';

export function FloatingContact() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const tel = `tel:${brand.phone.replace(/\s/g, '')}`;

  return (
    <div className="floating-contact" aria-live="polite">
      {open && (
        <div className="floating-contact-menu">
          <a href={tel} className="floating-contact-link">
            <Phone size={18} />
            <span>{t('call')}</span>
          </a>
          <a href={brand.whatsapp} className="floating-contact-link floating-contact-whatsapp" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            <span>{t('whatsapp')}</span>
          </a>
        </div>
      )}
      <button
        type="button"
        className="floating-phone"
        aria-label={open ? t('close') : t('phone')}
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        {open ? <X size={24} /> : <Phone size={24} />}
      </button>
    </div>
  );
}
