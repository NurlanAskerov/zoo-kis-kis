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
    metadataBase: new URL('https://zookiskis.az'),
   title: {
    default: 'Zoo Kis-Kis | Zooshop, pet shop və grooming xidməti',
    template: '%s | Zoo Kis-Kis'
  },
  description:
    'Zoo Kis-Kis — it, pişik, quş, balıq və xomyaklar üçün yemlər, aksesuarlar, biotualetlər, oyuncaqlar, grooming və çatdırılma xidməti.',
  keywords: [
    'zooshop',
    'zoo shop',
    'pet shop',
    'zoo mağaza',
    'heyvan mağazası',
    'it yemi',
    'pişik yemi',
    'pişik qumu',
    'biotualet',
    'heyvan məhsulları',
    'grooming Bakı'
  ],
  verification: {
    google: 'HN_bRPLQZFgaSw5Pj_b0pBR2O8Zq-oaS6qon9L59SI0'
  },
   openGraph: {
    title: 'Zoo Kis-Kis | Zooshop & Grooming',
    description:
      'Sevimli dostlarınız üçün yemlər, aksesuarlar, oyuncaqlar, biotualetlər, grooming və çatdırılma xidməti.',
    url: 'https://zookiskis.az',
    siteName: 'Zoo Kis-Kis',
    locale: 'az_AZ',
    type: 'website'
  },
  alternates: {
    canonical: 'https://zookiskis.az'
  }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
