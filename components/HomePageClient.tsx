'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, HeartHandshake, MapPin, PackageCheck, Scissors, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import {
  audienceOptions,
  deliverySettings,
  groomingServices,
  productTypeOptions,
  type AudienceKey,
  type Lang,
  type ProductCollectionKey,
  type ProductTypeKey
} from '@/lib/data';
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

const quickFilterTypes: Record<Exclude<AudienceKey, 'allPets'>, ProductTypeKey[]> = {
  dogs: ['dryFood', 'wetFood', 'treat', 'leash', 'toy', 'carrier', 'bed', 'grooming'],
  cats: ['dryFood', 'wetFood', 'treat', 'litter', 'toilet', 'toy', 'carrier', 'bed', 'grooming'],
  birds: ['dryFood', 'treat', 'cage', 'toy', 'care'],
  fish: ['dryFood', 'aquarium', 'care'],
  hamsters: ['dryFood', 'treat', 'cage', 'bed', 'toy', 'care']
};

type QuickTabChild = { key: string; label: string; href: string; featured?: boolean };
type QuickTab = { key: string; label: string; href: string; children: QuickTabChild[] };

function labelsByLang(lang: Lang) {
  return {
    quick: lang === 'ru' ? 'Быстрый выбор' : lang === 'en' ? 'Quick filter' : 'Sürətli filter',
    all: lang === 'ru' ? 'Все товары' : lang === 'en' ? 'All products' : 'Bütün məhsullar',
    campaigns: lang === 'ru' ? 'Акции' : lang === 'en' ? 'Campaigns' : 'Kampaniyalar',
    discounted: lang === 'ru' ? 'Скидки' : lang === 'en' ? 'Discounts' : 'Endirimlər',
    popular: lang === 'ru' ? 'Популярные товары' : lang === 'en' ? 'Popular' : 'Populyar',
    newProducts: lang === 'ru' ? 'Новинки' : lang === 'en' ? 'New arrivals' : 'Yeni məhsullar'
  };
}

function quickDropdownLabels(lang: Lang) {
  return {
    viewAll: lang === 'ru' ? 'Перейти в раздел' : lang === 'en' ? 'View all in category' : 'Bu bölmədə hamısı',
    subcategories: lang === 'ru' ? 'Alt bölmələr' : lang === 'en' ? 'Subcategories' : 'Alt bölmələr'
  };
}


