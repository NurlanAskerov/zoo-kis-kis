# Custom Category DB-only Test Report

Bu paketdə custom bölmə / alt bölmə üçün browser storage istifadə olunmur.

## Yoxlanılan əsas məntiq

- Admin panel custom bölmələri yalnız `/api/admin/custom-filters` ilə DB-yə yazır.
- Admin panel custom bölmələri yalnız DB-dən oxuyur.
- Browser storage app kodundan tam çıxarılıb.
- Yeni bölmə əlavə ediləndə həmin bölmə dərhal department select-də seçilmiş olur.
- Default alt bölmə də həmin anda subcategory select-də seçilmiş olur.
- Məhsul saxlananda `categoryKey` custom department, `typeKey` custom subcategory kimi qalır.
- Public `/products` filterləri `/api/custom-filters` və `/api/products` ilə DB-dən oxuyur.
- Product card və product detail custom label göstərir.
- Product detail zoom funksiyası qalır.
- Ana səhifə, slider və banner fayllarına toxunulmayıb.

## Local test

```bash
node scripts/custom-category-self-test.mjs
```

## Manual 0-dan test

1. Turso-da `admin_departments` və `admin_subcategories` cədvəlləri boş olsa belə problem deyil.
2. Admin panelə gir.
3. Yeni bölmə əlavə et.
4. Yeni bölmə yuxarıdakı `Bölmə` select-də seçilmiş görünməlidir.
5. Alt bölmə select-də default alt bölmə görünməlidir.
6. Məhsul saxla.
7. `/api/custom-filters` aç: yeni bölmə DB-dən gəlməlidir.
8. `/api/products` aç: həmin məhsulda `categoryKey` və `typeKey` custom dəyərlər olmalıdır.
9. Başqa browser/telefonda məhsul filterində və detail-də eyni bölmə görünməlidir.
