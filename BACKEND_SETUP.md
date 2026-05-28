# Zoo Kis-Kis backend setup

Bu versiyada frontend fallback data ilə işləyir, `.env.local` doldurulduqda isə Turso database və Cloudflare Workers/OpenNext deployment üçün hazırdır.

## 1. Environment

`.env.example` faylını `.env.local` kimi kopyalayın:

```bash
cp .env.example .env.local
```

Doldurulacaq dəyişənlər:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
NEXT_PUBLIC_WHATSAPP_NUMBER=994555047010
```

## 2. Database tables

```bash
npm run db:init
```

Bu komanda `products` və `orders` cədvəllərini yaradır.

## 3. Development

```bash
npm install
npm run dev
```

## 4. Cloudflare preview/deploy

```bash
npm run preview
npm run deploy
```

Admin panel: `/admin`

Admin məhsul əlavə edəndə:
- AZ adı əsasdır
- EN/RU boş qalarsa AZ mətn fallback kimi istifadə oluna bilər
- şəkillər URL və ya `/products/...` public yolu kimi yazılır
- aktiv/passiv toggle məhsulun saytda görünüb-görünməməsini idarə edir
- qırmızı badge mətni ayrıca dəyişdirilir
