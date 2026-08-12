# Emerson University LMS — Vercel deployment

This project is prepared to run as two Vercel projects:

- **Frontend:** `client/` → Vite static site
- **Backend:** `server/` → Express API through Vercel serverless functions
- **Database:** MongoDB Atlas
- **File uploads:** Cloudinary unsigned upload preset (recommended for Vercel)

## 1. MongoDB Atlas

Use the same MongoDB connection string that works locally.

For a Vercel-hosted API, Atlas network access must allow the Vercel runtime to connect. A common simple setup for a student/demo deployment is `0.0.0.0/0`; for production, use your organization's approved network/security policy.

## 2. Deploy the backend first

Create a new Vercel project and select the **`server`** directory as the Root Directory.

Add these environment variables:

```text
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
JWT_ACCESS_SECRET=long_random_secret
JWT_REFRESH_SECRET=different_long_random_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
COOKIE_SECRET=long_random_secret
```

Optional mail variables can be added if email verification/password reset is enabled:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

The backend's `api/index.js` connects to MongoDB and then hands the request to the existing Express app.

> Socket.IO is not required for the REST API. The frontend can disable it on Vercel with `VITE_ENABLE_SOCKET=false`.

## 3. Cloudinary uploads — no API key in the browser

The assignment/material uploader now prefers **direct unsigned Cloudinary uploads**. This avoids the `must supply api_key` error in the browser and avoids Vercel's ephemeral filesystem.

In Cloudinary:

1. Create a Cloudinary account.
2. Open **Settings → Upload → Upload presets**.
3. Create an **Unsigned** upload preset.
4. Copy the Cloud Name and preset name.

Do **not** put `CLOUDINARY_API_SECRET` in the frontend.

The Vercel frontend only needs:

```text
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

If these variables are not configured, local development falls back to the Express upload endpoint. In local development, the backend stores files under `server/uploads/` so the assignment flow can be tested without Cloudinary.

## 4. Deploy the frontend

Create another Vercel project and select the **`client`** directory as the Root Directory.

Environment variables:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_ENABLE_SOCKET=false
```

Redeploy after changing Vite environment variables because they are compiled into the frontend build.

## 5. Update backend CORS

After the frontend deployment URL is known, set the backend:

```text
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
```

If you have multiple frontend domains, use:

```text
CLIENT_URLS=https://YOUR-FRONTEND.vercel.app,https://www.example.com
```

## 6. Seed demo data

For local development, use:

```text
http://localhost:5000/api/dev/seed
```

For a production/Vercel database, do **not** leave a public seed endpoint enabled. If you intentionally need it, set a secret backend variable:

```text
DEV_SEED_KEY=a-long-random-secret
```

Then call:

```text
https://YOUR-BACKEND.vercel.app/api/dev/seed?key=YOUR_SECRET
```

Remove/rotate the key after seeding.

## 7. SPA routing

`client/vercel.json` rewrites application routes to `index.html`, so direct visits such as `/about`, `/login`, `/faqs` and dashboard routes do not become Vercel 404s.

## 8. Production payment note

The fee UI supports:

- Cash / By Hand
- JazzCash
- Easypaisa
- UPaisa
- HBL
- Meezan Bank
- MCB
- UBL
- Bank of Punjab
- Debit/Credit Card

The current LMS records the selected payment method as a **demo/simulation**. It does not move real money. Before accepting real payments, integrate the institution's approved merchant/gateway APIs and server-side verification/webhooks.
