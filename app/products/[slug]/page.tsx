import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type ProductDetailParams = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailParams) {
  const { slug } = await params;

  return <ProductDetailClient slug={slug} />;
}
