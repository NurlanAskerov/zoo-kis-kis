# Vercel build və xüsusi bölmə adı düzəlişi

Bu paket iki bağlı problemi həll edir:

1. Köhnə `/api/custom-filters` route-ları `lib/db.ts` faylında artıq mövcud olmayan `getCustomFiltersFromDb` və `upsertCustomFiltersToDb` export-larını çağırdığı üçün Turbopack build dayanırdı.
2. Xüsusi bölmə/alt-bölmə adı yalnız ayrıca filtr sorğusundan alınırdı. Sorğu uğursuz və ya gec olduqda məhsulda ad əvəzinə açar görünə və ya ad ümumiyyətlə görünməyə bilərdi.

## Edilən dəyişikliklər

- `custom-filters` və `catalog-filters` endpoint-ləri eyni DB funksiyalarına bağlandı.
- Köhnə funksiya adları üçün geriyə uyğun export-lar əlavə edildi.
- Məhsula `departmentLabel` və `typeLabel` məlumatları əlavə edildi.
- Bölmə və alt-bölmə adları məhsul saxlanarkən `extra_json` daxilində də saxlanılır.
- Köhnə məhsullar DB-dən oxunarkən `catalog_settings` məlumatı ilə avtomatik zənginləşdirilir; əl ilə yenidən yaratmaq tələb olunmur.
- Məhsul kartı, detal səhifəsi, səbət və tövsiyələr məhsulda saxlanmış adı üstün tutur, sonra ümumi filtr siyahısına keçir.
- Public tərəf əvvəl `/api/catalog-filters`, lazım olsa `/api/custom-filters` endpoint-inə fallback edir.

## Tətbiq

Tam layihə arxivindən istifadə edirsinizsə, mövcud `.env` faylınızı qoruyun və arxivdəki faylları repository-yə köçürün.

Patch arxivindən istifadə edirsinizsə, içindəki qovluq strukturunu repository-nin kökünə olduğu kimi köçürüb mövcud faylları əvəz edin.

Sonra:

```bash
npm install
npm run lint
npm run build
git add .
git commit -m "fix custom category build and product labels"
git push
```

Əvvəllər xüsusi bölmələr yalnız admin brauzerinin localStorage yaddaşında qalıbsa, deploy-dan sonra həmin brauzerdə admin panelə bir dəfə daxil olmaq onları server DB-yə köçürəcək.

## Yoxlamalar

- `npm run lint`: uğurlu
- Next.js 16.2.6 Turbopack production build: uğurlu
- `/api/catalog-filters`: build route olaraq yaradıldı
- `/api/custom-filters`: build route olaraq yaradıldı
- `/api/admin/custom-filters`: build route olaraq yaradıldı
- Lokal DB inteqrasiya sınağı: xüsusi bölmə yaratma, məhsula təyin etmə, DB-dən oxuma və başqa xüsusi bölməyə redaktə etmə uğurlu
