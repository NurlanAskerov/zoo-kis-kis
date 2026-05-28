Zoo Kis-Kis v22 schema patch

Bu ZIP yalnız dəyişən fayllardan ibarətdir. Layihənin üstünə çıxardıb overwrite edin.

Dəyişikliklər:
- /api/products artıq geniş products schema-sını oxuyur: id, slug, name_az, audience, department, subcategory, price, stock və s.
- product_images cədvəlindən məhsul şəkilləri oxunur.
- product_tags cədvəli schema-da saxlanılır.
- Köhnə payload schema-sı varsa, kod legacy rejimdə onu da oxuya bilir.
- Sifarişlər database-ə yazılmır; WhatsApp-only məntiqinə uyğun olaraq /api/orders no-op cavab qaytarır.
- /api/products 500 verəndə sayt dağılmasın deyə fallback məhsulları qaytarır və console-da error göstərir.

Tətbiq etdikdən sonra:
npm run build
npm run dev

Database artıq geniş schema ilə yaradılıbsa, əlavə SQL işlətməyə ehtiyac yoxdur. Əgər yaratmamısınızsa, db/schema.sql faylındakı SQL-i Turso SQL editor-da run edin.
