---
name: noore-visual-audit
description: High-fidelity visual verification of NOORE pages and interaction states against images in reference/. Use when implementing, reviewing, or correcting NOORE layouts, responsive behavior, navigation, drawers, grids, checkout, or footer composition.
---

# NOORE Visual Audit

Audit implementation fidelity without replacing NOORE's reusable design system or modifying `reference/`.

## Workflow

1. Read the applicable reference image and inspect the implementation before changing code.
2. Read the relevant Next.js guide under `node_modules/next/dist/docs/` before writing Next.js code.
3. Run the app and use Playwright at both `1440x900` and `390x844`. Capture the same page state as the reference, including menus, drawers, selections, and checkout steps.
4. Compare page structure, section order, spacing, alignment, type scale, image proportions and crop, container widths, whitespace, hierarchy, responsive behavior, overflow, navigation states, product grids, checkout layouts, and footer composition.
5. Record concrete differences and identify their root cause in layout structure, shared tokens, container logic, typography, media behavior, state, or breakpoint rules.
6. Make the smallest architectural correction that resolves the cause across affected views.
7. Re-capture both viewports, check horizontal overflow, and repeat until the important differences are resolved.

## Reference Map

Use the matching file from `reference/`:

- `01-home-page.png`
- `02-product-detail-page.png`
- `03-cart-drawer.png`
- `04-checkout-information.png`
- `05-checkout-shipping.png`
- `06-checkout-payment.png`
- `07-order-confirmation.png`
- `08-shop-catalog.png`
- `09-category-abayas.png`
- `10-search-results.png`
- `11-wishlist.png`
- `12-footer.png`
- `13-mobile-menu.png`

Treat references as authority for composition, hierarchy, proportions, spacing, and responsive intent—not as permission to duplicate markup or abandon shared components and tokens.

## Correction Rules

- Diagnose before editing; explain the root cause in the audit result.
- Prefer shared container, grid, typography, media, and state corrections.
- Do not accumulate arbitrary negative margins, unexplained transforms, excessive absolute positioning, breakpoint-only patches, or duplicate responsive layouts.
- Preserve semantic structure, usability, accessibility, and ecommerce behavior.
- Do not alter reference images.

## Audit Output

Report viewport and state tested, major mismatches, root causes, corrections made, remaining deltas, overflow result, and relevant screenshots or traces.
