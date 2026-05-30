'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, HeartHandshake, MapPin, PackageCheck, Scissors, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { deliverySettings, groomingServices, type ProductCollectionKey } from '@/lib/data';
import { CategoryScroller } from '@/components/CategoryScroller';
import { GroomingRequestButton } from '@/components/GroomingRequestButton';
import { ProductCarousel, type ProductCarouselHandle } from '@/components/ProductCarousel';
import { useLanguage } from '@/components/LanguageProvider';
import { useCatalog } from '@/components/CatalogProvider';

function CollectionBlock({ title, collection }: { title: string; collection: ProductCollectionKey }) {
  const { t } = useLanguage();
  const { products, loading } = useCatalog();
  const carouselRef = useRef<ProductCarouselHandle | null>(null);
  const items = products.filter(product => product.collections.includes(collection));

  if (loading) {
    return (
      <section className="section carousel-section compact-section">
        <div className="container collection-head">
          <div>
            <p className="eyebrow">{title}</p>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="container product-skeleton-row" aria-label="Məhsullar yüklənir">
          {Array.from({ length: 4 }).map((_, index) => <div className="product-skeleton-card" key={index} />)}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="section carousel-section compact-section">
      <div className="container collection-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{title}</h2>
        </div>
        <div className="collection-actions">
          {items.length > 1 ? (
            <div className="carousel-top-controls" aria-label={`${title} karusel idarəsi`}>
              <button className="carousel-top-arrow" type="button" aria-label="Əvvəlki məhsullar" onClick={() => carouselRef.current?.scrollPrevious()}>
                <ChevronLeft size={20} />
              </button>
              <button className="carousel-top-arrow" type="button" aria-label="Növbəti məhsullar" onClick={() => carouselRef.current?.scrollNext()}>
                <ChevronRight size={20} />
              </button>
            </div>
          ) : null}
          <Link className="btn btn-soft" href={`/products?collection=${collection}`}>{t('seeAll')}</Link>
        </div>
      </div>
      <ProductCarousel ref={carouselRef} items={items} />
    </section>
  );
}

export function HomePageClient() {
  const { t, lang } = useLanguage();
  const services = groomingServices[lang];

  return (
    <main>
      <section className="hero">
        <div className="container hero-card">
          <div className="hero-copy">
            <p className="eyebrow">{t('heroKicker')}</p>
            <h1>{t('heroTitle')}</h1>
            <p>{t('heroText')}</p>
            <div className="hero-cta">
              <Link href="/products" className="btn btn-primary">{t('viewProducts')}</Link>
              <Link href="/grooming" className="btn btn-soft">{t('orderGrooming')}</Link>
            </div>
            <div className="hero-points">
              <span className="hero-point"><Truck size={16} /> {t('deliveryAvailable')}</span>
              <span className="hero-point"><ShieldCheck size={16} /> {t('easyChoice')}</span>
              <span className="hero-point"><HeartHandshake size={16} /> {t('petCare')}</span>
            </div>
          </div>
          <div className="hero-visual hero-pets-visual">
            <div className="hero-pets-frame">
              <Image
                src="/hero-pets.png"
                alt="Pişik və it ilə Zoo Kis-Kis pet shop hero şəkli"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 52vw"
                className="hero-pets-image"
              />
            </div>
          </div>
        </div>
      </section>

      <CategoryScroller />

      <CollectionBlock title={t('discountedProducts')} collection="discount" />
      <CollectionBlock title={t('popularProducts')} collection="popular" />
      <CollectionBlock title={t('newProducts')} collection="new" />

      <section className="section grooming-delivery-section">
        <div className="container split">
          <div className="green-block grooming-block">
            <p className="eyebrow" style={{ color: 'white' }}>{t('grooming')}</p>
            <h2>{t('groomingTitle')}</h2>
            <p>{t('groomingText')}</p>
            <p className="grooming-home-note">{t('groomingHomeNote')}</p>
            <div className="list grooming-list">
              {services.slice(0, 4).map(service => (
                <span className="list-item" key={service}>
                  <Scissors size={18} /> {service}
                </span>
              ))}
            </div>
            <div className="grooming-actions">
              <GroomingRequestButton buttonClassName="btn btn-soft">{t('applyNow')}</GroomingRequestButton>
              <Link className="btn btn-light-outline" href="/grooming"><Sparkles size={17} /> {t('details')}</Link>
            </div>
            <span className="cat" role="img" aria-hidden="true">🐾</span>
          </div>

          <div className="info-card delivery-mini-card">
            <p className="eyebrow">{t('delivery')}</p>
            <h2>{t('deliveryTitle')}</h2>
            <p>{t('deliveryText')}</p>
            <div className="list">
              <span className="list-item"><Truck size={18} /> {t('metro')}: {deliverySettings.metroDeliveryPrice}</span>
              <span className="list-item"><MapPin size={18} /> {t('addressDelivery')}: {deliverySettings.addressDeliveryFromPrice[lang]}</span>
              <span className="list-item"><PackageCheck size={18} /> {t('regionPost')}: {deliverySettings.regionPostDeliveryTime[lang]}</span>
            </div>
            <Link href="/delivery" className="btn btn-primary">{t('moreInfo')}</Link>
          </div>
        </div>
      </section>

      <section className="why section">
        <div className="container">
          <div className="section-title">
            <p className="eyebrow">{t('why')}</p>
            <h2>{t('whyTitle')}</h2>
          </div>
          <div className="benefits">
            <div className="benefit"><PackageCheck /><h3>{t('catalog')}</h3><p>{t('catalogText')}</p></div>
            <div className="benefit"><Truck /><h3>{t('delivery')}</h3><p>{deliverySettings.workingHours}, {deliverySettings.workingDays[lang]}. {t('deliveryBenefitText')}</p></div>
            <div className="benefit"><HeartHandshake /><h3>{t('care')}</h3><p>{t('careText')}</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
