import { unstable_cache } from 'next/cache';
import { products as fallbackProducts } from '@/lib/data';
import { getProductBySlugFromDb } from '@/lib/db';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateStaticParams() {
  return fallbackProducts.map(product => ({ slug: product.slug }));
}

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => getProductBySlugFromDb(slug, true),
  ['zoo-kis-kis-product-detail'],
  { revalidate: 60 }
);

type ProductDetailParams = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailParams) {
  const { slug } = await params;
  let product;

  try {
    product = await getCachedProductBySlug(slug);
  } catch (error) {
    console.error('/products/[slug] product load error', error);
  }

  return <ProductDetailClient product={product} slug={slug} />;
}
