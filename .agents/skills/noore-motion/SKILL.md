---
name: noore-motion
description: Implement and review NOORE's restrained cinematic motion language, including sequenced entrances, scroll reveals, stagger, sticky storytelling, parallax, masks, transitions, and microinteractions. Use for NOORE UI motion work unless genuine 3D is explicitly requested.
---

# NOORE Motion

Borrow animation principles and choreography only. Preserve NOORE's independent visual identity, branding, color, typography, content, and graphics.

## Plan Before Implementing

1. Read the page specification and existing layout.
2. Read the relevant Next.js guide under `node_modules/next/dist/docs/` before writing Next.js code.
3. Define the narrative sequence, static end state, trigger, duration or progress mapping, and desktop/mobile/reduced-motion behavior.
4. Choose the lowest-cost sufficient technique: CSS transforms/transitions, Framer Motion if already justified and available, Intersection Observer, CSS sticky, SVG, then GSAP with ScrollTrigger only for genuinely advanced choreography. Use WebGL only for true 3D and only through explicit `$noore-3d-motion` work.
5. Implement with reusable primitives and verify performance, accessibility, cleanup, resize behavior, and touch responsiveness.

Do not install an animation library casually. Inspect existing dependencies and prove the need first.

## Motion Language

### Entrances and reveals

- Sequence the first frame deliberately: announcement/header, eyebrow, primary heading, accent or secondary heading, copy, primary CTA, secondary CTA, main visual, then details.
- Keep the sequence controlled but fast enough for immediate use.
- Reveal below-fold content on intersection, normally once, with restrained opacity, translation, scale, masks, or clip paths.
- Stagger meaningful groups such as eyebrow, heading, copy, imagery or product items; do not animate everything together.
- Prefer editorial masks and clipped reveals when they improve hierarchy over a generic fade.

### Scroll choreography and depth

- Reserve pinned or sticky storytelling for important moments. Keep native scrolling predictable and let the section release naturally.
- For 2.5D depth, layer background, restrained oversized type, image or architecture, model or product, foreground details, and text. Use small differences in translate, scale, perspective, and transform origin.
- Move editorial photography subtly inside a clipped container; never distort it or use aggressive zoom.
- For floating-panel sequences, keep the central visual dominant and introduce supporting elements progressively with subtle overlap, perspective, opacity, translation, and scale.
- Bind progress transforms to scroll only when the physical connection adds meaning. Small translate, scale, rotation, fade, and clip progression are acceptable.
- Let sections introduce one another through controlled overlap, masks, crossfades, background transitions, or image expansion; avoid scroll hijacking.
- Use restrained oversized background words only when specified, behind readable foreground content with low contrast and slow motion.

### Explicit-only advanced patterns

Build morph/transformation sequences or curved path-following scroll animation only when a page specification requests them. Prefer DOM, SVG, masks, CSS `offset-path`, and scroll progress. Add GSAP MotionPath only when clearly necessary. Never introduce conceptual copy such as MODESTY, TIMELESS, CRAFTED, DESIGN, FABRIC, CRAFT, or FINISH automatically.

### Microinteractions

Give buttons, links, arrows, product images, wishlist controls, navigation, accordions, drawers, and selectors brief, sophisticated feedback. Avoid bounce and preserve clear state communication.

## Responsive and Accessibility Rules

- Treat mobile as a distinct choreography: shorten entrances, reduce distance and layer count, simplify sticky sequences, and prioritize touch and smooth scrolling.
- Make `prefers-reduced-motion` mandatory. Remove parallax, scroll-linked transforms, large translations, and animation-dependent pinning; expose content immediately with static states or minimal opacity.
- Never require animation for content access or interaction.

## Performance and Debugging

- Animate primarily `transform` and `opacity`; avoid `width`, `height`, `top`, and `left` without technical justification.
- Lazy-load expensive experiences, avoid needless continuous render loops, and clean up observers, timelines, and listeners.
- If motion is wrong, inspect the containing block, transform origin, stacking context, overflow, sticky parent, positioning context, viewport measurements, image object position, and progress calculation.
- Fix the root cause. Do not stack extra transforms until the result happens to look correct.
