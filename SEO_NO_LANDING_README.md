# Zoo Kis-Kis SEO - No Landing Pages

Bu paket ayrıca SEO landing page yaratmır.
Yəni `/it-yemi`, `/pisik-yemi`, `/zoo-magaza-baki` kimi əlavə görünən səhifələr yoxdur.

Paket yalnız bunları əlavə edir:
- sitemap.xml
- robots.txt
- privacy-policy
- llms.txt

Əsas SEO strategiya:
1. Ana səhifə SEO metadata gücləndirilməlidir.
2. Məhsul list səhifəsi `/products` düzgün title/description almalıdır.
3. Hər məhsul detail səhifəsi database-dən gələn məhsul adı və description ilə SEO metadata yaratmalıdır.
4. Hər məhsul detail səhifəsinə Product JSON-LD əlavə edilməlidir.
5. Google Search Console-da sitemap submit edilməlidir.

Əgər əvvəlki visual SEO pack tətbiq olunubsa və landing page-ləri silmək istəyirsənsə:

Windows CMD:
rmdir /s /q app\zoo-magaza-baki
rmdir /s /q app\heyvan-mehsullari
rmdir /s /q app\it-yemi
rmdir /s /q app\pisik-yemi
rmdir /s /q app\pisik-qumu
rmdir /s /q app\biotualet
rmdir /s /q app\grooming-baki
rmdir /s /q app\it-oyuncaqlari
rmdir /s /q app\pisik-oyuncaqlari
rmdir /s /q app\akvarium-mehsullari
rmdir /s /q app\xomyak-mehsullari
del lib\seo-pages.ts
del components\SeoLandingPage.tsx
del components\SeoLandingPage.module.css
