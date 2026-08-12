# NOORE Master Implementation Specification

Status: implementation contract; pages are not yet authorized for construction.  
Scope: the complete NOORE storefront represented by `reference/01`–`13`, plus the routes and quality requirements below.  
Authority order: explicit user requirements → matching reference image → this shared specification → implementation judgment. Where a reference conflicts with accessibility or functional ecommerce behavior, preserve its visual intent while using the accessible behavior defined here.

## 1. Product direction and source of truth

NOORE is a warm, editorial modest-fashion storefront: restrained, spacious, tactile, and product-led. It must not look like a generic SaaS application or a grid of floating cards. The reference images are composition authorities for section order, proportion, hierarchy, whitespace, crops, and interaction state. Their sample product photography and content must be represented through replaceable data rather than embedded in layout code.

The homepage hero is protected: warm ivory, cinematic architecture and fabric, copy on the left and model/image on the right, with `YOU.` in crimson. On mobile the copy may move above the model within one art-directed hero, but the message, visual hierarchy, and model-forward composition remain intact.

Target locale shown in the references: Pakistan, `PKR`, English. Make currency, region, copy, contact details, shipping threshold, and policy durations configurable.

## 2. Design system

### 2.1 Color tokens

Treat the values below as implementation starting tokens; calibrate them against rendered references during visual QA. Never scatter raw hex values through components.

| Token | Value | Use |
|---|---:|---|
| `canvas` | `#F7F2EA` | primary warm ivory page background |
| `surface` | `#FCF9F4` | controls and subtly lifted regions |
| `surface-muted` | `#EFE8DE` | summaries, trust strips, subdued bands |
| `ink` | `#121212` | primary text, header/footer black |
| `ink-muted` | `#625D57` | secondary text only when contrast passes |
| `crimson` | `#8F1020` | `YOU.`, active state, primary commerce CTA |
| `crimson-hover` | `#74101B` | CTA hover/pressed tone |
| `line` | `#D8D0C5` | quiet rules, input and card boundaries |
| `success` | `#236B35` | stock/success messaging plus text/icon |
| `error` | `#A11B24` | validation/destructive state plus text/icon |
| `focus` | `#2563EB` | accessible focus ring; may be paired with ivory offset |
| `white` | `#FFFFFF` | on dark controls and image overlays |

Normal text must reach 4.5:1 contrast, large text and meaningful graphic boundaries 3:1. Crimson is an accent and interaction color, not a body-copy color unless verified. No dark mode is in scope.

### 2.2 Typography

- Use one high-contrast editorial serif for wordmark, display headings, and select section titles, and one clean sans serif for navigation, product metadata, forms, price, and body copy. The references suggest a Didone-like display face. Final font files/licensing are unresolved; prefer `next/font/local` once approved assets exist, otherwise choose the closest licensed variable pair and document it before implementation.
- Provisional fallback stacks: display `"Times New Roman", Times, serif`; body `Arial, Helvetica, sans-serif`. Do not let fallbacks become the silent final selection.
- Desktop scale: display hero `clamp(3rem, 4.2vw, 5rem)` / 0.95–1.05; page H1 36–48 / 1.05; section H2 24–32 / 1.15; H3 18–22 / 1.25; body 16 / 1.5; metadata 12–14 / 1.4; utility labels 11–13 / 1.2 with restrained tracking.
- Mobile: hero 36–46; page H1 30–36; section H2 22–28; body remains at least 16 for forms and essential copy. Do not shrink functional labels below 12.
- Use sentence/title case as pictured. All-caps is limited to navigation, utility labels, and compact CTAs; tracking must remain readable.

### 2.3 Spacing, containers, borders, elevation

