# HILAARA Store - Implementation Phases and Roadmap

## 1. Phased Development Methodology

To ensure high visual quality, solid architectural discipline, and complete real data integration, HILAARA is developed across ten sequential, verifiable phases.

Each phase must be executed completely, verified against defined acceptance criteria, and committed to Git with a descriptive message before proceeding to the next phase.

---

## 2. Phase Breakdown and Deliverables

### Phase 1: Foundation and Brand Identity
- Objectives: Project scaffolding, design token definition, vector logo assets, testing framework setup.
- Deliverables:
  - Vite React project structure.
  - Tailwind configuration with custom HILAARA palette, typography, and container rules.
  - React Router v6 setup with route boundaries.
  - Netlify root configuration (`netlify.toml` and `public/_redirects`).
  - Original vector brand assets in `public/brand/` (Wordmarks, Monograms, Favicon).
  - Reusable primitive UI components (Button, Input, Badge, Modal, Spinner).
  - Linting and testing harness with Vitest.
- Exit Criteria: Clean build with `npm run build`, zero lint warnings, unit tests passing.

---

### Phase 2: Database Schema and Authentication
- Objectives: PostgreSQL schema setup, Supabase client initialization, authentication flows, and RLS policies.
- Deliverables:
  - Comprehensive SQL migration scripts creating all tables, indexes, and triggers.
  - PostgreSQL Row-Level Security policies for all tables.
  - Security definer helper functions (`is_admin()`, `protect_profile_role()`).
  - AuthContext handling session lifecycle, login, registration, logout, and password recovery.
  - ProtectedRoute and AdminRoute guards.
- Exit Criteria: User registration, login, logout, and role separation verified against local/remote Supabase.

---

### Phase 3: Editorial Storefront Design
- Objectives: Build customer-facing layout, homepage, and category navigation.
- Deliverables:
  - Global Header with sticky backdrop, navigation links, and animated icons.
  - Editorial Homepage: Announcement bar, hero section, curated collection gateways, featured products, new arrivals, brand story, service guarantees, newsletter form, and footer.
  - Category and collection landing views (Men, Women, New Arrivals, Featured, Sale).
  - Smooth Framer Motion transitions with full reduced-motion support.
- Exit Criteria: Responsive mobile-to-desktop navigation, zero mock placeholders, elegant editorial aesthetic.

---

### Phase 4: Product Catalog and ImageKit Pipeline
- Objectives: Faceted catalog browsing, search, product detail pages, and media delivery.
- Deliverables:
  - Shop catalog page with real-time filters (category, gender, size, color, price range, in-stock).
  - Debounced search modal with live results.
  - Product Detail Page (PDP) with high-res multi-angle image gallery, size/color variant matrix, and stock status.
  - ImageKit helper utilities and Netlify serverless upload signature function.
- Exit Criteria: Fast faceted filtering, interactive variant selection, and dynamic responsive image transforms.

---

### Phase 5: Shopping Cart and Wishlist
- Objectives: State management for customer cart and wishlist with persistent storage.
- Deliverables:
  - CartContext with dual persistence (`localStorage` for guests, Supabase database for authenticated users).
  - Slide-over cart drawer with animated open/close transitions.
  - Dedicated `/cart` page with line-item quantity controls and stock ceiling limits.
  - Customer wishlist with toggle interactions and account syncing.
- Exit Criteria: Cart items persist across page refreshes, stock validation blocks invalid quantities.

---

### Phase 6: Checkout and Order Processing
- Objectives: Single-page checkout, dynamic shipping zones, and order creation.
- Deliverables:
  - Multi-step single-page checkout collecting contact details and delivery addresses in Somalia.
  - Dynamic shipping zone fee computation.
  - Idempotent order placement procedure preventing duplicate submissions.
  - Customer order confirmation view with unique order tracking numbers.
  - Customer account order history and detailed tracking timelines.
- Exit Criteria: Orders successfully created in PostgreSQL with snapshotted line items, stock deducted, and confirmation displayed.

---

### Phase 7: Mobile Money Payment Gateway
- Objectives: Somali payment integration with modular architecture and simulation controls.
- Deliverables:
  - Payment dispatcher supporting EVC Plus, eDahab, ZAAD, and Pay on Delivery.
  - Documented WaafiPay sandbox investigation and interface contract.
  - Explicitly labeled Demo Payment Simulation modal supporting approval, rejection, timeout, and cancellation scenarios.
  - Pay on Delivery flow setting order status to `awaiting_delivery_payment`.
  - Secure state transitions writing to `payments` and `payment_events`.
- Exit Criteria: Every payment state (paid, failed, pending, cancelled) tested and correctly reflected in orders table.

---

### Phase 8: Administrative Command Center
- Objectives: Build complete, data-backed admin management portal.
- Deliverables:
  - Dedicated admin shell with dark sidebar and responsive drawer.
  - Live Overview: Total paid revenue, total orders, pending count, low-stock warnings, and dynamic sales charts.
  - Full Product CRUD with variant matrix builder and ImageKit upload manager.
  - Variant Inventory Matrix with adjustment modals and movement audit logs.
  - Order Management: Status updater, payment verifier, courier note appender.
  - Customer overview, Shipping zone configuration, Store settings, and Tamper-evident Audit Logs.
- Exit Criteria: Zero hardcoded metrics, every button and filter connected to live database operations.

---

### Phase 9: Quality Assurance and End-to-End Testing
- Objectives: Comprehensive functional, security, and responsive testing.
- Deliverables:
  - Automated unit and integration test suite passing.
  - Security audit: RLS verification, privilege escalation prevention, and client secret inspection.
  - Cross-device responsive validation on mobile, tablet, and desktop viewports.
  - Direct deep-link navigation and page refresh testing on Netlify routing rules.
- Exit Criteria: 100% test pass rate, zero console errors, zero dead links.

---

### Phase 10: Production Deployment and Documentation
- Objectives: Live deployment on Netlify and final project submission report.
- Deliverables:
  - Production build deployed to Netlify with custom domain / subdomain.
  - Supabase and ImageKit production environment variables configured.
  - Comprehensive `README.md` and updated project report.
  - Final Git push to GitHub repository.
- Exit Criteria: Live URL verified, deep routes accessible, all payment simulation modes functional.
