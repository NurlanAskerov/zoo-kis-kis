'use client';

import { useEffect, useState } from 'react';
import { emptyCatalogFilters, type CatalogFilters, type Lang } from '@/lib/data';
import { normalizeCatalogFilters } from '@/lib/catalog-filters';

export type ClientCustomFilterOption = CatalogFilters['departments'][number];
export type ClientCustomSubcategoryOption = CatalogFilters['subcategories'][number];
export type ClientCustomFilters = CatalogFilters;

async function fetchCustomFilters() {
  const endpoints = ['/api/catalog-filters', '/api/custom-filters'];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) continue;

      const data = await response.json().catch(() => ({})) as { filters?: ClientCustomFilters };
      return normalizeCatalogFilters(data.filters);
    } catch {
      // Try the legacy endpoint before returning an empty result.
    }
  }

  return emptyCatalogFilters;
}

export function useCustomFilters() {
  const [filters, setFilters] = useState<ClientCustomFilters>(emptyCatalogFilters);

  useEffect(() => {
    let mounted = true;

    void fetchCustomFilters().then(result => {
      if (mounted) setFilters(result);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return filters;
}

export function getCustomDepartmentLabel(filters: ClientCustomFilters, key: string, lang: Lang) {
  const label = filters.departments.find(department => department.key === key)?.label;
  return label?.[lang] || label?.az || label?.en || label?.ru || '';
}

export function getCustomSubcategoryLabel(filters: ClientCustomFilters, key: string, lang: Lang) {
  const label = filters.subcategories.find(subcategory => subcategory.key === key)?.label;
  return label?.[lang] || label?.az || label?.en || label?.ru || '';
}