- Base unit: 4px. Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`.
- Storefront max width: 1440px composition with a 1280–1360px content container; desktop gutters 40–64px. Checkout content may use a tighter 1280px frame. Mobile gutters 16px; never below 12px.
- Section rhythm: 80–128px desktop, 48–72px mobile; internal gaps use the scale, not arbitrary values.
- Borders: mostly 1px `line`; radii 0–4px for inputs/buttons/cards, 50% only for swatches/dots/icon circles. Avoid pill-heavy styling.
- Shadows are rare and quiet: overlays/drawers may use a broad low-opacity black shadow. Product cards remain flat; hierarchy comes from imagery, spacing, rules, and typography.
- Reserve exact image aspect ratios. Product grid media is predominantly portrait (about 4:5); editorial/world tiles follow the reference crop.

### 2.4 Buttons and controls

- Primary: solid crimson, white uppercase label, rectangular, 44px minimum height; dark/black is allowed for homepage editorial CTA where referenced.
- Secondary: transparent or ivory with 1px ink/crimson border; no unnecessary filled cards.
- Tertiary: text link with arrow/underline and 44px effective target.
- Icon button: real SVG icon, at least 44×44 target, accessible name, visible hover/focus/pressed state. Do not use emoji.
- Disabled: visibly distinct while retaining readable contrast; use native disabled semantics.
- Inputs/selects: visible persistent label, 44–48px minimum control height, quiet square border, clear focus/error/help states. Placeholder never substitutes for a label.

### 2.5 Cards and icons

- `ProductCard` is flat: image, optional badge, wishlist control, title, variant/color name, price, optional swatches/rating. Image owns the visual weight; no decorative container shadow.
- Editorial category cards may place serif labels and small arrows over imagery using a contrast-protecting scrim.
- Summary/trust cards use rules or muted surfaces, not rounded floating panels.
- Use a single consistent outline SVG icon family or project-owned SVGs. Standardize 16/20/24px glyph sizes and 1.5–2px strokes. Payment marks use approved brand assets.

### 2.6 Responsive rules

Use content-driven CSS breakpoints, provisionally: `sm 480`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1440`. QA at 320, 375, 390, 768, 1024, 1280, and 1440 widths; primary visual comparisons are 1440×900 and 390×844.

- Desktop (≥1024): announcement bar; full wordmark/nav/action header; multi-column editorial and product layouts; persistent catalog filter rail; two-column PDP and checkout; full footer columns.
- Tablet (768–1023): compact header, reduced grids/gaps, drawer filters, stacked or balanced two-column layouts as space permits.
- Mobile (<768): announcement bar; menu/wordmark/search/cart header; navigation drawer; two-column catalog grid where 390px permits; filter/sort controls above results; stacked PDP; checkout form before collapsible order summary; footer accordions.
- Maintain DOM/content order across breakpoints where possible. Never create conflicting desktop/mobile copies of forms or primary content. No horizontal page overflow at 320px.

## 3. Reference map

| Reference | Page/state contract |
|---|---|
| `01-home-page.png` | `/`; desktop and mobile full homepage: announcement/header, protected hero, worlds/categories, signature products, trust strip, new arrivals, press marks, newsletter, footer |
| `02-product-detail-page.png` | `/product/[slug]`; desktop two-column gallery/details and mobile stacked PDP, reviews, complete-the-look, discovery tiles |
| `03-cart-drawer.png` | modal cart drawer over PDP/storefront; item rows, quantity/remove state, subtotal, benefits, checkout and continue-shopping actions |
| `04-checkout-information.png` | `/checkout/information`; step 1, contact/address form and order summary |
| `05-checkout-shipping.png` | `/checkout/shipping`; step 2, saved address summary and shipping-method selection |
| `06-checkout-payment.png` | `/checkout/payment`; step 3, payment-method fields, billing choice, final review CTA |
| `07-order-confirmation.png` | `/order-confirmation/[orderId]` preferred; thank-you/success, order summary, delivery/help/trust content |
| `08-shop-catalog.png` | `/shop/all`; View All catalog, category/size/price/material/occasion filters, sort, pagination/load-more responsive states |
| `09-category-abayas.png` | `/shop/abayas`; category listing using catalog shell with Abayas context/preselection |
| `10-search-results.png` | `/search?q=…`; populated search results with query, filtering, sorting, and results grid |
| `11-wishlist.png` | `/wishlist`; saved grid, selection/actions, summary/benefits, empty-state requirement |
| `12-footer.png` | shared global footer desktop columns and mobile accordions, newsletter, social/payment/policy rows |
| `13-mobile-menu.png` | global navigation drawer open state at desktop and mobile widths, backdrop, account/wishlist/cart/support/social links |

