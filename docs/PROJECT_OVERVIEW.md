# HILAARA Store - Project Overview

## 1. Executive Summary

HILAARA is a dedicated single-vendor modern fashion e-commerce platform designed and built specifically for the Somali retail market. The brand offers refined, contemporary clothing collections for men and women. The platform provides a seamless digital shopping journey tailored to local consumer behaviors, mobile-first browsing habits, local mobile money payments, and local logistics workflows.

Unlike multi-vendor marketplaces, HILAARA operates on an integrated direct-to-consumer model. A single store owner and administration team curates the product catalog, controls pricing and promotional campaigns, manages physical inventory variants, processes orders, and coordinates delivery.

This project represents a full-stack e-commerce deployment built for portfolio presentation and CodeAlpha Full Stack Development internship submission. It adheres to strict software engineering standards, real database-backed operations, robust role-based security, modular payment abstractions, and a refined editorial visual aesthetic.

---

## 2. Business Model and Principles

### 2.1 Single-Vendor Direct Retail
HILAARA strictly maintains a single-vendor retail architecture:
- No third-party merchant registrations or onboarding forms.
- No vendor dashboards or independent vendor sub-accounts.
- No commission calculation or payout processing logic.
- No split cart or multi-vendor order routing.
- All inventory is owned, managed, and fulfilled directly by HILAARA.

### 2.2 Local Market Alignment (Somalia)
- Target Geography: Nationwide delivery within Somalia, centered on major metropolitan hubs including Mogadishu, Hargeisa, Garowe, Kismayo, and Baidoa.
- Payment Ecosystem: Seamless support for Somali mobile money ecosystems, primarily EVC Plus (Hormuud), eDahab (Telesom / Somtel), and ZAAD (Telesom), complemented by Pay on Delivery (settled via mobile money upon receipt).
- Mobile-First Architecture: High performance on cellular connections, responsive design optimized for smartphones, and frictionless checkout flows without unnecessary form friction.
- Currency and Pricing: United States Dollar (USD) as standard pricing unit with exact numeric currency storage, reflecting standard commercial practice in urban Somalia.

---

## 3. Core Customer Experience Objectives

1. Discovery and Exploration:
   - Curated Men and Women collections.
   - Editorial homepage featuring new arrivals, seasonal lookbooks, and highlighted essentials.
   - Fast, faceted filtering by category, size, color, availability, and price range.
   - Real-time catalog search with instant feedback and zero mock responses.

2. Product Immersion:
   - High-fidelity product galleries with optimized multi-angle photography via ImageKit.
   - Interactive size selection and color variant availability checks.
   - Clear stock availability indicators backed by actual database inventory levels.
   - Transparent delivery timelines and care instructions.

3. Cart and Wishlist:
   - Interactive slide-over cart drawer with instant quantity modifications.
   - Strict variant-level stock validation prior to checkout progression.
   - Persistent customer cart and wishlist tied to authenticated profiles.

4. Frictionless Checkout:
   - Single-page checkout with clear address selection and custom delivery notes.
   - Configurable delivery zone options with dynamic fee computation.
   - Transparent payment selection with clear payment instructions.
   - Immediate order confirmation with tracking identifier.

5. Customer Account and Self-Service:
   - Secure customer registration and authentication through Supabase Auth.
   - Saved shipping addresses for rapid checkout.
   - Complete historical order overview with real-time status progression.
   - Order tracking with timestamped status history and carrier notes.

---

## 4. Administration and Operations Objectives

The administration dashboard is an operational command center directly connected to Supabase:
- Real-Time Analytics: Metrics for paid revenue, total orders, pending orders, catalog size, and low-stock items calculated dynamically from real database records.
- Product and Catalog Management: Full CRUD operations for products, categories, image assets, pricing, and discount states.
- Matrix Inventory Control: Stock tracking per size and color variant, automated low-stock warnings, and auditable inventory movement logs.
- Order Lifecycle Management: Comprehensive order processing workflow from pending status through fulfillment and delivery verification.
- Mobile Money Payment Verification: Authoritative review and confirmation of incoming mobile money transactions and pay-on-delivery payments.
- Delivery Configuration: Dynamic management of serviceable cities, districts, delivery fees, and estimated fulfillment windows.
- Tamper-Evident Audit Logging: Persistent records of administrative operations including price adjustments, stock overrides, and order status transitions.

---

## 5. Technology Stack Summary

- Frontend: React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Lucide React, Framer Motion.
- Backend and Database: Supabase PostgreSQL, Supabase Auth, Row-Level Security (RLS), Database Functions and Triggers.
- Media Storage and CDN: ImageKit for authenticated uploads, image transformations, and responsive media delivery.
- Hosting and Edge Routing: Netlify with root netlify.toml configuration, SPA redirects, and Netlify Functions for secure server-side operations.
- Testing Suite: Vitest, React Testing Library, and ESLint.

---

## 6. Deliverables and Success Criteria

- Complete original brand identity, vector logo system, and brand guidelines.
- Seventeen comprehensive, mutually consistent engineering specification documents in the `/docs` directory.
- Fully realized responsive storefront and customer portal.
- Complete, secure, data-backed administrative dashboard.
- Zero reliance on mock datasets, hardcoded analytics, or decorative buttons.
- Fully automated test suite validating security, validation, business logic, and UI workflows.
- Production deployment on Netlify with verified routing and deep-linking support.
