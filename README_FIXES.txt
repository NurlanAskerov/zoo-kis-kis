Zoo Kis-Kis final fix package

Bu versiyada tətbiq olunan əlavə düzəlişlər:

1. Vercel ISR Writes limiti
- Server-side unstable_cache/revalidate istifadəsi çıxarıldı.
- Məhsul datası no-store API cavabları ilə işləyir.
- API cavablarına Cache-Control, CDN-Cache-Control və Vercel-CDN-Cache-Control no-store header-ləri əlavə edildi.
- Məhsul siyahısı üçün qısa runtime memory cache əlavə olundu, admin redaktə/toggle zamanı cache təmizlənir.
- Product detail səhifəsində generateStaticParams/ISR davranışı söndürüldü.
- Product link prefetch-ləri söndürüldü ki, boş yerə detail səhifələri qabaqcadan çağırılmasın.

Qeyd: Vercel dashboard-da əvvəl yığılmış 304K/200K göstəricisi dərhal azalmır. Yeni deploy-dan sonra yeni ISR write artımı dayanmalıdır, limit isə Vercel-in cari usage period-u bitəndə sıfırlanır.

2. Mobil məhsul karuseli scroll problemi
- Mobil touch davranışı dəyişdirildi.
- Məhsul kartının üzərinə basıb yuxarı/aşağı sürüşdürəndə səhifə normal vertical scroll olur.
- Desktop drag qalır, touch-da isə browser-in native scroll davranışı bloklanmır.

3. Desktop karusel oxları
- Məhsulların üstünə düşən sol/sağ oxlar kartların içindən çıxarıldı.
- Oxlar başlıq hissəsinə, "Hamısını göstər" düyməsinin yanına yerləşdirildi.
- Mobil görünüşdə bu oxlar gizlədilir; mobil scroll əl ilə işləyir.

4. Əvvəlki düzəlişlər saxlanıldı
- Məhsul kartı ağ media fonu.
- Hover zamanı badge-lərin arxada qalma problemi.
- Admin toggle donması.
- Admin məhsul axtarışı və redaktə.
- TypeScript uyğunluğu.

Yoxlama:
- npm run lint keçdi.
