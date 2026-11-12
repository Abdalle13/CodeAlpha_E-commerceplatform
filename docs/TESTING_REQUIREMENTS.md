# HILAARA Store - Testing Requirements and Quality Assurance Strategy

## 1. Testing Philosophy and Standards

To guarantee high software reliability, data consistency, and transaction security, HILAARA enforces automated and manual testing standards across every subsystem:

- Real Business Logic Verification: Tests validate real calculations (such as tax/delivery additions, discount computations, and stock decrements) rather than purely decorative UI rendering.
- Zero False Positives: Tests must run in a reproducible environment and must never be reported as passed without actual execution and clean exit codes.
- Security-First Testing: Authorization boundaries, RLS policies, and anti-privilege escalation constraints are tested against adversarial input.

---

## 2. Test Suite Architecture and Tooling

- Test Runner: Vitest (fast, native Vite integration, ESM support).
- Component Testing: React Testing Library (user-centric DOM testing).
- Assertions and Spies: Vitest `@testing-library/jest-dom` matchers.
- Environment: `jsdom` for browser simulation.
- Test Scripts:
  - `npm test`: Runs Vitest test suite once.
  - `npm run test:watch`: Runs Vitest in interactive watch mode.
  - `npm run test:coverage`: Generates test coverage report.

---

## 3. Comprehensive Test Matrix

### 3.1 Authentication and Access Control Tests
- Registration:
  - Successful user creation with valid email, password, and full name.
  - Rejection of invalid email formats or passwords under minimum strength requirements.
  - Duplicate registration handling with friendly error notice.
- Login and Session Lifecycle:
  - Valid credentials establish active JWT session and profile record.
  - Invalid password triggers error alert without leaking account existence.
  - Logout cleanly purges local storage tokens and resets auth context state.
- Route Protection and RBAC:
  - Unauthenticated access to `/account/*` redirects to `/login` with `returnUrl`.
  - Non-admin authenticated user navigating to `/admin/*` is blocked and redirected.
  - Database trigger prevents non-admin user from updating `role = 'admin'` via client query.

---

### 3.2 Product Catalog and Search Tests
- Catalog Querying and Faceted Filtering:
  - Filtering by gender displays only matching garments.
  - Multi-select category filters return union of active category items.
  - Price range slider accurately filters products by effective price (`COALESCE(discount_price, base_price)`).
  - Out-of-stock toggle hides variants with zero inventory.
- Product Detail Page (PDP):
  - Correct price, discount badge, and descriptions render from props/state.
  - Selecting a size swatch updates variant selection and stock availability indicator.
  - Quantity stepper is constrained between 1 and available variant stock.
- Real-Time Search:
  - Search query executes with debounce delay (300ms).
  - Search results display matching garment titles and thumbnails.
  - Empty search results show informative fallback suggestions.

---

### 3.3 Shopping Cart and Checkout Tests
- Cart Manipulation:
  - Adding item with selected size and color creates unique cart item.
  - Incrementing item quantity updates line total and cart subtotal.
  - Exceeding variant stock ceiling triggers visual warning and caps quantity.
  - Removing item recalculates subtotal and triggers feedback toast.
  - Cart items persist across browser page reload (via localStorage or database sync).
- Checkout Validation:
  - Required fields (name, phone, city, district, address) trigger validation errors when omitted.
  - Somali phone number validator ensures correct digit formatting.
  - Dynamic delivery fee is added correctly to subtotal based on chosen shipping zone.
- Duplicate Submission Protection:
  - Clicking "Complete Order" disables the submit button immediately.
  - Idempotency key is generated and attached to submission payload.

---

### 3.4 Payment State and Gateway Tests
- Simulation Scenarios:
  - "Simulate Instant Approval" marks payment as `paid`, sets order to `confirmed`, and records transaction reference.
  - "Simulate Insufficient Balance" marks payment as `failed`, restores cart, and prompts re-attempt.
  - "Simulate USSD Timeout" marks payment as `pending` and provides polling interface.
  - "Cancel Transaction" terminates checkout cleanly.
- Pay on Delivery:
  - Selecting Pay on Delivery sets payment status to `awaiting_delivery_payment`.
  - Customer order status moves to `pending` review.
  - Admin payment confirmation updates status to `paid` and creates an audit log entry.

---

### 3.5 Order Management and Inventory Consistency Tests
- Stock Deduction:
  - Successful order placement decrements `inventory.quantity` by exact ordered amount.
  - Inventory movement audit row (`purchase_deduction`) is created.
  - Out-of-stock attempt during checkout aborts order creation and throws error.
- Stock Restoration on Cancellation:
  - Cancelling an active order increments variant inventory back by ordered amount.
  - Inventory movement audit row (`cancellation_restock`) is recorded.
- Historical Snapshot Integrity:
  - Editing a product's price or name in the catalog does not alter `order_items` records for previously completed orders.

---

### 3.6 Admin Command Center Tests
- Real-Time Analytics:
  - Revenue metric aggregates only `paid` orders; pending and unpaid orders are excluded.
  - Zero orders in database displays `$0.00` with clean empty state.
- Product CRUD:
  - Creating new product inserts record into `products`, creates variants in `product_variants`, and initializes stock in `inventory`.
  - Editing product updates prices and attributes.
  - Soft-deleting product sets `is_published = false`.
- Inventory Adjustments:
  - Admin manual stock override updates quantity and writes to `inventory_movements` with admin user ID and reason.

---

### 3.7 Deployment and Responsive Performance Tests
- Netlify Routing:
  - Direct URL reload on deep routes (`/shop`, `/collections/men`, `/checkout`, `/admin/orders`) returns HTTP 200 via `_redirects` SPA rewrite.
- Performance and Accessibility:
  - Page weight and bundle size monitored via Vite build output.
  - Responsive layout verified on mobile (375px), tablet (768px), and desktop (1280px+).
  - `prefers-reduced-motion` media query disables motion translations.
