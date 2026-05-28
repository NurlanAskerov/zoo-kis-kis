import { ProductFilters } from '@/components/ProductFilters';
import { ProductsIntro } from '@/components/ProductsIntro';

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
