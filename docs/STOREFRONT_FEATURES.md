# HILAARA Store - Storefront Features and User Experience

## 1. Storefront Experience Overview

The HILAARA storefront provides a refined, fashion-forward retail experience. Built with editorial design sensibilities, it balances generous negative space with rich typography and responsive product media.

All data displayed across the storefront originates from live PostgreSQL tables. There are no placeholder products, no synthetic discount countdowns, and no hardcoded customer reviews.

---

## 2. Page Specifications

### 2.1 Homepage Architecture
The homepage introduces the brand aesthetic and directs shoppers toward current collections:

1. Announcement Bar: High-contrast top bar displaying operational store announcements (e.g., standard delivery windows in Mogadishu or store operating hours).
2. Primary Navigation Header:
   - Sticky header with backdrop blur and smooth background transition on scroll.
   - Distinctive HILAARA wordmark logo.
   - Collection links: Men, Women, New Arrivals, Featured.
   - Action icons: Search toggle, Wishlist badge with live count, Cart drawer toggle with live item counter, and Account/Profile menu.
3. Editorial Hero Section:
   - High-impact portrait photography showcasing current seasonal silhouettes.
   - Refined serif headline with concise, confident brand copy.
   - Direct call-to-action buttons navigating to Men's and Women's ready-to-wear lines.
4. Curated Collection Gateways:
   - Split editorial cards featuring Men's and Women's seasonal highlights with subtle zoom-on-hover interaction.
5. Featured Products Carousel / Grid:
   - Curated selection of items flagged with `is_featured = true`.
   - Dynamic pricing, secondary hover imagery, and fast quick-view triggers.
6. New Arrivals Showcase:
   - Recent catalog additions sorted by `created_at DESC` with dynamic "New" pill badges.
7. Brand Philosophy and Garment Craftsmanship:
   - Editorial section highlighting textile quality, tailored drape, and minimalist construction philosophy.
8. Verified Customer Benefits:
   - Realistic service commitments: Nationwide Somalia delivery, mobile money payment support (EVC Plus, eDahab, ZAAD), and direct customer support.
9. Working Newsletter Subscription:
   - Email subscription field linked directly to the database or email service, complete with duplicate prevention and validation feedback.
10. Storefront Footer:
    - Inverted charcoal footer with light HILAARA mark.
    - Direct navigational links to category listings, customer support, shipping policies, and privacy terms.

---

### 2.2 Shop and Catalog Browsing

The catalog view at `/shop` provides flexible exploration across the product line:

#### Faceted Filter Capabilities
- Gender Filter: Men, Women, or All.
- Category Filter: Multi-select category pills derived from active database categories.
- Size Filter: Dynamic size options (e.g., XS, S, M, L, XL, XXL) populated from active product variants.
- Color Filter: Color swatches reflecting real available garment tones.
- Price Range Filter: Dual-slider or min/max numeric inputs constraining `base_price` or `discount_price`.
- Stock Availability: Toggle to hide out-of-stock items.

#### Sorting Rules
- Newest Arrivals: `created_at DESC`
- Price: Low to High: `COALESCE(discount_price, base_price) ASC`
- Price: High to Low: `COALESCE(discount_price, base_price) DESC`
- Alphabetical: `name ASC`

#### State Management and UX
- Responsive Drawer: On mobile devices, filters collapse into an accessible slide-out filter sheet.
- Empty State: When no items match filter combinations, display a clean message with a single click "Reset all filters" action.
- Infinite Scroll / Pagination: Predictable paginated chunks with clean loading skeletons.

---

### 2.3 Product Detail Page (PDP)

Located at `/products/:slug`, the PDP focuses entirely on garment details, fabric drape, and sizing:

1. Interactive Image Gallery:
   - Main high-resolution viewport with pinch/click zoom.
   - Thumbnails showing all uploaded angles (front, back, textile close-up).
   - Smooth carousel transition with keyboard navigation support.
2. Product Information Hierarchy:
   - Category breadcrumb navigation.
   - Product name and current active price.
   - Discount badge showing actual percentage savings if `discount_price` is populated.
   - Narrative product description detailing fit, cut, and textile care.
3. Interactive Variant Selectors:
   - Color Swatches: Visual color selector highlighting active variant hue.
   - Size Matrix: Button selector with real-time stock indicator (active, low stock, or crossed out if depleted).
4. Purchase Actions:
   - Quantity stepper constrained by available physical variant inventory.
   - Add to Cart button with animated loading and success feedback.
   - Wishlist toggle button with heart animation.
5. Shipping and Delivery Accordion:
   - Dynamic delivery timeframe estimates based on store settings.
   - Mobile money payment reminder.
6. Related Recommendations:
   - Related products from the same category or gender, excluding the current item.

---

### 2.4 Dedicated Collection Pages
- Men (`/collections/men`): Filtered catalog view scoped to `gender IN ('men', 'unisex')`.
- Women (`/collections/women`): Filtered catalog view scoped to `gender IN ('women', 'unisex')`.
- New Arrivals (`/collections/new-arrivals`): Filtered view scoped to `is_new_arrival = true`.
- Featured (`/collections/featured`): Filtered view scoped to `is_featured = true`.
- Sale (`/collections/sale`): Only active when items have a non-null `discount_price`.

---

### 2.5 Real-Time Search Experience
- Header Search Modal: Accessible search input with debounced querying (300ms delay).
- Instant Search Results: Displays matching product titles, category badges, prices, and thumbnail photography.
- Empty Search State: Helpful tips when no garments match the search query, with quick links to popular collections.
