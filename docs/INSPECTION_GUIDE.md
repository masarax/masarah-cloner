# Website Reverse Engineering & Inspection Guide

This guide details the methodology for reverse-engineering layout grids, radius, effects, and typography perfectly from any live website.

---

## 📐 Layout Grids and Spacing
- **Inspect Padding and Margins**: Run `getComputedStyle(element)` to get the exact `px` values. Avoid using approximate Tailwind layout margins (like `my-8` if the padding is `32px` but the margins are custom).
- **Flexbox and CSS Grid**: Identify grid structures:
  - `grid-template-columns` (e.g. `repeat(3, 1fr)`)
  - `gap` spacing between columns and rows.
- **Z-Index Layering**: Document the `z-index` properties on sticky banners, headers, navigation pills, and absolute overlay images to avoid visual clipping.

---

## 🎨 Radius and Effects
- **Border Radius**: Match exact border radius definitions (e.g., `border-radius: 16px` vs Tailwind `rounded-2xl`).
- **Box Shadows**: Capture multi-layer shadow details, transparency keys, and blurs.
- **Backdrop Filters**: Harvester styles utilizing `backdrop-filter: blur(12px)` for premium glassmorphism layouts.

---

## ✍️ Typography & Line Heights
- **Font Face Definitions**: Locate all font file sources (WOFF2/WOFF). Update standard style setups to load them.
- **Line Heights**: Mismatched line heights break layouts by wrapping text differently. Always capture the computed `line-height` value along with `font-size`.
- **Letter Spacing**: Ensure precise kerning properties (e.g. `letter-spacing: -0.02em`) are emulated.

---

## 🔄 Dynamic State Capture
- **Hover Transitions**: Record hover changes and transition animations (`transition: all 0.2s cubic-bezier(...)`).
- **Scroll Events**: Track how elements shrink, fade, or position themselves on scroll.
- **Active States**: Cycle through interactive UI segments (tabs, paginations, collapse accordions) to download files and verify designs for all states.
