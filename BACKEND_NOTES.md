# Zoo Kis-Kis backend qeydləri

Layihədə admin və sifariş üçün API route skeleti hazırdır.

## .env
`.env.example` faylını `.env.local` kimi kopyalayın və dəyərləri yazın:

```env
ADMIN_PASSWORD=strong-password
ADMIN_SESSION_SECRET=random-long-secret
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
```

## API-lər

- `POST /api/admin/login` — admin şifrə yoxlanışı və cookie sessiyası
- `GET /api/admin/status` — admin giriş statusu
- `POST /api/admin/logout` — çıxış
- `GET /api/products` — aktiv məhsullar
- `GET /api/admin/products` — bütün məhsullar, admin tələb edir
- `POST /api/admin/products` — məhsul əlavə/yenilə, admin tələb edir
- `POST /api/orders` — sifariş məlumatını bazaya yazır, sonra istifadəçi WhatsApp mesajı göndərir

## Turso cədvəlləri

`db/schema.sql` içində `products` və `orders` cədvəlləri var. API-lər ilk işləyəndə `CREATE TABLE IF NOT EXISTS` ilə cədvəlləri yaradır.

## Şəkil yükləmə

Hazır admin paneldə məhsul şəkli üçün `public` yolu və ya URL yazılır. Real deployment üçün şəkilləri Cloudflare R2, Cloudinary və ya başqa storage-də saxlamaq, database-də isə URL saxlanmaq daha düzgündür.
