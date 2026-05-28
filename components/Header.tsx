'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

const links = [
  ['home', '/'],
  ['products', '/products'],
  ['grooming', '/grooming'],
  ['delivery', '/delivery'],
  ['about', '/about'],
  ['contact', '/contact']
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { count, favoriteCount } = useCart();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container nav">
        <Link className="logo-wrap" href="/" onClick={() => setMenuOpen(false)}>
          <Image className="logo-mark" src="/logo-transparent.png" alt="Zoo Kis-Kis logo" width={104} height={66} priority />
          <span className="logo-text">
            <strong>Zoo Kis-Kis</strong>
            <span>Zooshop & Grooming</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Əsas menyu">
          {links.map(([label, href]) => (
            <Link className={isActivePath(pathname, href) ? 'active' : ''} key={href} href={href}>{t(label)}</Link>
          ))}
        </nav>

        <div className="nav-actions">
          <LanguageSwitcher />
          <Link className={`icon-btn ${isActivePath(pathname, '/profile') ? 'active' : ''}`} href="/profile" aria-label={t('profile') || 'Profil'}>
            <UserRound size={19} />
          </Link>
          <Link className={`icon-btn ${isActivePath(pathname, '/favorites') ? 'active' : ''}`} href="/favorites" aria-label={t('favorites')}>
            <Heart size={19} />
            {favoriteCount > 0 && <span className="cart-count favorite-count">{favoriteCount}</span>}
          </Link>
          <Link className={`icon-btn ${isActivePath(pathname, '/cart') ? 'active' : ''}`} href="/cart" aria-label={t('cart')}>
            <ShoppingBag size={19} />
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button
            className={`icon-btn mobile-menu ${menuOpen ? 'active' : ''}`}
            type="button"
            aria-label={t('menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(current => !current)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className={`mobile-nav-panel ${menuOpen ? 'open' : ''}`} aria-label="Mobil menyu">
          <div className="mobile-nav-language">
            <LanguageSwitcher />
          </div>
          {links.map(([label, href]) => (
            <Link
              className={isActivePath(pathname, href) ? 'active' : ''}
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
            >
              {t(label)}
            </Link>
          ))}
          <div className="mobile-nav-shortcuts">
            <Link
              className={isActivePath(pathname, '/profile') ? 'active' : ''}
              href="/profile"
              onClick={() => setMenuOpen(false)}
            >
              {t('profile') || 'Profil'}
            </Link>
            <Link
              className={isActivePath(pathname, '/favorites') ? 'active' : ''}
              href="/favorites"
              onClick={() => setMenuOpen(false)}
            >
              {t('favorites')}
            </Link>
            <Link
              className={isActivePath(pathname, '/cart') ? 'active' : ''}
              href="/cart"
              onClick={() => setMenuOpen(false)}
            >
              {t('cart')}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