## 4. Route and state architecture

| Route/state | Purpose |
|---|---|
| `/` | homepage |
| `/about` | brand story; no direct reference, use design system and shared editorial primitives without inventing a reference-breaking layout |
| `/shop` | curated current/new products landing; default commerce entry, not a duplicate hard-coded catalog |
| `/shop/all` | all products / “View All” catalog |
| `/shop/abayas` | Abayas category |
| `/shop/hijabs` | Hijabs category using shared category template |
| `/shop/chadars` | Chadars category using shared category template |
| `/product/[slug]` | product detail, statically addressable by product slug |
| `/search?q={query}` | deep-linkable search; URL owns query, sort, page, and filter state where meaningful |
| `/wishlist` | persistent saved products |
| cart drawer | global intercepted/modal UI state; opening should not destroy the underlying page or back-button expectations |
| `/checkout/information` | checkout step 1 |
| `/checkout/shipping` | checkout step 2; redirect to information if required data is missing |
| `/checkout/payment` | checkout step 3; redirect to earliest incomplete step |
| `/order-confirmation/[orderId]` | immutable completion state; do not expose sensitive order data through guessable IDs |

Canonicalize category URLs and preserve useful catalog query state (`sort`, `page`, material, size, price, occasion). There is no catalog color filter. Product color shown on cards is informational/variant preview; actual color selection belongs to PDP.

Required non-reference states: loading/skeleton with reserved dimensions, empty catalog/search/wishlist/cart, no search results, product unavailable, selector validation, form validation, payment failure/retry, network error, and confirmation refresh/revisit.

## 5. Homepage

Build in the exact reference sequence:

1. Shipping announcement and global header.
2. Protected hero: editorial architecture/fabric backdrop; copy left and model right on desktop; `MODESTY. ELEGANCE. YOU.` with crimson `YOU.`; brief supporting copy, black `SHOP NOW`, subtle scroll cue.
3. “Explore Our Worlds”: four image-led categories (Abayas, Hijabs, Chadars, Collections); desktop rectangular editorial tiles, mobile circular crops as pictured.
4. “Signature Collection”: product carousel/grid with View All and pagination indicators on mobile.
5. Trust/value strip: shipping, returns, secure payment, customer support.
6. “New Arrivals”: product carousel/grid.
7. “As Seen In”: restrained monochrome publication marks; only use marks the brand is authorized to claim.
8. Newsletter/editorial still life: split desktop, stacked mobile.
9. Shared footer.

Hero asset requirements: art-directed desktop/mobile sources, explicit focal position, replaceable data, meaningful alt if the model/image communicates product/brand content. Do not render important headline copy into the bitmap.

## 6. Shop architecture

- `/shop` surfaces current/new products and category entry points; `/shop/all` is the exhaustive catalog.
- Shop navigation hierarchy: View All, Abayas, Hijabs, Chadars. “Collections” and “New In” may remain secondary merchandising destinations only if later content/routes are approved.
- Desktop catalog: page title, result count, left filter rail, sort at upper right, 4-column product grid, pagination. Mobile: title; filter and sort buttons; result count; 2-column grid; Load More as referenced. Choose one canonical pagination data model and make Load More progressively append while preserving URL/history.
- Filters: category (on View All), size, price, material, occasion. Do not add color. Filter drawer on mobile is modal and applies/clears explicitly; show active-filter count and removable chips where space permits without changing the reference hierarchy.
- Product lists derive from one normalized product data source. Cards may display available color swatches but swatch changes must not silently alter cart state.

## 7. Product detail

Follow `02`: breadcrumbs; desktop thumbnail rail + primary image beside details; mobile primary gallery then thumbnails; product name, collection, price, description; product-specific color and size groups; size guide; quantity; stock; trust claims; wishlist; Add to Bag; accordions; reviews; complete-the-look; category/related discovery.

Data contract, conceptually:

