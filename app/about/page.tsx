'use client';

import { HeartHandshake, MapPin, MessageCircle, PawPrint } from 'lucide-react';
import { InstagramIcon, TikTokIcon } from '@/components/BrandIcons';
import { brand } from '@/lib/data';
import { useLanguage } from '@/components/LanguageProvider';

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(brand.address)}&output=embed`;

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="page section">
      <div className="container split">
        <div className="info-card">
          <p className="eyebrow">{t('aboutKicker')}</p>
          <h1>{t('aboutTitle')}</h1>
          <p>{t('aboutText')}</p>
          <div className="list">
            <span className="list-item"><PawPrint size={18} /> {t('aboutPoint1')}</span>
            <span className="list-item"><HeartHandshake size={18} /> {t('aboutPoint2')}</span>
            <span className="list-item"><MapPin size={18} /> {brand.address}</span>
          </div>
        </div>

        <aside className="info-card social-map-card">
          <p className="eyebrow">{t('contact')}</p>
          <h2>{t('mapAndSocial')}</h2>
          <p>{t('mapAndSocialText')}</p>

          <div className="map-frame">
            <iframe
              title="Zoo Kis-Kis xəritə"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="social-card-links">
            <a className="btn btn-primary" href={brand.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> WhatsApp
            </a>
            <a className="btn btn-soft" href={`https://instagram.com/${brand.instagram}`} target="_blank" rel="noreferrer">
              <InstagramIcon size={17} /> Instagram
            </a>
            <a className="btn btn-soft" href={`https://www.tiktok.com/@${brand.tiktok}`} target="_blank" rel="noreferrer">
              <TikTokIcon size={17} /> TikTok
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
