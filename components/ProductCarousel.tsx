'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { type Product } from '@/lib/data';
import { ProductCard } from './ProductCard';

const AUTO_SCROLL_MS = 5600;
const RESUME_AFTER_INTERACTION_MS = 3200;

export type ProductCarouselHandle = {
  scrollPrevious: () => void;
  scrollNext: () => void;
};

export const ProductCarousel = forwardRef<ProductCarouselHandle, { items: Product[] }>(function ProductCarousel({ items }, ref) {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const pointerDownRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartScrollLeftRef = useRef(0);
  const source = items.length > 0 ? items : [];
  const loop = useMemo(() => source, [source]);

  function clearResumeTimer() {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function pauseAutoScroll() {
    pausedRef.current = true;
    clearResumeTimer();
  }

  function resumeAutoScroll(delay = RESUME_AFTER_INTERACTION_MS) {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, delay);
  }


  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement && Boolean(target.closest('a, button, input, textarea, select, label, [role="button"]'));
  }

  function getStep() {
    const marquee = marqueeRef.current;
    if (!marquee) return typeof window === 'undefined' ? 260 : Math.round(window.innerWidth * 0.82);

    const firstCard = marquee.querySelector<HTMLElement>('.marquee-card');
    const track = marquee.querySelector<HTMLElement>('.marquee-track');
    const computedGap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0') : 0;
    const fallbackGap = window.matchMedia('(max-width: 768px)').matches ? 14 : 20;
    return (firstCard?.offsetWidth ?? Math.round(window.innerWidth * 0.78)) + (Number.isFinite(computedGap) && computedGap > 0 ? computedGap : fallbackGap);
  }

  function scrollToPosition(left: number, behavior: ScrollBehavior = 'smooth') {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const maxLeft = Math.max(0, marquee.scrollWidth - marquee.clientWidth);
    marquee.scrollTo({ left: Math.min(Math.max(0, left), maxLeft), behavior });
  }

  function scrollOne(direction: 'left' | 'right', fromUser = true) {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    if (fromUser) {
      pauseAutoScroll();
      resumeAutoScroll();
    }

    const step = getStep();
    const maxLeft = Math.max(0, marquee.scrollWidth - marquee.clientWidth);
    if (maxLeft <= 0) return;

    if (direction === 'right') {
      const nearEnd = marquee.scrollLeft + step >= maxLeft - 6;
      scrollToPosition(nearEnd ? 0 : marquee.scrollLeft + step);
      return;
    }

    const nearStart = marquee.scrollLeft - step <= 6;
    scrollToPosition(nearStart ? maxLeft : marquee.scrollLeft - step);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pauseAutoScroll();

    if (event.pointerType !== 'touch' && isInteractiveTarget(event.target)) {
      pointerDownRef.current = false;
      dragStartXRef.current = null;
      resumeAutoScroll(1200);
      return;
    }

    pointerDownRef.current = true;

    if (event.pointerType !== 'touch') {
      dragStartXRef.current = event.clientX;
      dragStartScrollLeftRef.current = marqueeRef.current?.scrollLeft ?? 0;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const marquee = marqueeRef.current;
    const dragStartX = dragStartXRef.current;
    if (!marquee || dragStartX === null || event.pointerType === 'touch') return;

    const deltaX = event.clientX - dragStartX;
    if (Math.abs(deltaX) < 8) return;

    event.preventDefault();
    marquee.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  }

  function handlePointerEnd(event?: React.PointerEvent<HTMLDivElement>) {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;
    dragStartXRef.current = null;
    if (event?.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resumeAutoScroll();
  }

  useImperativeHandle(ref, () => ({
    scrollPrevious: () => scrollOne('left'),
    scrollNext: () => scrollOne('right')
  }));

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || source.length < 2) return;

    pausedRef.current = false;

    intervalRef.current = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      scrollOne('right', false);
    }, AUTO_SCROLL_MS);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearResumeTimer();
    };
  }, [source.length]);

  if (!source.length) return null;

  return (
    <div
      className="carousel-shell"
      onMouseEnter={pauseAutoScroll}
      onMouseLeave={() => resumeAutoScroll(1200)}
      onFocus={pauseAutoScroll}
      onBlur={() => resumeAutoScroll(1200)}
    >
      <div
        className="marquee"
        aria-label="Product carousel"
        ref={marqueeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        <div className="marquee-track">
          {loop.map((product, index) => (
            <div className="marquee-card" key={`${product.slug}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
