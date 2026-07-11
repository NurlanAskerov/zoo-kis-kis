'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { emptyCatalogFilters, type CatalogFilters, type Product } from '@/lib/data';
import { normalizeCatalogFilters } from '@/lib/catalog-filters';

type CatalogContextValue = {
  products: Product[];
  loading: boolean;
  catalogFilters: CatalogFilters;
  catalogFiltersLoading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCatalogFilters: () => Promise<void>;
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
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(emptyCatalogFilters);
  const [catalogFiltersLoading, setCatalogFiltersLoading] = useState(true);
  const productsRef = useRef<Product[]>(initialVisible);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const refreshProducts = useCallback(async () => {
    if (!productsRef.current.length) setLoading(true);

    try {
      const response = await fetch(`/api/products?ts=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
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

  const refreshCatalogFilters = useCallback(async () => {
    setCatalogFiltersLoading(true);

    try {
      const endpoints = ['/api/catalog-filters', '/api/custom-filters'];

      for (const endpoint of endpoints) {
        const response = await fetch(`${endpoint}?ts=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) continue;

        const data = await response.json().catch(() => ({})) as { filters?: CatalogFilters };
        setCatalogFilters(normalizeCatalogFilters(data.filters));
        return;
      }
    } catch {
      setCatalogFilters(current => current);
    } finally {
      setCatalogFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hər yeni brauzer sessiyasında DB-dən təzə məhsul siyahısı alınır.
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const refreshOnFocus = () => {
      void refreshProducts();
    };

    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnFocus();
    };

    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('pageshow', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('pageshow', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, [refreshProducts]);

  useEffect(() => {
    void refreshCatalogFilters();
  }, [refreshCatalogFilters]);

  const value = useMemo(() => ({
    products,
    loading,
    catalogFilters,
    catalogFiltersLoading,
    refreshProducts,
    refreshCatalogFilters,
    findProduct: (slug: string) => products.find(product => product.slug === slug)
  }), [products, loading, catalogFilters, catalogFiltersLoading, refreshProducts, refreshCatalogFilters]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
