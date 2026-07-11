# Şəkil keyfiyyəti və xüsusi bölmə silmə düzəlişi

## Şəkillər
- 3 MB-dan kiçik, 2560 px-dən böyük olmayan JPG/PNG/WebP faylları yenidən sıxılmadan yüklənir.
- Çox böyük şəkillər 2000-2560 px aralığında yüksək keyfiyyətli WebP kimi optimizasiya olunur.
- Məhsul kartlarında Next/Image keyfiyyəti artırılıb.
- Məhsul detalının əsas şəkli 1240 px və quality=94 ilə hazırlanır; 2x hover zoom daha aydın görünür.
- Next.js image qualities siyahısı istifadə edilən keyfiyyət dəyərlərinə uyğunlaşdırılıb.

## Bölmə və alt bölmə silmə
- Admin panelində "Bölmə / alt bölmə əlavə et və idarə et" hissəsində xüsusi bölmə və alt bölmələr siyahılanır.
- Hər sətrin yanında Sil düyməsi var.
- Bölməyə və ya alt bölməyə məhsul bağlıdırsa silmə dayandırılır və məhsulların əvvəl başqa bölməyə keçirilməsi tələb olunur.
- Xüsusi bölmə silindikdə ona aid boş alt bölmələr də silinir.
- Xüsusi bölmənin son alt bölməsi ayrıca silinmir; həmin halda bütöv bölmə silinməlidir.

## Yoxlama
- `npm run lint` uğurludur.
- `npm run build` Next.js 16.2.6 / Turbopack ilə uğurludur.