function QuickFilterMenu() {
  const { lang } = useLanguage();
  const labels = labelsByLang(lang);
  const dropdownLabels = quickDropdownLabels(lang);
  const tabs = useMemo<QuickTab[]>(() => {
    const petTabs = audienceOptions
      .filter(option => option.key !== 'allPets')
      .map(option => {
        const audienceKey = option.key as Exclude<AudienceKey, 'allPets'>;
        return {
          key: audienceKey,
          label: option.label[lang],
          href: `/products?audience=${audienceKey}`,
          children: quickFilterTypes[audienceKey].map((typeKey: ProductTypeKey, index) => ({
            key: `${audienceKey}-${typeKey}`,
            label: productTypeOptions.find(type => type.key === typeKey)?.label[lang] ?? typeKey,
            href: `/products?audience=${audienceKey}&type=${typeKey}`,
            featured: index < 3
          }))
        };
      });

    return [
      {
        key: 'all-products',
        label: labels.all,
        href: '/products',
        children: [
          { key: 'all', label: labels.all, href: '/products', featured: true },
          { key: 'discount', label: labels.discounted, href: '/products?collection=discount', featured: true },
          { key: 'popular', label: labels.popular, href: '/products?collection=popular', featured: true },
          { key: 'new', label: labels.newProducts, href: '/products?collection=new', featured: true }
        ]
      },
      ...petTabs
    ];
  }, [lang, labels.all, labels.campaigns, labels.discounted, labels.newProducts, labels.popular]);

  return (
    <section className="home-filter-menu-section" aria-label={labels.quick}>
      <div className="container home-filter-menu">
        <div className="home-filter-scroll">
          {tabs.map(tab => (
            <div className={`home-filter-item ${tab.children.length ? 'has-dropdown' : ''}`} key={tab.key}>
              <Link className="home-filter-link" href={tab.href}>{tab.label}</Link>
              {tab.children.length ? (
                <div className="home-filter-dropdown">
                  <div className="home-filter-dropdown-head">
                    <Link className="home-filter-dropdown-title" href={tab.href}>{tab.label}</Link>
                    <Link className="home-filter-view-all" href={tab.href}>{dropdownLabels.viewAll}</Link>
                  </div>
                  <span className="home-filter-dropdown-kicker">{dropdownLabels.subcategories}</span>
                  <div className="home-filter-dropdown-grid">
                    {tab.children.map(child => (
                      <Link
                        className={`home-filter-sublink ${child.featured ? 'featured' : ''}`}
                        href={child.href}
                        key={child.key}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type HeroCopy = {
  store: {
    kicker: string;
    title: string;
    text: string;
    primary: string;
    secondary: string;
    badges: string[];
  };
  grooming: {
    kicker: string;
    title: string;
    text: string;
    primary: string;
    secondary: string;
    badges: string[];
  };
};

const heroCopyByLang: Record<Lang, HeroCopy> = {
  az: {
    store: {
      kicker: 'Zoo Kis-Kis mağazası',
      title: 'Sevimli dostunuz üçün ən yaxşı seçimlər.',
      text: 'Keyfiyyətli yemlər, oyuncaqlar, qulluq məhsulları və sərfəli kampaniyalar bir ünvanda.',
      primary: 'Məhsullara bax',
      secondary: 'Endirimləri gör',
      badges: ['Keyfiyyətli yemlər', 'Oyuncaqlar', 'Qulluq məhsulları', 'Uyğun qiymətlər']
    },
    grooming: {
      kicker: 'Professional grooming',
      title: 'Sağlam tük, təmiz görünüş və rahat qulluq.',
      text: 'Yuma, fen, daranma, tük kəsimi, qulaq-göz və pəncə baxımı üçün müraciətinizi göndərin.',
      primary: 'Ətraflı',
      secondary: 'Xidmətlərə bax',
      badges: ['Yuma', 'Fen', 'Daranma', 'Tük kəsimi', 'Gigiyenik qulluq']
    }
  },
  en: {
    store: {
      kicker: 'Zoo Kis-Kis store',
      title: 'The best choices for your lovely pet.',
      text: 'Quality food, toys, care products and special offers in one place.',
      primary: 'View products',
      secondary: 'See discounts',
      badges: ['Quality food', 'Toys', 'Care products', 'Good prices']
    },
    grooming: {
      kicker: 'Professional grooming',
      title: 'Healthy fur, clean look and gentle care.',
      text: 'Send a request for washing, drying, brushing, haircut, ear-eye and paw care.',
      primary: 'Details',
      secondary: 'View services',
      badges: ['Wash', 'Drying', 'Brushing', 'Haircut', 'Hygiene care']
    }
  },
  ru: {
    store: {
      kicker: 'Магазин Zoo Kis-Kis',
      title: 'Лучший выбор для вашего питомца.',
      text: 'Качественные корма, игрушки, товары для ухода и выгодные предложения — всё в одном месте.',
      primary: 'Смотреть товары',
      secondary: 'Смотреть акции',
      badges: ['Качественные корма', 'Игрушки', 'Товары по уходу', 'Доступные цены']
    },
    grooming: {
      kicker: 'Профессиональный груминг',
      title: 'Здоровая шерсть, аккуратный вид и бережный уход.',
      text: 'Оставьте заявку на мытьё, сушку, расчёсывание, стрижку, а также уход за ушами, глазами и лапами.',
      primary: 'Подробнее',
      secondary: 'Смотреть услуги',
      badges: ['Мытьё', 'Сушка', 'Расчёсывание', 'Стрижка', 'Гигиенический уход']
    }
  }
};

export function HomePageClient() {
  const { t, lang } = useLanguage();
  const services = groomingServices[lang];
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const copy = heroCopyByLang[lang];

  const slides = [
    {
      id: 'store',
      image: '/banners/zoo-kis-kis-store.webp',
      mobileImage: '/banners/zoo-kis-kis-store-mobile-generated.png',
      alt: 'Zoo Kis-Kis mağazası banneri',
      variant: 'store' as const,
      copy: copy.store
    },
    {
      id: 'grooming',
      image: '/banners/zoo-kis-kis-grooming.webp',
      mobileImage: '/banners/zoo-kis-kis-grooming-mobile-generated.png',
      alt: 'Zoo Kis-Kis grooming banneri',
      variant: 'grooming' as const,
      copy: copy.grooming
    }
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const previousSlide = () => setActiveSlide(current => (current - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveSlide(current => (current + 1) % slides.length);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.changedTouches[0]?.clientX ?? null;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const threshold = 45;

    if (deltaX > threshold) {
      nextSlide();
    } else if (deltaX < -threshold) {
      previousSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <main>
      <QuickFilterMenu />

      <section className="hero hero-image-slider-section">
        <div className="container">
          <div className="hero-image-slider" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="hero-image-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
              {slides.map((slide, index) => (
                <article className={`hero-image-slide hero-image-slide-${slide.variant}`} key={slide.id} aria-hidden={activeSlide !== index}>
                  {slide.variant === 'store' ? (
                    <div className="hero-image-desktop-view hero-store-desktop-split">
                      <div className="hero-store-desktop-media">
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 768px) 0vw, 560px"
                          className="hero-store-desktop-image"
                        />
                      </div>
                      <div className="hero-image-content hero-store-desktop-content">
                        <div className="hero-image-logo-row">
                          <Image src="/logo-transparent.png" alt="Zoo Kis-Kis" width={170} height={108} className="hero-image-logo" />
                          <span>{slide.copy.kicker}</span>
                        </div>
                        <h1>{slide.copy.title}</h1>
                        <p>{slide.copy.text}</p>
                        <div className="hero-image-badges">
                          {slide.copy.badges.map(badge => <span key={badge}>{badge}</span>)}
                        </div>
                        <div className="hero-image-actions">
                          <Link href="/products" className="btn btn-primary hero-image-main-btn">{slide.copy.primary}</Link>
                          <Link href="/products?collection=discount" className="btn btn-soft hero-image-second-btn">{slide.copy.secondary}</Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="hero-image-desktop-view">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 0vw, 1180px"
                        className="hero-image-background hero-image-background-desktop"
                      />
                      <div className="hero-image-overlay" />
                      <div className="hero-image-content">
                        <div className="hero-image-logo-row">
                          <Image src="/logo-transparent.png" alt="Zoo Kis-Kis" width={170} height={108} className="hero-image-logo" />
                          <span>{slide.copy.kicker}</span>
                        </div>
                        <h1>{slide.copy.title}</h1>
                        <p>{slide.copy.text}</p>
                        <div className="hero-image-badges">
                          {slide.copy.badges.map(badge => <span key={badge}>{badge}</span>)}
                        </div>
                        <div className="hero-image-actions">
                          <Link href="/grooming" className="btn btn-primary hero-image-main-btn">
                            {slide.copy.primary}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="hero-mobile-view">
                    <div className="hero-mobile-media">
                      <Image
                        src={slide.mobileImage}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 0vw"
                        className="hero-mobile-background"
                      />
                    </div>
                    <div className="hero-mobile-panel">
                      <div className="hero-mobile-kicker-row">
                        <Image src="/logo-transparent.png" alt="Zoo Kis-Kis" width={124} height={78} className="hero-mobile-logo" />
                        <span className="hero-mobile-kicker">{slide.copy.kicker}</span>
                      </div>
                      <h1>{slide.copy.title}</h1>
                      <p>{slide.copy.text}</p>
                      <div className="hero-mobile-badges">
                        {slide.copy.badges.map(badge => <span key={badge}>{badge}</span>)}
                      </div>
                      <div className="hero-mobile-actions">
                        {slide.variant === 'grooming' ? (
                          <Link href="/grooming" className="btn btn-primary hero-mobile-main-btn">
                            {slide.copy.primary}
                          </Link>
                        ) : (
                          <>
                            <Link href="/products" className="btn btn-primary hero-mobile-main-btn">{slide.copy.primary}</Link>
                            <Link href="/products?collection=discount" className="btn btn-soft hero-mobile-second-btn">{slide.copy.secondary}</Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hero-image-controls" aria-label="Banner idarəsi">
              <button type="button" className="hero-image-arrow" aria-label="Əvvəlki banner" onClick={previousSlide}>
                <ChevronLeft size={21} />
              </button>
              <div className="hero-image-dots">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`${index + 1}-ci banner`}
                    aria-pressed={activeSlide === index}
                    className={`hero-image-dot ${activeSlide === index ? 'active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
              <button type="button" className="hero-image-arrow" aria-label="Növbəti banner" onClick={nextSlide}>
                <ChevronRight size={21} />
              </button>
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
