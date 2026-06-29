# Layout və Product SEO üçün əlavə ediləcək kod

Bu faylı avtomatik tətbiq etmədim ki, dizayn və işləyən kod pozulmasın.
Sən mövcud faylı göndərsən, mən bunu dəqiq həmin faylın üstünə problemsiz patch edərəm.

## app/layout.tsx metadata

`export const metadata` hissəsini gücləndirmək lazımdır:

```ts
export const metadata = {
  metadataBase: new URL('https://zookiskis.az'),
  title: {
    default: 'Zoo Kis-Kis | Zooshop, pet shop və grooming xidməti',
    template: '%s | Zoo Kis-Kis'
  },
  description:
    'Zoo Kis-Kis — it, pişik, quş, balıq və xomyaklar üçün yemlər, aksesuarlar, biotualetlər, oyuncaqlar və grooming xidməti.',
  keywords: [
    'zooshop',
    'zoo shop',
    'pet shop',
    'heyvan mağazası',
    'zoo mağaza',
    'Bakı zooshop',
    'it yemi',
    'pişik yemi',
    'pişik qumu',
    'biotualet',
    'heyvan məhsulları',
    'grooming Bakı',
    'it grooming',
    'pişik məhsulları',
    'akvarium',
    'xomyak qəfəsi'
  ],
  openGraph: {
    title: 'Zoo Kis-Kis | Zooshop & Grooming',
    description:
      'Sevimli dostlarınız üçün yemlər, aksesuarlar, oyuncaqlar, biotualetlər və grooming xidməti.',
    url: 'https://zookiskis.az',
    siteName: 'Zoo Kis-Kis',
    locale: 'az_AZ',
    type: 'website'
  },
  alternates: {
    canonical: 'https://zookiskis.az'
  }
};
```

## Product detail SEO

Əgər məhsul detail server componentdirsə, `app/products/[slug]/page.tsx` içində `generateMetadata` olmalıdır:

```ts
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugFromDb(params.slug, false);

  if (!product) {
    return {
      title: 'Məhsul tapılmadı | Zoo Kis-Kis'
    };
  }

  const name = typeof product.name === 'string' ? product.name : product.name.az;
  const description =
    typeof product.description === 'string'
      ? product.description
      : product.description?.az;

  return {
    title: `${name} | Zoo Kis-Kis`,
    description: description || `${name} Zoo Kis-Kis-də. Bakı üzrə zooshop məhsulları və WhatsApp ilə sifariş imkanı.`,
    alternates: {
      canonical: `https://zookiskis.az/products/${product.slug}`
    },
    openGraph: {
      title: `${name} | Zoo Kis-Kis`,
      description: description || `${name} Zoo Kis-Kis-də.`,
      url: `https://zookiskis.az/products/${product.slug}`,
      images: product.image ? [product.image] : []
    }
  };
}
```

Product JSON-LD də əlavə etmək lazımdır:
- name
- description
- image
- price
- availability
- url

Bu məhsul description-larının SEO-ya real təsir etməsi üçün vacibdir.