- Product: stable id, slug, name, category/collection, copy, price/currency, media with width/height/alt/focal point, badges, rating/review count, accordion content, related ids, look ids.
- Variant: stable id/SKU, product id, color id/name/value/media, size id/label, stock/availability, optional price override.
- Selection must resolve to a purchasable variant before Add to Bag. Unavailable combinations are disabled and announced; errors identify the missing selection. Do not rely on swatch color alone—every swatch has a visible/accessible name and selected/unavailable state.
- Gallery supports thumbnail selection, arrow keys where appropriate, touch swipe without trapping page scroll, and optional zoom that remains keyboard/touch accessible.
- Add to Bag adds the resolved variant, announces success, and opens the cart drawer. Wishlist is reversible and announced without noisy live regions.
- Accordions: Description, Fabric & Material, Care, Shipping & Returns. Reviews show aggregate, distribution, entries, and View All; complete-the-look uses addable linked products only when product/variant selection is unambiguous.

## 8. Cart and checkout flow

`PDP → Add to Bag → Cart Drawer → Checkout Information → Shipping → Payment → Order Confirmation`.

### Cart drawer

Right-side sheet on desktop and near/full-width sheet on mobile, with backdrop. Show line-item image, name, chosen color/size, price, quantity controls, remove, subtotal, relevant trust benefits, Checkout, View Bag if retained, and Continue Shopping. Quantity and removal update totals in place and are announced. Empty state keeps a clear return-to-shop action.

It is a modal dialog: accessible name, initial focus (close or heading), focus containment, Escape close, backdrop close only when it cannot cause accidental loss, background inert/scroll locked, and trigger focus restoration.

### Checkout

- Shared progress stepper: Information, Shipping, Payment, Review/confirmation intent. The references show four indicators but only three editable route pages; treat the fourth as review/completion, not an undocumented extra form route.
- Information: email/marketing consent, full address and phone, country/province/postal fields, save-information consent, validation, order summary.
- Shipping: immutable/editable contact/address summary, available delivery methods with price and timing, back and continue controls.
- Payment: method choice, card or provider-specific fields, billing-address choice, transparent total, final order action. Sensitive payment data must be handled by a compliant provider; never store raw card details.
- Confirmation: order reference, thank-you status, email/next steps, order and delivery summary, continue-shopping/account support. Refresh must not resubmit payment.
- Desktop order summary is adjacent and sticky only if it never obscures content; mobile summary is collapsible after the primary form and must remain accessible. Persist entered data between steps; guard steps without trapping users.
- Each submission has pending, error, retry, and duplicate-submit protection. Focus the first invalid field or an error summary linked to fields; preserve entered values.

## 9. Motion system

Motion is restrained, cinematic, and subordinate to shopping. Start with CSS transforms/transitions and Intersection Observer. Add no animation dependency until an implemented sequence proves CSS insufficient; GSAP/ScrollTrigger is reserved for the one or two advanced storytelling moments that genuinely require scroll orchestration. No Three.js.

| Pattern | Where | Contract |
|---|---|---|
| Sequential initial entrance | homepage hero; lighter version on page headings/PDP | announcement/header already usable, then eyebrow/headline, crimson accent, copy, CTA, visual/details; total sequence feels complete in ~700–1100ms, no interaction blocking |
| Scroll reveal | homepage headings/media, PDP lower sections, footer/newsletter | once per meaningful group; opacity + 8–24px translation, 350–600ms, ease-out; content visible without JS |
| Pinned storytelling | at most one homepage editorial/hero transition if the final assets support it | deterministic height, natural release, desktop only by default; remove pin on mobile/reduced motion |
| Parallax | hero architecture/fabric or one editorial still-life layer | imagery/decor only, clipped, 5–12% travel; never body text or controls |
| Mask/clip reveal | hero model/image and selected editorial category imagery | reveal crop without distorting photography; use sparingly |
| Stagger | 4-category worlds, first visible product row, trust icons | 30–80ms between meaningful siblings; cap the group so late items do not lag |
| Scroll-linked transforms | one story-bearing visual transition | transform/opacity only, small travel/scale, native scroll retained; no catalog/checkout scrub effects |
| Smooth section transitions | homepage ivory/photographic/dark-footer handoffs | controlled overlap, background transition, or image expansion; no scroll hijacking |
| Microinteraction | buttons, arrows, wishlist, swatches, selectors, accordions, drawer | 150–250ms, restrained opacity/color/translate; no bounce or gratuitous scale |

