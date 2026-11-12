# HILAARA Store - Brand and Design Guidelines

## 1. Brand Essence and Positioning

HILAARA is an upscale contemporary fashion label designed for discerning individuals in Somalia. The brand embodies modern sophistication, structured elegance, and timeless silhouettes. It rejects fast-fashion clutter in favor of thoughtful, durable, and versatile wardrobe essentials across men's and women's ready-to-wear collections.

### Core Brand Attributes
- Modern: Clean architectural lines, contemporary tailoring, and functional elegance.
- Confident: Understated authority, quiet luxury, and unapologetic minimalism.
- Refined: Subtle textures, precise proportions, and exquisite attention to detail.
- Fashion-Focused: Editorial compositions, high-contrast imagery, and authentic garment appreciation.
- Trustworthy: Transparent pricing, accurate inventory tracking, reliable local fulfillment, and secure transactions.

### Voice and Tone
The HILAARA voice is concise, poised, and mature. It communicates through clarity and confidence rather than aggressive sales tactics.
- Avoid hyperbole, invented accolades, exclamation mark clusters, and synthetic urgency timers.
- Present product features, fabric composition, fit characteristics, and care guidance directly.
- Ensure all copy is grounded in real garment attributes and truthful commercial policies.

---

## 2. Color Palette System

The visual language of HILAARA is built on an organic, warm neutral foundation contrasted with deep charcoal and accented with muted botanical tones.

### 2.1 Primary Brand Colors

| Token Name | Hex Code | Tailwind Utility | Functional Role |
| :--- | :--- | :--- | :--- |
| Warm Ivory | `#F7F5EF` | `bg-warm-ivory`, `text-warm-ivory` | Primary canvas, page backgrounds, cards |
| Charcoal | `#191A17` | `bg-charcoal`, `text-charcoal` | Primary typography, headers, key buttons |
| Muted Olive | `#777B62` | `bg-muted-olive`, `text-muted-olive` | Secondary actions, badges, subtle accents |
| Soft Beige | `#E8E2D8` | `bg-soft-beige`, `text-soft-beige` | Card borders, dividers, subtle surfaces |
| Pure White | `#FFFFFF` | `bg-white`, `text-white` | Image backgrounds, modal panels, popovers |
| Muted Text | `#77766F` | `text-muted-charcoal` | Secondary body copy, timestamps, meta tags |

### 2.2 Operational and Feedback Colors

| Purpose | Hex Code | Usage Guideline |
| :--- | :--- | :--- |
| Success / In Stock | `#3D6B52` | Verified payments, in-stock badge, completed deliveries |
| Warning / Low Stock | `#B88746` | Low stock thresholds, pending mobile money verifications |
| Error / Out of Stock | `#A63A3A` | Validation errors, payment failures, cancelled orders |
| Subtle Surface Tint | `#F1EDE4` | Interactive hover states on table rows and secondary buttons |

### 2.3 Prohibited Visual Styles
- No high-saturation neon blues, purples, or magenta tones.
- No multicolored gradients or gradient text effects.
- No heavy glassmorphism with excessive blur filters.
- No rainbow borders or decorative card drop-shadows.

---

## 3. Typography Architecture

HILAARA combines a distinctive, high-contrast modern editorial serif for primary display and titles with a crisp, geometric grotesque sans-serif for interface elements, product metadata, and long-form descriptions.

### 3.1 Font Families
- Display and Editorial: Cormorant Garamond / Playfair Display (Serif)
  - Usage: Hero headlines, collection titles, brand statement quotes, promotional callouts.
  - Characteristics: Elegant proportions, tight tracking, classic editorial gravitas.
- Interface and Body: Plus Jakarta Sans / Inter (Clean Modern Sans-Serif)
  - Usage: Navigation items, product titles, pricing, table headers, forms, button labels.
  - Characteristics: High legibility at small scale, neutral geometry, clear numeric tabular lining.

### 3.2 Scale and Hierarchy

| Level | Size (Desktop / Mobile) | Weight | Tracking | Application |
| :--- | :--- | :--- | :--- | :--- |
| Display 1 | 56px / 36px | Light (300) | -0.02em | Hero headline, major collection titles |
| Display 2 | 40px / 28px | Regular (400) | -0.01em | Category section headers, lookbook features |
| Heading 1 | 28px / 24px | Medium (500) | Normal | Product detail titles, admin section headers |
| Heading 2 | 20px / 18px | SemiBold (600) | Normal | Card titles, modal titles, cart group headers |
| Subhead | 16px / 15px | Medium (500) | +0.02em | Filter group titles, table column headers |
| Body Regular | 15px / 14px | Normal (400) | Normal | Product descriptions, terms, help text |
| Meta / Label | 12px / 11px | Medium (500) | +0.05em | Uppercase badges, SKU numbers, breadcrumbs |
| Price Display | 18px / 16px | SemiBold (600) | Normal | Tabular numbers, checkout totals, cart prices |

---

## 4. Layout, Grid, and Spacing Principles

### 4.1 Grid System
- Maximum Content Width: `1400px` for desktop layouts, providing generous margins.
- Column Structure: 12-column grid on desktop, 6-column grid on tablet, 2-column or 1-column grid on mobile screens.
- Baseline Spacing: 8px grid increment system (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`, `128px`).

### 4.2 Editorial Whitespace
- Generous padding around editorial photography prevents visual clutter.
- Asymmetrical arrangements in lookbook and collection highlights create visual rhythm.
- Standard product listing grids maintain strict vertical alignment with generous gaps (`gap-6` to `gap-8`) to give each garment breathing room.

---

## 5. Imagery and Photography Standards

### 5.1 Garment Photography
- Composition: Natural posture, clean neutral backgrounds matching the Warm Ivory or White palette.
- Aspect Ratios:
  - Product Card / Catalog: `3:4` vertical portrait ratio (`750x1000px`).
  - Editorial Hero / Lookbook: `16:9` widescreen or `4:5` large portrait banner.
  - Thumbnail / Cart Preview: `1:1` square or `3:4` scaled portrait.
- Lighting: Soft, diffused daylight highlighting textile textures, weave, drape, and stitch details.

### 5.2 Responsive Media Delivery
- Delivery powered by ImageKit transformations with automatic WebP/AVIF format negotiation.
- Precise `srcset` generation for high-DPI smartphone displays.
- Descriptive `alt` attributes detailing garment type, color, and cut for accessibility.

---

## 6. Interaction and Motion Design

Animations in HILAARA serve functional comprehension rather than pure decoration. They convey physical presence, state changes, and tactile feedback.

### 6.1 Core Interaction Behaviors
- Navigation Bar: Smooth background transition from transparent to solid ivory upon scroll offset.
- Product Hover: Subtle image switch to secondary alternate view (e.g., detail crop or back angle) with a soft 300ms ease-out transition.
- Slide Drawers (Cart, Mobile Nav, Filter Sheet): Silky spring-based drawer slide with backdrop fade.
- Buttons and Selectors: Immediate press scale feedback (`scale-98`) and border transition.
- Quantity and Variant Toggles: Smooth active pill highlight animation.

### 6.2 Accessibility and Performance
- Full respect for `prefers-reduced-motion` media query by disabling position translations and relying on gentle opacity fades.
- No floating cursor particles, no parallax lag, and no scroll-jacking effects.
