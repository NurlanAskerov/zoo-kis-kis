# Custom bolme acarlarinin duzelisi

Bu versiyada yeni bolme ve alt-bolme acarlarinda `custom-section-` ve `custom-sub-` prefiksleri yaradilmır.

Numune:

- kohne: `custom-section-ittestt`
- yeni: `ittestt`

- kohne: `custom-sub-custom-section-ittestt-yemler`
- yeni: `ittestt-yemler`

Deploy-dan sonra `/api/catalog-filters` ilk defe cagirildiqda kohne `products.department`, `products.subcategory` ve `extra_json` deyerleri avtomatik temizlenir. Admin panelin acilmasi bu endpoint-i avtomatik cagirir.
