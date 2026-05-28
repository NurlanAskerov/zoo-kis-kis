import { products } from '@/lib/data';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  return <ProductDetailClient product={product} slug={slug} />;
}
