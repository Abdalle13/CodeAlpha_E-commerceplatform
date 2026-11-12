# HILAARA Store - Netlify Deployment and Edge Configuration

## 1. Hosting Platform and Strategy

HILAARA is deployed exclusively to **Netlify**. Netlify provides high-performance global CDN delivery, atomic continuous deployments from GitHub, serverless edge rewrites, and secure serverless function runtimes.

Deployment to Vercel or other cloud hosts is strictly excluded from this project scope.

---

## 2. Root Configuration: `netlify.toml`

The primary deployment orchestrator is `netlify.toml` located at the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

# Single Page Application (SPA) Client Routing Rule
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Serverless Functions API Proxy (Optional convenience rewrite)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Security and Asset Cache Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 3. Public Directory Redirects (`public/_redirects`)

In Vite applications, static assets in `public/` are copied directly to `dist/` upon build. To ensure redundant fallback coverage across all Netlify CDN nodes, `public/_redirects` is maintained with the standard rewrite rule:

```text
/*    /index.html   200
```

This guarantees that direct navigation or browser refresh on deep nested routes (such as `/shop`, `/products/silk-tailored-blazer`, `/account/orders`, or `/admin/inventory`) will never result in Netlify 404 errors.

---

## 4. Production Environment Variables in Netlify

All production credentials must be entered securely via the Netlify Web Interface (`Site configuration -> Environment variables`):

| Variable Key | Scope | Purpose | Example / Format |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | All (Build & Client) | Supabase API URL | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | All (Build & Client) | Supabase Public Anonymous Key | `eyJhbGciOi...` |
| `VITE_IMAGEKIT_URL_ENDPOINT` | All (Build & Client) | ImageKit CDN URL | `https://ik.imagekit.io/hilaara` |
| `VITE_IMAGEKIT_PUBLIC_KEY` | All (Build & Client) | ImageKit Public Client Key | `public_xyz...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions only | Administrative database bypass | `eyJhbGciOi...` |
| `IMAGEKIT_PRIVATE_KEY` | Functions only | HMAC upload signature secret | `private_xyz...` |

---

## 5. Build Optimization and Route Splitting

To minimize initial JavaScript payload and maximize mobile performance:
- Route-Level Code Splitting: Pages are loaded dynamically using `React.lazy()` and `Suspense`:
  ```javascript
  const HomePage = React.lazy(() => import('../pages/storefront/HomePage'));
  const ShopPage = React.lazy(() => import('../pages/storefront/ShopPage'));
  const ProductDetailPage = React.lazy(() => import('../pages/storefront/ProductDetailPage'));
  const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
  ```
- Vite Chunk Splitting: Configured in `vite.config.js` to separate large vendor libraries (e.g., Supabase, Lucide, Framer Motion) into independent browser-cacheable chunks.

---

## 6. Instant Lightweight Preloader

To eliminate white-screen latency while Vite bundles initialize, `index.html` includes an inline CSS-animated preloader:
- Renders immediately from the raw HTML shell.
- Styled using HILAARA Warm Ivory (`#F7F5EF`) and Charcoal (`#191A17`).
- Features a subtle pulsing HILAARA monogram.
- Seamlessly fades out and unmounts as soon as `main.jsx` executes `root.render()`.

---

## 7. Step-by-Step Production Deployment Procedure

1. Connect GitHub Repository:
   - Log into Netlify Console.
   - Click "Add new site" -> "Import an existing project".
   - Authorize GitHub and select repository `CodeAlpha_E-commerceplatform` (or `hilaara-store`).
2. Verify Build Settings:
   - Base directory: (Leave empty for repository root).
   - Build command: `npm run build`.
   - Publish directory: `dist`.
   - Functions directory: `netlify/functions`.
3. Add Environment Variables:
   - Navigate to Site configuration -> Environment variables and add all six keys detailed in Section 4.
4. Deploy Site:
   - Trigger initial deploy.
   - Monitor deploy log output for clean Vite production bundling.
5. Domain and SSL Verification:
   - Verify assigned Netlify subdomain (e.g., `hilaara-store.netlify.app`).
   - Confirm automatic Let's Encrypt SSL certificate provisioning.
6. Post-Deployment Verification:
   - Test home page loading.
   - Test direct refresh on `/shop` and `/admin`.
   - Test customer authentication and checkout simulation.
