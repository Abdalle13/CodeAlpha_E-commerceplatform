# HILAARA Store - Environment Variables Specification

## 1. Overview and Security Principles

HILAARA strictly enforces separation between client-exposed environment variables and private server-side secrets:

- Client Variables: Prefixed with `VITE_`. These are bundled into the public client application at build time. They must never contain secrets, admin tokens, or private API keys.
- Serverless Variables: Stored strictly within Netlify environment variables or local `.env` files (never checked into Git). These are accessible only to Netlify Functions running in Node.js environments.

---

## 2. Environment Variables Matrix

### 2.1 Client-Side Variables (Vite Bundle)

| Variable Name | Required | Context | Description & Example |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Yes | Storefront & Admin | Supabase project API gateway URL.<br>Example: `https://xyzabcdefghijklmnop.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Storefront & Admin | Supabase public anonymous key subject to PostgreSQL Row-Level Security policies.<br>Format: Standard JWT token (`eyJhbGciOi...`) |
| `VITE_IMAGEKIT_URL_ENDPOINT` | Yes | Storefront & Admin | Public CDN endpoint for ImageKit media transformations.<br>Example: `https://ik.imagekit.io/hilaarastore` |
| `VITE_IMAGEKIT_PUBLIC_KEY` | Optional | Admin Media Widget | Public key for client-side ImageKit upload widgets.<br>Example: `public_4jK2...` |

### 2.2 Server-Side Variables (Netlify Functions Runtime)

| Variable Name | Required | Context | Description & Example |
| :--- | :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (Functions) | Netlify Functions | Administrative Supabase service key used for server-side operations that bypass RLS.<br>WARNING: NEVER expose in frontend code. |
| `IMAGEKIT_PRIVATE_KEY` | Yes (Functions) | Netlify Functions | Private API secret key used to generate cryptographic HMAC upload authentication tokens.<br>WARNING: NEVER expose in frontend code. |

---

## 3. Local Development Configuration (`.env`)

For local development, create a `.env` file at the root of the project. This file is excluded from Git tracking via `.gitignore`.

```env
# Client-side configuration (Vite)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
VITE_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key

# Serverless function configuration (Local netlify dev runtime)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key-here
```

A template file named `.env.example` is committed to the repository for reference.

---

## 4. Production Configuration in Netlify

In production, environment variables are managed directly in the Netlify Web Interface:

1. Open your Netlify Site Overview.
2. Navigate to **Site configuration** -> **Environment variables**.
3. Click **Add a variable** -> **Import from .env** or enter each key manually.
4. Set the scope to **All** for `VITE_` variables.
5. Set the scope to **Functions** or **Same across all deploy contexts** for `SUPABASE_SERVICE_ROLE_KEY` and `IMAGEKIT_PRIVATE_KEY`.
6. Trigger a new deployment for changes to take effect in the Vite build bundle.

---

## 5. Fallback and Missing Variable Handling

The application code contains graceful fallback logic to prevent hard crashes during initial developer setup:
- Missing Supabase Credentials: The application renders a clear setup guide in the browser console and displays friendly setup notices rather than throwing unhandled promise rejections.
- Missing ImageKit Credentials: The application falls back to local vector brand assets and neutral placeholder fashion drawings in `public/brand/`, allowing UI development to proceed smoothly.
