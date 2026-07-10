'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  audienceOptions,
  collectionOptions,
  getCatalogDepartmentForProductType,
  getCatalogDepartmentLabel,
  getCatalogDepartmentOptions,
  getCatalogProductTypeLabel,
  getCatalogSubcategoryOptionsForDepartment,
  getProductDepartmentKey,
  type AudienceKey,
  type ProductCollectionKey,
  type Lang
} from '@/lib/data';
import { useCatalog } from './CatalogProvider';
import { ProductCard } from './ProductCard';
import { useLanguage } from './LanguageProvider';

type FilterValue<T extends string> = 'all' | T;

type ProductFiltersProps = {
  initialAudience?: string;
  initialType?: string;
  initialCategory?: string;
  initialDepartment?: string;
  initialCollection?: string;
};

const validAudience = (value?: string): FilterValue<AudienceKey> => audienceOptions.some(item => item.key === value) ? value as AudienceKey : 'all';
const validCollection = (value?: string): FilterValue<ProductCollectionKey> => collectionOptions.some(item => item.key === value) ? value as ProductCollectionKey : 'all';
const requestedFilter = (value?: string): FilterValue<string> => value?.trim() && value !== 'all' ? value.trim() : 'all';

const normalizeSearchText = (value: string) => value
  .toLocaleLowerCase('az-AZ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[əә]/g, 'e')
  .replace(/[ıİ]/g, 'i')
  .replace(/[ö]/g, 'o')
  .replace(/[ü]/g, 'u')
  .replace(/[ğ]/g, 'g')
  .replace(/[ç]/g, 'c')
  .replace(/[ş]/g, 's')
  .replace(/[^a-z0-9а-яё\s-]/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

type SearchableProductName = {
  name?: Partial<Record<Lang, string>>;
};

const productNameVariants = (product: SearchableProductName, lang: Lang) => {
  const values = [product.name?.[lang], product.name?.az]
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(values.map(normalizeSearchText).filter(Boolean)));
};

const searchTokenMatchesName = (name: string, token: string) => {
  if (!token) return true;

  const words = name.split(' ').filter(Boolean);

  return words.some(word => word === token || word.startsWith(token) || word.includes(token));
};

const productSearchScore = (product: SearchableProductName, query: string, lang: Lang) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return 0;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const names = productNameVariants(product, lang);

  if (!tokens.length || !names.length) return -1;

  const matchedName = names.find(name => tokens.every(token => searchTokenMatchesName(name, token)));
  if (!matchedName) return -1;

  if (matchedName === normalizedQuery) return 1000;
  if (matchedName.startsWith(normalizedQuery)) return 900;

  const words = matchedName.split(' ').filter(Boolean);
  if (tokens.every(token => words.some(word => word.startsWith(token)))) return 800;

  return 500;
};


