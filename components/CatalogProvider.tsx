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

  const refreshCatalogFilters = useCallback(async () => {
    setCatalogFiltersLoading(true);

    try {
      const response = await fetch('/api/catalog-filters', { cache: 'no-store' });
      if (!response.ok) return;

      const data = await response.json() as { filters?: CatalogFilters };
      setCatalogFilters(normalizeCatalogFilters(data.filters));
    } catch {
      setCatalogFilters(current => current);
    } finally {
      setCatalogFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialVisible.length) {
      void refreshProducts();
    }
  }, [initialVisible.length, refreshProducts]);

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
