import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/cart-context';
import { LanguageProvider } from '@/components/LanguageProvider';
import { FloatingContact } from '@/components/FloatingContact';
import { CatalogProvider } from '@/components/CatalogProvider';
import { CustomerProfileProvider } from '@/components/customer-profile';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>
        <LanguageProvider>
          <CatalogProvider>
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
