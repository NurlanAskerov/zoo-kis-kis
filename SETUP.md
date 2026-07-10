# Zoo Kis-Kis setup

## Local run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Required env values

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_WHATSAPP_PHONE=994555047010
```

`ADMIN_PASSWORD` is used on `/admin`. `ADMIN_SESSION_SECRET` signs the admin cookie.

## Turso database

After adding Turso values to `.env.local`, initialize the tables:

```bash
npm run db:init
```

Products are saved in the `products` table as a JSON payload, with a separate `active` flag for quick show/hide toggles. Orders are saved in the `orders` table before the WhatsApp message opens.

## Cloudflare deploy

The project includes OpenNext Cloudflare scripts:

```bash
npm run preview
npm run deploy
```

Add the same env values in Cloudflare project settings / secrets before deployment.

## Images

The admin panel currently saves image paths or URLs. For production file uploads, connect Cloudflare R2 or Cloudflare Images and save the returned URL in the image fields.


## Turso bölmə cədvəlləri

Admin paneldə əlavə olunan yeni bölmə və alt bölmələr bütün cihazlarda görünsün deyə Turso-da bu cədvəlləri yarat:

1. Turso Cloud → database → SQL console.
2. `turso/admin_custom_filters.sql` faylındakı SQL-i çalışdır.
3. Vercel/env-də bunlar olmalıdır:

```env
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
```

Bundan sonra admin paneldə əlavə olunan bölmə/alt bölmə DB-yə yazılacaq və məhsul filterlərində işləyəcək.
