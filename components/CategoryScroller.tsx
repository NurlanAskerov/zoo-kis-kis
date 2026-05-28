'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

type CategoryCard = {
  href: string;
  label: string;
  text: string;
  image: string;
  alt: string;
  size?: 'big' | 'normal' | 'wide';
  position?: string;
};

export function CategoryScroller() {
  const { t } = useLanguage();

  const cards: CategoryCard[] = [
    {
      href: '/products?audience=cats',
      label: t('categoryCatsTitle'),
      text: t('categoryCatsText'),
      image: '/cat-products.webp',
      alt: t('categoryCatsTitle'),
      size: 'big',
      position: 'center center'
    },
    {
      href: '/products?audience=dogs',
      label: t('categoryDogsTitle'),
      text: t('categoryDogsText'),
      image: '/dog-products.webp',
      alt: t('categoryDogsTitle'),
      size: 'normal',
      position: 'center center'
    },
    {
      href: '/products?audience=fish',
      label: t('categoryFishTitle'),
      text: t('categoryFishText'),
      image: '/fish-products.webp',
      alt: t('categoryFishTitle'),
      size: 'wide',
      position: 'center center'
    },
    {
      href: '/products?audience=birds',
      label: t('categoryBirdsTitle'),
      text: t('categoryBirdsText'),
      image: '/bird-products.webp',
      alt: t('categoryBirdsTitle'),
      size: 'normal',
      position: 'center center'
    },
    {
      href: '/products?audience=hamsters',
      label: t('categoryHamstersTitle'),
      text: t('categoryHamstersText'),
      image: '/hamster-products.webp',
      alt: t('categoryHamstersTitle'),
      size: 'wide',
      position: 'center center'
    }
  ];

  const renderCard = (card: CategoryCard, className = '') => (
    <Link
      href={card.href}
      className={`category-card ${card.size ?? 'normal'} ${className}`}
      key={card.href}
    >
      <Image
        src={card.image}
        alt={card.alt}
        fill
        sizes={
          card.size === 'big'
            ? '(max-width: 768px) 100vw, 34vw'
            : '(max-width: 768px) 100vw, 33vw'
        }
        className="category-bg"
        style={{ objectPosition: card.position ?? 'center center' }}
      />

      <div className="category-overlay">
        <span className="pill">{card.label}</span>

        <div className="category-title-box">
          <h3>{card.text}</h3>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="category-strip">
      <div className="container category-grid">
        {renderCard(cards[0], 'big-card')}

        <div className="category-column">
          {renderCard(cards[1])}
          {renderCard(cards[3])}
        </div>

        <div className="category-column">
          {renderCard(cards[2])}
          {renderCard(cards[4])}
        </div>
      </div>
    </section>
  );
}
