import { ProductFilters } from '@/components/ProductFilters';
import { ProductsIntro } from '@/components/ProductsIntro';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Məhsullar',
  description: 'Zoo Kis-Kis məhsul kataloqu: pişik, it, quş, balıq və gəmiricilər üçün yemlər, oyuncaqlar, aksesuarlar və baxım məhsulları.',
  alternates: { canonical: '/products' }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type ProductSearchParams = {
  audience?: string;
  type?: string;
  category?: string;
  department?: string;
  collection?: string;
};

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<ProductSearchParams> }) {
  const params = searchParams ? await searchParams : {};

  return (
    <main className="page section">
      <div className="container">
        <ProductsIntro />
        <ProductFilters
          initialAudience={params.audience}
          initialType={params.type}
          initialCategory={params.category}
          initialDepartment={params.department}
          initialCollection={params.collection}
        />
      </div>
    </main>
  );
}
