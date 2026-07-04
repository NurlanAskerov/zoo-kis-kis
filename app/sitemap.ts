import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';

const siteUrl = 'https://www.zookiskis.az';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['', '/products', '/grooming', '/delivery', '/about', '/contact'].map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8
  }));

  const productRoutes = products
    .filter(product => product.active !== false)
    .map(product => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

  return [...staticRoutes, ...productRoutes];
}
