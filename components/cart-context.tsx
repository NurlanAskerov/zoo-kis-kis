'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type Product } from '@/lib/data';
import { useCatalog } from './CatalogProvider';
import { useLanguage } from './LanguageProvider';

type CartLine = { slug: string; quantity: number };
type CartItem = CartLine & { product: Product };
type ToastState = { id: number; message: string; type: 'success' | 'info' };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  favorites: Product[];
  favoriteCount: number;
  favoriteSlugs: string[];
  addToCart: (slug: string, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  removeFavorite: (slug: string) => void;
  clearFavorites: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { t, lang } = useLanguage();
  const { products } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);


  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const items = useMemo(() => lines
    .map(line => ({ ...line, product: products.find(product => product.slug === line.slug)! }))
    .filter(item => item.product), [lines, products]);

  const favorites = useMemo(() => favoriteSlugs
    .map(slug => products.find(product => product.slug === slug))
    .filter((product): product is Product => Boolean(product)), [favoriteSlugs, products]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  function showToast(message: string, type: ToastState['type'] = 'success') {
    setToast({ id: Date.now(), message, type });
  }

  function getProductName(slug: string) {
    return products.find(product => product.slug === slug)?.name[lang] ?? slug;
  }

  function addToCart(slug: string, quantity = 1) {
    setLines(current => {
      const exists = current.find(item => item.slug === slug);
      if (exists) return current.map(item => item.slug === slug ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { slug, quantity }];
    });
    showToast(`${getProductName(slug)} ${t('toastAdded')}`);
  }

  function removeFromCart(slug: string) {
    setLines(current => current.filter(item => item.slug !== slug));
    showToast(`${getProductName(slug)} ${t('toastRemoved')}`, 'info');
  }

  function updateQuantity(slug: string, quantity: number) {
    if (quantity <= 0) return removeFromCart(slug);
    setLines(current => current.map(item => item.slug === slug ? { ...item, quantity } : item));
  }

  function clearCart() {
    setLines([]);
    showToast(t('toastCleared'), 'info');
  }

  function toggleFavorite(slug: string) {
    setFavoriteSlugs(current => current.includes(slug) ? current.filter(item => item !== slug) : [slug, ...current]);
  }

  function isFavorite(slug: string) {
    return favoriteSlugs.includes(slug);
  }

  function removeFavorite(slug: string) {
    setFavoriteSlugs(current => current.filter(item => item !== slug));
  }

  function clearFavorites() {
    setFavoriteSlugs([]);
  }

  return (
    <CartContext.Provider value={{
      items,
      count,
      subtotal,
      favorites,
      favoriteCount: favorites.length,
      favoriteSlugs,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      removeFavorite,
      clearFavorites
    }}>
      {children}
      {toast ? (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          <span className="toast-dot" />
          <span>{toast.message}</span>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
