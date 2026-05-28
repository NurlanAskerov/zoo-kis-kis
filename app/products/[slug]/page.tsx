import { products as fallbackProducts } from '@/lib/data';
import { getProductBySlugFromDb } from '@/lib/db';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateStaticParams() {
  return fallbackProducts.map(product => ({ slug: product.slug }));
}

type ProductDetailParams = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailParams) {
  const { slug } = await Promise.resolve(params);
  let product = fallbackProducts.find(item => item.slug === slug);

  try {
    product = await getProductBySlugFromDb(slug, true) ?? product;
  } catch (error) {
    console.error('/products/[slug] product load error', error);
  }

  return <ProductDetailClient product={product} slug={slug} />;
}
