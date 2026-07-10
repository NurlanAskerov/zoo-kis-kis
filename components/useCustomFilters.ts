'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/data';

export type ClientCustomFilterOption = {
  key: string;
  label: Record<Lang, string>;
};

export type ClientCustomSubcategoryOption = ClientCustomFilterOption & {
  departmentKey: string;
};

export type ClientCustomFilters = {
  departments: ClientCustomFilterOption[];
  subcategories: ClientCustomSubcategoryOption[];
};

const emptyCustomFilters: ClientCustomFilters = {
  departments: [],
  subcategories: []
};

function cleanFilters(input: unknown): ClientCustomFilters {
  const raw = input && typeof input === 'object' ? input as Partial<ClientCustomFilters> : {};

  const departments = Array.isArray(raw.departments)
    ? raw.departments
      .map(item => {
        const key = String(item?.key || '').trim();
        const label = item?.label;
        const fallback = String(label?.az || label?.en || label?.ru || '').trim();
        return key && fallback
          ? {
              key,
              label: {
                az: String(label?.az || fallback).trim() || fallback,
                en: String(label?.en || fallback).trim() || fallback,
                ru: String(label?.ru || fallback).trim() || fallback
              }
            }
          : null;
      })
      .filter((item): item is ClientCustomFilterOption => Boolean(item))
    : [];

  const subcategories = Array.isArray(raw.subcategories)
    ? raw.subcategories
      .map(item => {
        const key = String(item?.key || '').trim();
        const departmentKey = String(item?.departmentKey || '').trim();
        const label = item?.label;
        const fallback = String(label?.az || label?.en || label?.ru || '').trim();
        return key && departmentKey && fallback
          ? {
              key,
              departmentKey,
              label: {
                az: String(label?.az || fallback).trim() || fallback,
                en: String(label?.en || fallback).trim() || fallback,
                ru: String(label?.ru || fallback).trim() || fallback
              }
            }
          : null;
      })
      .filter((item): item is ClientCustomSubcategoryOption => Boolean(item))
    : [];

  return { departments, subcategories };
}

async function fetchCustomFilters() {
  const response = await fetch(`/api/custom-filters?ts=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) return emptyCustomFilters;

  const data = await response.json().catch(() => ({})) as { filters?: ClientCustomFilters };
  return cleanFilters(data.filters);
}

export function useCustomFilters() {
  const [filters, setFilters] = useState<ClientCustomFilters>(emptyCustomFilters);

  useEffect(() => {
    let mounted = true;

    fetchCustomFilters()
      .then(result => {
        if (mounted) setFilters(result);
      })
      .catch(() => {
        if (mounted) setFilters(emptyCustomFilters);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return filters;
}

export function getCustomDepartmentLabel(filters: ClientCustomFilters, key: string, lang: Lang) {
  const label = filters.departments.find(department => department.key === key)?.label;
  return label?.[lang] || label?.az || '';
}

export function getCustomSubcategoryLabel(filters: ClientCustomFilters, key: string, lang: Lang) {
  const label = filters.subcategories.find(subcategory => subcategory.key === key)?.label;
  return label?.[lang] || label?.az || '';
}
