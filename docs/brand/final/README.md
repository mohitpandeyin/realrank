# Realrank final brand kit

Production exports for the approved Realrank parcel-R and ascending-skyline mark.

## Recommended defaults

- Navbar: `svg/realrank-logo-horizontal.svg`
- General icon: `svg/realrank-icon.svg`
- Standalone name: `svg/realrank-wordmark.svg`
- Raster icon: `png/realrank-icon-master-1024.png`
- Small UI icon: `png/realrank-icon-64.png`
- Favicon: `favicon/favicon.ico`
- Apple touch icon: `favicon/apple-touch-icon.png`
- PWA icons: `favicon/android-chrome-192x192.png` and `favicon/android-chrome-512x512.png`
- Dark backgrounds: use the `-white` logo variants
- One-color printing: use the `-mono-dark` variants
- Print/layout software: use the matching files in `pdf/`

## Realrank product integration

- Use the horizontal SVG lockup in public and signed-in headers. Its viewBox includes generous clear space, so the current wireframes reserve a **188 × 47px** box on desktop and **172 × 43px** on narrow screens; the visible logo remains compact within that box.
- Use the micro icon for favicons and other browser surfaces below 32px. Do not shrink the detailed skyline icon into those sizes.
- Every linked logo needs the accessible name **Realrank home**; the image itself uses `alt="Realrank"`.
- Reserve the image's intrinsic 4:1 aspect ratio in markup to prevent layout shift.
- Keep the current product action hierarchy: terracotta remains the primary-action colour, while charcoal belongs to the identity mark and typography. Do not recolour the supplied logo with CSS.
- The working wireframe paths are relative to `docs/wireframes/`: `../brand/final/svg/realrank-logo-horizontal.svg` and `../brand/final/svg/realrank-icon-micro.svg`.

### Pre-production export check

The horizontal, stacked and standalone wordmark SVGs currently render the name with a live `<text>` element and the `Inter Tight, Inter, Arial` font stack. Before production launch, convert the wordmark glyphs to vector outlines or make the SVG self-contained with the approved font so the lettering cannot change on devices without Inter Tight. The icon-only SVGs are already path-based. Until the outlined export is available, the supplied high-resolution PNG/WebP lockups are the typography-stable fallback.

All SVG and primary PNG logo files have transparent backgrounds. The standard Apple touch and maskable icons intentionally use the warm-cream background because those platforms crop icons into different shapes. Transparent alternatives are included where appropriate.

## Responsive behavior

- `realrank-icon.svg` retains the skyline windows for normal display sizes.
- `realrank-icon-micro.svg` removes the tiny window islands for browser-tab and very small UI use.
- The 16 px and 32 px PNG/favicon exports automatically use the micro treatment.

## Brand colors

- Charcoal: `#20201E`
- Terracotta: `#C65D2E`
- Warm cream: `#F7F5F0`
- Monochrome ink: `#171A18`

## HTML favicon setup

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/realrank-icon-micro.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#20201E">
```

## Clear space

Keep clear space around the mark equal to at least one-half of the negative-space R stem width. Do not add a badge, `#1`, trophy or extra property symbol to the primary logo.

## Regeneration

The export script is `scripts/build_brand_assets.py`. It preserves exact brand colors, generates the transparent logo variants, creates the responsive micro icon and exports the favicon/platform matrix.
