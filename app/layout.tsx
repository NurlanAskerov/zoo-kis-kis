import type { Metadata, Viewport } from 'next';
import { unstable_cache } from 'next/cache';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/cart-context';
import { LanguageProvider } from '@/components/LanguageProvider';
import { FloatingContact } from '@/components/FloatingContact';
import { CatalogProvider } from '@/components/CatalogProvider';
import { CustomerProfileProvider } from '@/components/customer-profile';
import { getProductsFromDb } from '@/lib/db';
import { type Product } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Zoo Kis-Kis | Zooshop & Grooming',
  description: 'Zoo Kis-Kis - sevimli dostlarınız üçün məhsullar, grooming və çatdırılma xidməti.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

const getCachedInitialProducts = unstable_cache(
  async () => getProductsFromDb(false),
  ['zoo-kis-kis-initial-products'],
  { revalidate: 60 }
);

async function loadInitialProducts(): Promise<Product[]> {
  try {
    return await getCachedInitialProducts();
  } catch (error) {
    console.error('RootLayout initial products error', error);
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialProducts = await loadInitialProducts();

  return (
    <html lang="az">
      <body>
        <LanguageProvider>
          <CatalogProvider initialProducts={initialProducts}>
            <CustomerProfileProvider>
              <CartProvider>
                <Header />
                {children}
                <Footer />
                <FloatingContact />
              </CartProvider>
            </CustomerProfileProvider>
          </CatalogProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