Reduced motion exposes final content immediately, removes parallax/scrub/pinning/large translations, and retains only minimal state feedback. Mobile uses shorter distances, fewer layers, and no expensive pinned sequences. Clean up all observers/listeners/timelines on unmount and resize.

## 10. Accessibility contract

- Semantic landmarks: announcement region as appropriate, one header/nav, `main`, labeled complementary filter/order-summary regions, and footer. One logical H1 and sequential headings.
- Provide a visible-on-focus skip link. DOM and tab order follow reading order. Never remove focus outlines; use the shared high-contrast focus token with offset.
- All functionality works by keyboard. Targets are approximately 44×44px with adequate separation. Hover is never the only disclosure.
- Drawers/dialogs follow the modal behavior defined above. Navigation drawer exposes its label and open state, closes via Escape, restores trigger focus, and makes the background inert.
- Menus/accordions use buttons, `aria-expanded`, and controlled-region relationships. Hidden panels contain no reachable focus targets.
- Product color and size groups use fieldset/legend or equivalent group semantics; options expose label, selected, unavailable, stock/error state beyond color.
- Forms have persistent labels, autocomplete/input mode, required indication, linked help/error text, error summary for long checkout forms, and polite status announcements. Marketing and save-information consent are never preselected without approval.
- Cart/wishlist/async updates use concise polite announcements. Confirmation status is announced once. Loading controls expose busy state.
- Meaningful images have specific alt text; decorative texture/architecture is empty-alt. Icon-only buttons are named. Brand/publication marks have appropriate text alternatives.
- Support 200% zoom, reflow at 320px, orientation change, and text enlargement without clipped controls. Test contrast across default/hover/focus/disabled/error/selected states.
- `prefers-reduced-motion` behavior is mandatory as specified in Motion. Automated checks supplement—not replace—keyboard, focus, zoom, and screen-reader/manual testing.

## 11. Performance contract

- Next.js 16.3/React 19: read the applicable local guide in `node_modules/next/dist/docs/` immediately before framework implementation because APIs may differ. Server Components are the default; client boundaries are narrow islands for navigation/cart drawers, selectors/gallery, filters, wishlist, checkout interaction, and motion observers.
- Use current `next/image` guidance with known dimensions/aspect ratios and accurate `sizes`; art-direct hero sources; prioritize only the actual viewport LCP image. Lazy-load below-fold product/editorial media. Prefer AVIF/WebP delivery while retaining a replaceable source asset pipeline.
- Product image data owns `src`, dimensions/aspect, alt, focal position, and variant association. Layout code never depends on a final filename.
- Use `next/font/local` or the version-correct equivalent for approved fonts; minimize families, subsets, and weight files; reserve metrics to prevent shift.
- Render useful HTML on the server; do not fetch initial catalog/PDP content in `useEffect`. Keep catalog query/filtering URL-driven and server-compatible. Dynamically load optional zoom, advanced reviews, or advanced motion only when used.
- Avoid persistent animation loops, layout-property animation, per-card scroll listeners, excess `will-change`, and simultaneous moving layers. Batch observers and pause/remove offscreen work.
- Reserve space for images, banners, validation, summaries, and async rows. Drawers overlay without shifting the page.
- Initial budgets: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms at the 75th percentile on representative mobile traffic; Lighthouse lab targets are diagnostic, not substitutes. Aim for ≤170KB gzipped route JS on primary storefront routes and materially less on checkout; exceptions require a measured rationale.
- Measure before claiming improvement: comparable viewport/device/network, LCP element, CLS sources, INP/long tasks, JS execution/hydration, resource waterfall, fonts, image bytes, and route bundles. Test mid-tier mobile, not desktop only.

## 12. Component and data architecture

Suggested boundaries (names are descriptive, not mandatory filenames):

