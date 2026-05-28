'use client';

import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { InstagramIcon } from '@/components/BrandIcons';
import { useCustomerProfile } from '@/components/customer-profile';
import { useLanguage } from '@/components/LanguageProvider';
import { brand } from '@/lib/data';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export default function ContactPage() {
  const { t } = useLanguage();
  const { profile, updateProfile } = useCustomerProfile();
  const [message, setMessage] = useState('');

  const whatsappUrl = useMemo(() => createWhatsAppUrl([
    `Salam, ${brand.name}. Sualım var.`,
    '',
    `Ad Soyad: ${profile.fullName || '-'}`,
    `Telefon: ${profile.phone || '-'}`,
    `Şəhər: ${profile.city || '-'}`,
    `Ünvan: ${profile.address || '-'}`,
    `Mesaj: ${message || '-'}`
  ].join('\n')), [profile, message]);

  return (
    <main className="page section page-spaced">
      <div className="container split">
        <div className="info-card">
          <p className="eyebrow">{t('contact')}</p>
          <h1>{t('contactTitle')}</h1>
          <div className="list contact-list">
            <span className="list-item"><Phone size={18} /> {brand.phone}</span>
            <span className="list-item"><MapPin size={18} /> {brand.address}</span>
            <span className="list-item"><InstagramIcon size={18} /> Instagram: {brand.instagram}</span>
          </div>
          <div className="hero-cta">
            <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {t('whatsapp')}</a>
            <a className="btn btn-soft" href={`https://instagram.com/${brand.instagram}`}>Instagram</a>
          </div>
        </div>
        <div className="info-card">
          <h2>{t('sendMessage')}</h2>
          <p>{t('profileFormHint')}</p>
          <form className="form-grid">
            <input className="input" value={profile.fullName} onChange={event => updateProfile({ fullName: event.target.value })} placeholder={t('yourName')} />
            <input className="input" value={profile.phone} onChange={event => updateProfile({ phone: event.target.value })} placeholder={t('phone')} />
            <input className="input" value={profile.address} onChange={event => updateProfile({ address: event.target.value })} placeholder={t('address')} />
            <textarea className="input" value={message} onChange={event => setMessage(event.target.value)} placeholder={t('yourMessage')} />
            <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {t('sendToWhatsapp')}</a>
          </form>
        </div>
      </div>
    </main>
  );
}
