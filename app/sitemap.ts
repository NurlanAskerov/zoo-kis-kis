import { MetadataRoute } from 'next';
import { getProductsFromDb } from '@/lib/db';

const siteUrl = 'https://zookiskis.az';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const products = await getProductsFromDb(false);

    productPages = products.map(product => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85
    }));
  } catch {
    productPages = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/grooming`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.35 }
  ];

  return [...staticPages, ...productPages];
}