- Layout: `RootShell`, `AnnouncementBar`, `SiteHeader`, `DesktopNav`, `MobileNavDrawer`, `PageContainer`, `Section`, `TrustStrip`, `SiteFooter`, `NewsletterSignup`.
- Primitives: `Button`, `IconButton`, `TextLink`, `Field`, `Select`, `Checkbox`, `RadioGroup`, `QuantityStepper`, `Price`, `Badge`, `Accordion`, `Dialog`, `Drawer`, `VisuallyHidden`, `LiveStatus`.
- Commerce: `ProductCard`, `ProductGrid`, `ProductCarousel`, `ProductGallery`, `VariantSelector`, `SizeGuideDialog`, `WishlistButton`, `AddToBag`, `RatingSummary`, `ReviewList`, `CompleteTheLook`, `CategoryDiscovery`.
- Catalog: `CatalogShell`, `CatalogToolbar`, `FilterPanel`, `FilterDrawer`, `ActiveFilters`, `SortControl`, `Pagination`/`LoadMore` over one paging model, `SearchSummary`, `EmptyResults`.
- Cart/checkout: `CartProvider` or smallest equivalent client store, `CartDrawer`, `CartLine`, `OrderSummary`, `CheckoutStepper`, `ContactForm`, `AddressForm`, `ShippingMethodGroup`, `PaymentMethodGroup`, `BillingAddress`, `CheckoutActions`, `ConfirmationSummary`.
- Motion: `Reveal`, `StaggerGroup`, `MaskedMedia`, `ParallaxMedia`, `StickyStory` only if approved, and a shared reduced-motion hook/media-query utility. Primitives must have static server-rendered end states.
- Data: `Product`, `Variant`, `ProductMedia`, `Category`, `Collection`, `Money`, `Review`, `Cart`, `CartLine`, `Address`, `ShippingMethod`, `CheckoutSession`, `Order`. Validate data at boundaries. Derive cards, PDP, cart, wishlist, search, and checkout from these models rather than duplicating product literals.

Keep server data access separate from display components. Prefer composition/slots over page-specific forks. Shared tokens own container/grid/type/media behavior so visual corrections propagate rather than becoming breakpoint patches.

## 13. Visual verification and QA protocol

For every referenced page/state:

1. Open the matching reference and rendered state side by side.
2. Capture at 1440×900 and 390×844 with Playwright; additionally test 320, 768, and 1024 widths.
3. Match state (drawer open, selections, checkout step, query/filter state) before comparison.
4. Compare structure/order, container and grid geometry, spacing/alignment, typography, image ratio/crop/focal point, header/footer, controls, overflow, and responsive transformation.
5. Record the concrete delta and its root cause (token, container, grid, typography, media, state, breakpoint, or stacking context).
6. Correct the smallest shared architectural cause; do not accumulate negative margins, unexplained transforms, excess absolute positioning, duplicate responsive markup, or one-off breakpoint patches.
7. Re-capture both primary viewports, verify zero horizontal overflow, keyboard/focus behavior, reduced motion, and relevant loading/error/empty states.

The existing references are labeled as 1440px desktop and 390px mobile compositions even though the PNG files themselves are composite boards. Compare against the labeled inner frames, not the outer PNG dimensions.

## 14. Implementation order

This implementation order is authoritative for all future NOORE work.

### Static fidelity before advanced motion

For every page, first achieve accurate static layout, responsive composition, typography, spacing, and imagery against its reference. Only after that page passes visual verification should advanced motion be layered on top. Do not use animation to hide or compensate for layout problems.

### Phase 1 — Foundation + Global Shell

- Design tokens.
- Typography.
- Global CSS.
- Reusable UI primitives.
- Basic motion infrastructure.
- Announcement bar.
- Header.
- Mobile navigation.
- Footer.
- Root layout.

### Phase 2 — Homepage

- Build static visual fidelity first using `01-home-page.png`.
- Preserve the established NOORE hero direction.
- After static fidelity is verified, apply the NOORE cinematic motion system.

### Phase 3 — Shop + Categories

- `/shop`.
- `/shop/all`.
- `/shop/abayas`.
- `/shop/hijabs`.
- `/shop/chadars`.
- Reusable catalog, product-card, and filter architecture.

### Phase 4 — Product Detail

- Dynamic `/product/[slug]`.
- Gallery.
- Variants, colors, and sizes.
- Wishlist.
- Add to Bag.
- Reviews.
- Complete the Look.
- Related/category discovery.

### Phase 5 — Cart