export function ProductFilters({ initialAudience, initialType, initialDepartment, initialCollection }: ProductFiltersProps) {
  const { t, lang } = useLanguage();
  const { products, loading, catalogFilters, catalogFiltersLoading } = useCatalog();

  const [audience, setAudience] = useState<FilterValue<AudienceKey>>(validAudience(initialAudience));
  const [department, setDepartment] = useState<FilterValue<string>>(requestedFilter(initialDepartment));
  const [subcategory, setSubcategory] = useState<FilterValue<string>>(requestedFilter(initialType));
  const [collection, setCollection] = useState<FilterValue<ProductCollectionKey>>(validCollection(initialCollection));
  const [search, setSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const departmentOptions = useMemo(() => getCatalogDepartmentOptions(catalogFilters), [catalogFilters]);
  const allSubcategoryOptions = useMemo(
    () => getCatalogSubcategoryOptionsForDepartment('all', catalogFilters),
    [catalogFilters]
  );
  const subcategoryOptions = useMemo(
    () => getCatalogSubcategoryOptionsForDepartment(department, catalogFilters),
    [department, catalogFilters]
  );

  useEffect(() => {
    if (catalogFiltersLoading) return;

    if (department !== 'all' && !departmentOptions.some(item => item.key === department)) {
      setDepartment('all');
      return;
    }

    if (subcategory === 'all') return;

    const selectedOption = allSubcategoryOptions.find(item => item.key === subcategory);
    if (!selectedOption) {
      setSubcategory('all');
      return;
    }

    const expectedDepartment = getCatalogDepartmentForProductType(subcategory, catalogFilters);
    if (department === 'all') {
      setDepartment(expectedDepartment);
    } else if (department !== expectedDepartment) {
      setSubcategory('all');
    }
  }, [
    allSubcategoryOptions,
    catalogFilters,
    catalogFiltersLoading,
    department,
    departmentOptions,
    subcategory
  ]);

  const filtered = useMemo(() => {
    const query = search.trim();
    // Search is name-only: description, category, tags and product type are ignored for search matching.

    return products
      .map(product => ({ product, searchScore: productSearchScore(product, query, lang) }))
      .filter(({ product, searchScore }) => {
        const audiences = product.audiences?.length ? product.audiences : ['allPets'];
        const collections = product.collections ?? [];

        const bySearch = !query || searchScore >= 0;
        const byAudience = audience === 'all' || audience === 'allPets' || audiences.includes(audience) || audiences.includes('allPets');
        const byDepartment = department === 'all' || getProductDepartmentKey(product, catalogFilters) === department;
        const bySubcategory = subcategory === 'all' || product.typeKey === subcategory;
        const byCollection = collection === 'all' || collections.includes(collection);

        return bySearch && byAudience && byDepartment && bySubcategory && byCollection;
      })
      .sort((a, b) => b.searchScore - a.searchScore)
      .map(({ product }) => product);
  }, [products, audience, department, subcategory, collection, search, lang, catalogFilters]);

  const clear = () => {
    setAudience('all');
    setDepartment('all');
    setSubcategory('all');
    setCollection('all');
    setSearch('');
  };

  const audienceLabel = audience === 'all' ? '' : audienceOptions.find(item => item.key === audience)?.label[lang] ?? '';
  const departmentLabel = department === 'all' ? '' : getCatalogDepartmentLabel(department, lang, catalogFilters);
  const subcategoryLabel = subcategory === 'all' ? '' : getCatalogProductTypeLabel(subcategory, lang, catalogFilters);
  const collectionLabel = collection === 'all' ? '' : collectionOptions.find(item => item.key === collection)?.label[lang] ?? '';
  const queryLabel = search.trim();
  const activeLabels = [audienceLabel, subcategoryLabel || departmentLabel, collectionLabel, queryLabel ? `“${queryLabel}”` : ''].filter(Boolean);
  const summaryText = activeLabels.length > 0 ? `${activeLabels.join(' · ')} ${t('filterResultsSuffix')}` : t('allProducts');

  function handleDepartmentChange(value: FilterValue<string>) {
    setDepartment(value);
    setSubcategory('all');
  }

  const renderFilterControls = () => (
    <div className="filter-panel compact-filter-panel">
      <div className="filter-group">
        <label>{t('petType')}</label>
        <select className="input" value={audience} onChange={event => setAudience(event.target.value as FilterValue<AudienceKey>)}>
          <option value="all">{t('all')}</option>
          {audienceOptions.map(item => <option value={item.key} key={item.key}>{item.label[lang]}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>{t('department')}</label>
        <select className="input" value={department} onChange={event => handleDepartmentChange(event.target.value as FilterValue<string>)}>
          <option value="all">{t('all')}</option>
          {departmentOptions.map(item => <option value={item.key} key={item.key}>{item.label[lang]}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>{t('subcategory')}</label>
        <select className="input" value={subcategory} onChange={event => setSubcategory(event.target.value as FilterValue<string>)}>
          <option value="all">{department === 'all' ? t('all') : t('allInDepartment')}</option>
          {subcategoryOptions.map(item => <option value={item.key} key={item.key}>{item.label[lang]}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>{t('collection')}</label>
        <select className="input" value={collection} onChange={event => setCollection(event.target.value as FilterValue<ProductCollectionKey>)}>
          <option value="all">{t('all')}</option>
          {collectionOptions.map(item => <option value={item.key} key={item.key}>{item.label[lang]}</option>)}
        </select>
      </div>
      <button type="button" className="btn btn-soft filter-reset" onClick={clear}>{t('clearFilters')}</button>
    </div>
  );

  return (
    <>
      <div className="catalog-toolbar">
        <label className="catalog-search" aria-label={t('searchProducts')}>
          <Search size={18} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('searchProducts')} />
        </label>
        <button type="button" className="btn btn-soft mobile-filter-button" onClick={() => setMobileFiltersOpen(true)}>
          <SlidersHorizontal size={18} /> <span className="filter-button-text">{t('filters')}</span>
        </button>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label={t('filters')}>
          <div className="catalog-sidebar-head">
            <strong>{t('filters')}</strong>
            <span>{t('filterHint')}</span>
          </div>
          {renderFilterControls()}
        </aside>

        <section className="catalog-main">
          <div className="filter-summary rich-filter-summary">
            <span>{summaryText}</span>
            <strong>{loading ? 'Yüklənir...' : `${filtered.length} ${t('results')}`}</strong>
          </div>

          {loading ? (
            <div className="product-grid catalog-product-grid product-skeleton-grid" aria-label="Məhsullar yüklənir">
              {Array.from({ length: 6 }).map((_, index) => <div className="product-skeleton-card" key={index} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty small-empty">
              <h2>{t('noProducts')}</h2>
              <button type="button" className="btn btn-primary" onClick={clear}>{t('clearFilters')}</button>
            </div>
          ) : (
            <div className="product-grid catalog-product-grid">
              {filtered.map(product => <ProductCard key={product.slug} product={product} />)}
            </div>
          )}
        </section>
      </div>

      {mounted && mobileFiltersOpen ? createPortal(
        <div className="modal-backdrop filter-modal-backdrop" role="presentation" onClick={() => setMobileFiltersOpen(false)}>
          <div className="whatsapp-modal filter-mobile-modal" role="dialog" aria-modal="true" aria-label={t('filters')} onClick={event => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setMobileFiltersOpen(false)} aria-label={t('close')}>
              <X size={19} />
            </button>
            <p className="eyebrow">{t('products')}</p>
            <h2>{t('filters')}</h2>
            <p>{t('filterHint')}</p>
            {renderFilterControls()}
            <div className="form-actions-row form-actions-right">
              <button type="button" className="btn btn-primary" onClick={() => setMobileFiltersOpen(false)}>{t('showResults')}</button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
