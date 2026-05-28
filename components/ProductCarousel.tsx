'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Product } from '@/lib/data';
import { ProductCard } from './ProductCard';

export function ProductCarousel({ items }: { items: Product[] }) {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const source = items.length > 0 ? items : [];
  const loop = useMemo(() => source, [source]);

  function getStep() {
    const marquee = marqueeRef.current;
    if (!marquee) return Math.round(window.innerWidth * 0.82);

    const firstCard = marquee.querySelector<HTMLElement>('.marquee-card');
    const gap = window.matchMedia('(max-width: 768px)').matches ? 14 : 20;
    return (firstCard?.offsetWidth ?? Math.round(window.innerWidth * 0.78)) + gap;
  }

  function scrollOne(direction: 'left' | 'right') {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const step = getStep();
    const nextLeft = direction === 'right' ? marquee.scrollLeft + step : marquee.scrollLeft - step;

    marquee.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: 'smooth'
    });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) return;

    const delta = startX - endX;
    if (Math.abs(delta) < 36) return;

    scrollOne(delta > 0 ? 'right' : 'left');
  }

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || source.length < 2) return;

    let timer: number | null = null;

    const startSlider = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }

      timer = window.setInterval(() => {
        const step = getStep();
        const nearEnd = marquee.scrollLeft + marquee.clientWidth + step >= marquee.scrollWidth - 8;

        if (nearEnd) {
          marquee.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }

        marquee.scrollBy({ left: step, behavior: 'smooth' });
      }, 5600);
    };

    startSlider();

    return () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };
  }, [source.length]);

  if (!source.length) return null;

  return (
    <div className="carousel-shell">
      {source.length > 1 ? (
        <button className="carousel-arrow carousel-arrow-left" type="button" aria-label="Əvvəlki məhsullar" onClick={() => scrollOne('left')}>
          <ChevronLeft size={20} />
        </button>
      ) : null}

      <div
        className="marquee"
        aria-label="Product carousel"
        ref={marqueeRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="marquee-track">
          {loop.map((product, index) => (
            <div className="marquee-card" key={`${product.slug}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {source.length > 1 ? (
        <button className="carousel-arrow carousel-arrow-right" type="button" aria-label="Növbəti məhsullar" onClick={() => scrollOne('right')}>
          <ChevronRight size={20} />
        </button>
      ) : null}
    </div>
  );
}
