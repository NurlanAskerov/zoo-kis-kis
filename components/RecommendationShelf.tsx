'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/data';

type RecommendationShelfProps = {
  title: string;
  subtitle?: string;
  items: Product[];
  limit?: number;
};

function shuffleProducts(items: Product[], seed: number) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const value = Math.sin(seed + index * 999) * 10000;
    const random = value - Math.floor(value);
    const swapIndex = Math.floor(random * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

export function uniqueProducts(items: Product[]) {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export function RecommendationShelf({ title, subtitle, items, limit = 4 }: RecommendationShelfProps) {
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    setSeed(Date.now());
  }, []);

  const shuffled = useMemo(() => shuffleProducts(uniqueProducts(items), seed).slice(0, limit), [items, limit, seed]);
  if (!shuffled.length) return null;

  return (
    <section className="recommendation-shelf">
      <div className="recommendation-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="product-grid recommendation-grid">
        {shuffled.map(product => <ProductCard key={product.slug} product={product} />)}
      </div>
    </section>
  );
}