- Cart state architecture.
- Cart Drawer.
- Quantity, remove, and subtotal behavior.
- PDP → Cart integration.

### Phase 6 — Search + Wishlist

- `/search`.
- `/wishlist`.
- Reuse the existing catalog and product architecture.

### Phase 7 — Checkout

Build in this order:

1. Information.
2. Shipping.
3. Payment.
4. Order Confirmation.

### Phase 8 — About

- Create the About page using the established NOORE visual language because no dedicated reference currently exists.

### Phase 9 — Advanced Motion + Visual Refinement

After static layouts are stable:

- Pinned storytelling.
- Layered 2.5D parallax.
- Image parallax.
- Masks and clip reveals.
- Floating compositions.
- Scroll-progress transforms.
- Morph sequences where explicitly appropriate.
- Path-following animation where explicitly appropriate.
- Cinematic section transitions.

Do not force advanced motion onto catalog, forms, or checkout.

### Phase 10 — Final QA + Optimization

- Complete reference visual audit.
- Desktop/mobile Playwright regression.
- Accessibility.
- Reduced motion.
- Performance and Core Web Vitals.
- Responsive edge cases.
- Console errors.
- Overflow.
- Dead code and duplication cleanup.
- Production build.

## 15. Protected rules

- Do not redesign reference layouts without explicit instruction.
- Do not add libraries until existing platform/CSS primitives are inspected and a concrete need is documented.
- Do not introduce generic SaaS, bento-dashboard, glassmorphism, excessive rounding, or card-heavy styling.
- Do not use Three.js/WebGL unless explicitly requested through a genuine 3D scope.
- Diagnose structural/root causes before CSS correction; fix shared tokens/layout/data/state first.
- Keep final product and editorial images replaceable through data, including dimensions, alt, focal point, and variant mapping.
- Do not encode reference-board labels (for example “DESKTOP (1440px)”) into the storefront.
- Do not fabricate reviews, press endorsements, shipping promises, discounts, stock, contact details, or policy claims as production truth.
- Do not start page implementation until this specification is approved.

## 16. Contradictions and missing information

### Contradictions/interpretations resolved by this spec

- The filenames and headings inside several boards use different sequence numbers (for example file `08` is labeled “07. Shop,” `13` is labeled “09. Mobile Menu,” and checkout information is labeled “03”). Filenames are the canonical map.
- The catalog references visibly include a Color accordion/swatches, while the explicit requirement says no catalog color filter. The explicit requirement wins: remove the color filter; card swatches may remain as product information, and color selection belongs on PDP.
- The homepage reference hero says “Modesty. Elegance. You.” while the menu background mock shows “Timeless Modesty.” The homepage’s protected headline is canonical for `/`; the menu merely overlays the current underlying page.
- Checkout boards show four progress points (Information, Shipping, Payment, Review) but only three editable checkout routes plus confirmation were requested. This spec treats Review as final review/completion intent and does not invent a fourth checkout form route.
- Desktop and mobile frames are placed together in composite PNGs; their outer image pixel dimensions are not target viewport sizes. The labels `1440px` and `390px` define visual intent.

### Missing or awaiting approval

- No reference exists for `/about`, `/shop` as a distinct current/new landing, Hijabs category, Chadars category, empty/error/loading states, authentication/account, standalone full cart page, or checkout failure states.
- Exact font family/files, weight set, licensing, master logo/SVG icons, social/payment assets, and authoritative color values are not supplied.
- Final product photography, variant/SKU inventory, descriptions, sizing, reviews, related/complete-the-look logic, and category/collection taxonomy are not supplied.
- Commerce backend, CMS/data source, search service, persistence rules, account model, payment provider, shipping/tax calculation, coupon rules, and order API are unspecified.
- “Collections” and “New In” appear in navigation/references but routes were not requested; decide whether they become routes, filtered catalog views, or are removed from primary navigation.
- Header account icon exists but account routes/scope are unspecified. Footer contact/policy copy and press logos may be placeholders and require brand/legal verification.
- The references demonstrate populated states only. Empty, loading, validation, network, out-of-stock, and payment failure states must follow this system and require content approval if bespoke messaging is desired.
