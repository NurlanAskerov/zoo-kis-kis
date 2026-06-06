'use client';

import Link from 'next/link';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/BrandIcons';
import { brand } from '@/lib/data';
import { useLanguage } from './LanguageProvider';

export function Footer() {
  const { t, lang } = useLanguage();

  const categoryLinks = [
    { href: '/products?type=dryFood', label: { az: 'Quru yemlər', en: 'Dry food', ru: 'Сухой корм' } },
    { href: '/products?type=wetFood', label: { az: 'Yaş yemlər', en: 'Wet food', ru: 'Влажный корм' } },
    { href: '/products?type=toy', label: { az: 'Oyuncaqlar', en: 'Toys', ru: 'Игрушки' } },
    { href: '/products?type=grooming', label: { az: 'Grooming', en: 'Grooming', ru: 'Услуги груминга' } }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>{brand.name}</h3>
            <p>{brand.tagline}. {t('heroText')}</p>
            <div className="socials">
              <a href={`https://instagram.com/${brand.instagram}`} aria-label="Instagram"><InstagramIcon size={17} /></a>
              <a href="#" aria-label="Facebook"><FacebookIcon size={17} /></a>
              <a href="#" aria-label="TikTok"><TikTokIcon size={17} /></a>
            </div>
          </div>
          <div>
            <strong>{t('menu')}</strong>
            <div className="footer-links">
              <Link href="/products">{t('products')}</Link>
              <Link href="/grooming">{t('grooming')}</Link>
              <Link href="/delivery">{t('delivery')}</Link>
              <Link href="/about">{t('about')}</Link>
            </div>
          </div>
          <div>
            <strong>{t('categories')}</strong>
            <div className="footer-links">
              {categoryLinks.map(item => <Link href={item.href} key={item.href}>{item.label[lang]}</Link>)}
            </div>
          </div>
          <div>
            <strong>{t('contact')}</strong>
            <p>{brand.phone}</p>
            <p>{brand.address}</p>
            <p>{t('workHours')}: 10:00 - 20:00</p>
          </div>
        </div>
        <div className="copyright">© {new Date().getFullYear()} Zoo Kis-Kis.</div>
      </div>
    </footer>
  );
}
