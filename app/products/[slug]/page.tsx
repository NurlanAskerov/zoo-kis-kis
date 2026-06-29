import type { Metadata } from 'next';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { getProductsFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const siteUrl = 'https://zookiskis.az';

type ProductDetailParams = {
  params: Promise<{ slug: string }>;
};

function getText(value: unknown, fallback = ''): string {
  if (!value) return fallback;

  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const az = record.az;
    const en = record.en;
    const ru = record.ru;

    if (typeof az === 'string' && az.trim()) return az;
    if (typeof en === 'string' && en.trim()) return en;
    if (typeof ru === 'string' && ru.trim()) return ru;
  }

  return fallback;
}

function getImages(product: any): string[] {
  const images: string[] = [];

  if (typeof product?.image === 'string' && product.image.trim()) {
    images.push(product.image);
  }

  if (Array.isArray(product?.images)) {
    for (const image of product.images) {
      if (typeof image === 'string' && image.trim()) {
        images.push(image);
      }

      if (image && typeof image === 'object' && typeof image.url === 'string' && image.url.trim()) {
        images.push(image.url);
      }
    }
  }

  return Array.from(new Set(images));
}

async function getProductBySlug(slug: string): Promise<any | null> {
  try {
    const products = await getProductsFromDb(false);
    return products.find((product: any) => product.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductDetailParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Məhsul tapılmadı | Zoo Kis-Kis',
      description: 'Axtardığınız məhsul tapılmadı.',
      alternates: {
        canonical: `${siteUrl}/products/${slug}`
      }
    };
  }

  const name = getText(product.name, 'Zoo Kis-Kis məhsulu');
  const description = getText(
    product.description,
    `${name} Zoo Kis-Kis-də. Bakı üzrə zooshop məhsulları, grooming və çatdırılma xidməti.`
  );
  const images = getImages(product);

  return {
    title: `${name} | Zoo Kis-Kis`,
    description,
    keywords: [
      name,
      'zooshop',
      'zoo mağaza',
      'pet shop',
      'heyvan məhsulları',
      'it yemi',
      'pişik yemi',
      'pişik qumu',
      'Bakı'
    ],
    alternates: {
      canonical: `${siteUrl}/products/${slug}`
    },
    openGraph: {
      title: `${name} | Zoo Kis-Kis`,
      description,
      url: `${siteUrl}/products/${slug}`,
      siteName: 'Zoo Kis-Kis',
      locale: 'az_AZ',
      type: 'website',
      images
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Zoo Kis-Kis`,
      description,
      images
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailParams) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const name = getText(product?.name, 'Zoo Kis-Kis məhsulu');
  const description = getText(product?.description, `${name} Zoo Kis-Kis-də.`);
  const images = product ? getImages(product) : [];

  const price =
    typeof product?.price === 'number'
      ? product.price
      : typeof product?.price === 'string'
        ? Number(product.price)
        : undefined;

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: images,
        sku: product.sku || product.id || slug,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Zoo Kis-Kis'
        },
        offers: {
          '@type': 'Offer',
          url: `${siteUrl}/products/${slug}`,
          priceCurrency: 'AZN',
          ...(Number.isFinite(price) ? { price } : {}),
          availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
        }
      }
    : null;

  return (
    <>
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}

      <ProductDetailClient slug={slug} />
    </>
  );
}
