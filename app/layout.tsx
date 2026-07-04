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
  metadataBase: new URL('https://www.zookiskis.az'),
  title: {
    default: 'Zoo Kis-Kis | Zooshop, Grooming və Wolt çatdırılma',
    template: '%s | Zoo Kis-Kis'
  },
  description: 'Zoo Kis-Kis — Bakı üçün pet shop və grooming xidməti. Pişik, it, quş, balıq və gəmiricilər üçün yemlər, oyuncaqlar, baxım məhsulları və Wolt ilə çatdırılma.',
  applicationName: 'Zoo Kis-Kis',
  keywords: [
    'Zoo Kis-Kis',
    'zookiskis',
    'zookiskis.az',
    'zoo kis kis',
    'pet shop Bakı',
    'zooshop Bakı',
    'heyvan mağazası',
    'pişik yemi',
    'it yemi',
    'grooming Bakı',
    'heyvan məhsulları',
    'Wolt çatdırılma'
  ],
  authors: [{ name: 'Zoo Kis-Kis' }],
  creator: 'Zoo Kis-Kis',
  publisher: 'Zoo Kis-Kis',
  category: 'pet supplies',
  alternates: {
    canonical: '/',
    languages: {
      az: '/',
      en: '/?lang=en',
      ru: '/?lang=ru'
    }
  },
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    url: '/',
    siteName: 'Zoo Kis-Kis',
    title: 'Zoo Kis-Kis | Zooshop & Grooming',
    description: 'Pişik, it, quş, balıq və gəmiricilər üçün yemlər, oyuncaqlar, baxım məhsulları, grooming və Wolt ilə çatdırılma.',
    images: [
      {
        url: '/banners/zoo-kis-kis-store.webp',
        width: 1200,
        height: 630,
        alt: 'Zoo Kis-Kis zooshop və pet məhsulları'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zoo Kis-Kis | Zooshop & Grooming',
    description: 'Pet shop, grooming və Wolt çatdırılma.',
    images: ['/banners/zoo-kis-kis-store.webp']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' }
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  manifest: '/site.webmanifest'
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PetStore',
  name: 'Zoo Kis-Kis',
  url: 'https://www.zookiskis.az',
  logo: 'https://www.zookiskis.az/favicon.png',
  image: 'https://www.zookiskis.az/banners/zoo-kis-kis-store.webp',
  telephone: '+994555047010',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sulh kucesi 14c, Imeni Razina',
    addressLocality: 'Bakı',
    addressCountry: 'AZ'
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '22:00'
    }
  ],
  sameAs: [
    'https://www.instagram.com/zookiskis.az/',
    'https://www.tiktok.com/@zookiskis'
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
