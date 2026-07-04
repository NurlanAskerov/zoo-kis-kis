import type { Metadata } from 'next';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { products } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type ProductDetailParams = {
  params: Promise<{ slug: string }>;
};


export async function generateMetadata({ params }: ProductDetailParams): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  const title = product?.name?.az || 'Məhsul';
  const description = product?.description?.az || 'Zoo Kis-Kis məhsul detal səhifəsi.';
  const image = product?.image || '/banners/zoo-kis-kis-store.webp';

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description,
      url: `/products/${slug}`,
      images: [{ url: image, alt: title }]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailParams) {
  const { slug } = await params;

  return <ProductDetailClient slug={slug} />;
}
