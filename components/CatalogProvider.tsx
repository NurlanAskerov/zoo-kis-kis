'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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

export function CatalogProvider({
  children,
  initialProducts = []
}: {
  children: ReactNode;
  initialProducts?: Product[];
}) {
  const initialVisible = useMemo(() => visibleProducts(initialProducts), [initialProducts]);
  const [products, setProducts] = useState<Product[]>(initialVisible);
  const [loading, setLoading] = useState(initialVisible.length === 0);
  const productsRef = useRef<Product[]>(initialVisible);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const refreshProducts = useCallback(async () => {
    if (!productsRef.current.length) setLoading(true);

    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) {
        setProducts(current => current);
        return;
      }

      const data = await response.json() as { products?: Product[] };
      if (Array.isArray(data.products)) {
        const nextProducts = visibleProducts(data.products);
        productsRef.current = nextProducts;
        setProducts(nextProducts);
      }
    } catch {
      setProducts(current => current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialVisible.length) {
      void refreshProducts();
    }
  }, [initialVisible.length, refreshProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    refreshProducts,
    findProduct: (slug: string) => products.find(product => product.slug === slug)
  }), [products, loading, refreshProducts]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
