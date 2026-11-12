# HILAARA Store - Logo and Brand Assets

## 1. Identity Concept and Philosophy

The name **HILAARA** is rooted in grace, prominence, and radiance. The brand identity balances architectural structure with refined textile craftsmanship.

Rather than relying on generic fashion tropes such as coat hangers, shopping bags, or computer-generated needle motifs, the HILAARA logo identity is an original, bespoke typographic wordmark paired with an architectural monogram symbol.

### 1.1 The Monogram Symbol: The Architectural "H"
The standalone mark is constructed from two vertical pillars connected by an elevated, curved arch. This arch subtly evokes both the refined drape of fine textiles and the classic arches found in historic Somali coastal architecture (such as the historic stone buildings of coastal Mogadishu and Zeila).
- Proportions: 1:1 square bounding box with harmonious stroke weights.
- Visual Balance: Symmetrical outer geometry with smooth internal radii.
- Scalability: Remains sharp and instantly identifiable whether displayed as a 16x16 pixel favicon or an embossed garment label.

### 1.2 The Typographic Wordmark
The HILAARA wordmark features custom-proportioned geometric capitals characterized by:
- Balanced Letterforms: Wide, open "A"s with elevated crossbars reflecting the central arch of the "H".
- Spacing: Generous letter-spacing (tracking +0.15em) that creates an airy, luxurious rhythm.
- Optical Corrections: Subtle tapered terminals that retain crispness at small digital scales.

---

## 2. Brand Asset Directory Structure

All vector and raster brand assets reside in the public directory to ensure seamless delivery across storefront, admin console, and meta tags:

```text
public/
└── brand/
    ├── hilaara-logo-dark.svg         # Primary charcoal wordmark on transparent
    ├── hilaara-logo-light.svg        # Pure white wordmark on transparent
    ├── hilaara-logo-olive.svg        # Muted olive wordmark variant
    ├── hilaara-mark-dark.svg         # Standalone monogram symbol in charcoal
    ├── hilaara-mark-light.svg        # Standalone monogram symbol in white
    ├── hilaara-lockup-horizontal.svg # Monogram + Wordmark horizontal combo
    ├── hilaara-lockup-vertical.svg   # Monogram + Wordmark stacked editorial lockup
    ├── favicon.svg                   # Crisp vector browser favicon
    ├── favicon-32x32.png             # Standard browser favicon
    ├── apple-touch-icon.png          # iOS home screen icon (180x180)
    └── og-image.png                  # Open Graph social preview (1200x630)
```

---

## 3. Specifications, Clear Space, and Minimum Sizes

### 3.1 Clear Space Rules
To preserve visual impact and authority, the HILAARA wordmark and monogram must always be surrounded by clear space free of other typography, borders, or competing imagery.
- Clear Space Value: Measured as "X", where "X" equals the vertical height of the capital letter "H" in the wordmark.
- On all four sides, no graphics, edges, or text may intrude within distance X.

### 3.2 Minimum Dimensions
To ensure legibility across all viewport resolutions:
- Primary Wordmark: Minimum width of `90px` in digital screen applications; `25mm` in physical print.
- Horizontal Lockup: Minimum width of `120px` in digital screen applications.
- Monogram Symbol: Minimum width of `18px` in digital screen applications (or `16px` specifically within browser favicon tabs).

---

## 4. Color Variants and Permitted Applications

| Logo Variant | Graphic File | Background Requirement | Application Context |
| :--- | :--- | :--- | :--- |
| Charcoal on Ivory | `hilaara-logo-dark.svg` | Warm Ivory (`#F7F5EF`) or White | Default storefront header, shopping bag drawer |
| Pure White | `hilaara-logo-light.svg` | Charcoal (`#191A17`) or dark photography | Editorial hero banners, dark footer, admin sidebar |
| Muted Olive | `hilaara-logo-olive.svg` | Warm Ivory or Soft Beige | Specialty packaging tags, order confirmation banners |
| Standalone Mark Dark | `hilaara-mark-dark.svg` | Warm Ivory or White | App header badge, mobile header compact state |
| Standalone Mark Light | `hilaara-mark-light.svg` | Charcoal or Dark backgrounds | Admin collapsed sidebar, dark theme touchpoints |

---

## 5. Prohibited Alterations

To maintain brand integrity:
- Do not stretch, distort, or compress the proportions of the letterforms or monogram.
- Do not apply drop shadows, 3D extrusions, or outer glows.
- Do not outline the letterforms with borders.
- Do not place the dark logo over low-contrast or cluttered photography without an underlay.
- Do not rotate the monogram or wordmark at arbitrary angles.
- Do not alter the relative scale between the monogram and the wordmark in locked-up assets.

---

## 6. Implementation Across Application Touchpoints

1. Storefront Desktop Header: Primary charcoal wordmark (`hilaara-logo-dark.svg`), height `24px`.
2. Storefront Mobile Header: Horizontal lockup or standalone monogram (`hilaara-mark-dark.svg`), height `22px`.
3. Storefront Footer: Vertical lockup with light wordmark (`hilaara-logo-light.svg`) over charcoal background.
4. Admin Sidebar: Monogram plus refined "Admin" descriptor in light palette.
5. Favicon: Optimized vector SVG and 32x32 PNG derived from `hilaara-mark-dark.svg`.
6. Order Invoices and Confirmation Slips: Crisp black-and-white vector rendering of horizontal lockup.
