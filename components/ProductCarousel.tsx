'use client';

import { useEffect, useMemo, useRef } from 'react';
import { type Product } from '@/lib/data';
import { ProductCard } from './ProductCard';

export function ProductCarousel({ items }: { items: Product[] }) {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const source = items.length > 0 ? items : [];
  const loop = useMemo(() => [...source, ...source, ...source, ...source], [source]);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || source.length === 0) return;

    const media = window.matchMedia('(max-width: 768px)');
    let timer: number | null = null;

    const startMobileSlider = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }

      if (!media.matches) return;

      timer = window.setInterval(() => {
        const firstCard = marquee.querySelector<HTMLElement>('.marquee-card');
        const step = (firstCard?.offsetWidth ?? Math.round(window.innerWidth * 0.78)) + 14;
        const resetPoint = marquee.scrollWidth / 2;

        if (marquee.scrollLeft + marquee.clientWidth + step >= resetPoint) {
          marquee.scrollTo({ left: 0, behavior: 'auto' });
          return;
        }

        marquee.scrollBy({ left: step, behavior: 'smooth' });
      }, 5600);
    };

    startMobileSlider();
    media.addEventListener('change', startMobileSlider);

    return () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }

      media.removeEventListener('change', startMobileSlider);
    };
  }, [source.length]);

  return (
    <div className="marquee" aria-label="Product carousel" ref={marqueeRef}>
      <div className="marquee-track">
        {loop.map((product, index) => (
          <div className="marquee-card" key={`${product.slug}-${index}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}