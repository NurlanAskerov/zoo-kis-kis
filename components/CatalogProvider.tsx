'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { type Product } from '@/lib/data';

type CatalogContextValue = {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  findProduct: (slug: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function visibleProducts(items: Product[]) {
  return items.filter(product => product.active !== false);
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshProducts() {
    setLoading(true);
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) {
        setProducts([]);
        return;
      }

      const data = await response.json() as { products?: Product[] };
      setProducts(Array.isArray(data.products) ? visibleProducts(data.products) : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshProducts();
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    refreshProducts,
    findProduct: (slug: string) => products.find(product => product.slug === slug)
  }), [products, loading]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
