---
name: noore-performance
description: Audit and improve NOORE ecommerce performance while preserving visual fidelity. Use when building or reviewing pages, images, fonts, client boundaries, bundles, hydration, lazy loading, route splitting, Core Web Vitals, or cinematic motion cost.
---

# NOORE Performance

Protect fast ecommerce interactions without flattening the intended visual hierarchy.

## Workflow

1. Establish the page, viewport, network/device assumptions, and repeatable baseline.
2. Read relevant Next.js documentation in `node_modules/next/dist/docs/` before changing framework-specific code; this project uses a version with breaking changes.
3. Measure before optimizing. Audit LCP, CLS, INP, resource waterfalls, JavaScript execution, hydration, bundles, images, fonts, and animation work.
4. Identify the dominant root cause and make the smallest high-impact architectural correction.
5. Re-run the same measurement and report before/after evidence plus tradeoffs.

## Audit Priorities

- Keep LCP media discoverable, correctly sized, and prioritized only when it is truly the LCP candidate.
- Use current Next.js image guidance and `next/image` where appropriate; set dimensions or aspect ratio, responsive sizes, efficient formats, and intentional lazy loading.
- Load fonts without avoidable render blocking or layout shift; minimize families, weights, and subsets.
- Reserve stable space for media, drawers, notices, and async content to prevent CLS.
- Preserve responsive input handling and minimize main-thread blocking for INP.
- Keep components server-rendered unless browser state or APIs require a client boundary. Narrow client boundaries and avoid unnecessary hydration.
- Inspect route and component bundles; remove duplicate code, defer optional features, and use route-level or component-level splitting for expensive experiences.
- Avoid unnecessary JavaScript and third-party scripts. Do not add dependencies for effects CSS or existing primitives can handle.
- Lazy-load below-fold and optional content without delaying essential interaction or causing layout shift.

## Motion Budget

- Animate transforms and opacity, avoid layout thrashing, batch reads/writes, and limit simultaneously moving layers.
- Prefer event-driven or scroll-progress work over persistent render loops.
- Remove offscreen observers, listeners, and timelines; pause expensive work when hidden.
- Simplify motion on mobile and disable costly scroll-linked work for reduced motion.
- Escalate to GSAP or WebGL only when measured requirements justify their cost.

## Output

Report tools and conditions, baseline metrics, root causes ranked by impact, changes made, measured results, regressions checked, and unresolved risks. Never claim a Core Web Vital improvement without comparable evidence.
