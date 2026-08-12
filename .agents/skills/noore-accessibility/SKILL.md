---
name: noore-accessibility
description: Audit and implement accessible NOORE ecommerce UI. Use for semantic structure, headings, keyboard and focus behavior, dialogs, drawers, menus, accordions, product selectors, forms, validation, screen readers, contrast, touch targets, and reduced motion.
---

# NOORE Accessibility

Make every ecommerce path operable, understandable, and robust without compromising NOORE's visual identity.

## Workflow

1. Inspect the rendered interaction and source semantics across desktop and mobile.
2. Read relevant Next.js documentation under `node_modules/next/dist/docs/` before framework-specific changes.
3. Test keyboard-only behavior and, where available, browser accessibility snapshots or a screen reader.
4. Identify the semantic or state-management root cause before patching presentation.
5. Apply the smallest reusable correction and re-test the complete interaction, including open, error, success, and close states.

## Required Checks

- Use semantic landmarks and controls; maintain one logical heading hierarchy and meaningful link/button names.
- Keep all actions keyboard accessible with a visible, high-contrast focus indicator and logical order.
- For dialogs and drawers, provide an accessible name, move focus inside on open, contain focus while modal, close with Escape where appropriate, prevent background interaction, and restore focus to the trigger.
- For menus and accordions, communicate expanded state, control relationships, and predictable keyboard behavior without hiding reachable focus targets.
- For product selectors, expose group labels, option names, selected, unavailable, and error states without relying only on color.
- Associate form labels, descriptions, required state, errors, and summaries programmatically. Move or announce focus thoughtfully after validation and preserve entered data.
- Announce important cart, wishlist, loading, and confirmation changes without noisy live regions.
- Maintain readable contrast in default, hover, focus, disabled, error, and selected states.
- Use touch targets around `44x44px` where appropriate and adequate spacing between adjacent actions.
- Preserve zoom, reflow, orientation support, and content order; detect horizontal overflow.

## Motion

Honor `prefers-reduced-motion`: remove parallax, scroll-linked transformations, large movement, and animation-dependent pinned sequences. Content and controls must be immediately available in a stable fallback. Never let animation block reading, focus, input, or completion.

## Output

Report affected user flows, severity, reproduction steps, root cause, standard or principle involved, fix, keyboard/focus results, reduced-motion result, and remaining limitations. Do not call an interaction accessible based only on automated checks.
