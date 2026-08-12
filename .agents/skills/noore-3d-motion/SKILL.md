---
name: noore-3d-motion
description: Build advanced NOORE 2.5D or genuine 3D experiences only when the user explicitly invokes this skill or explicitly requests 3D geometry, lighting, camera movement, or shaders. Never trigger implicitly for ordinary parallax, perspective, masks, or motion.
---

# NOORE 3D Motion

Use only after explicit invocation or an explicit genuine-3D requirement. Do not self-invoke.

## Decision Gate

1. Confirm the requested effect truly needs advanced 2.5D or 3D.
2. Prefer CSS perspective, layered DOM, transforms, SVG, and masks.
3. Use Three.js or React Three Fiber only for required geometry, lighting, camera movement, or shader effects that simpler techniques cannot deliver.
4. Do not install Three.js or React Three Fiber during tooling setup. For future implementation, obtain clear scope before adding dependencies.

Do not use WebGL for parallax, card tilt, image scaling, scroll translation, basic perspective, or masks.

## Implementation Rules

- Read the relevant Next.js guide under `node_modules/next/dist/docs/` before writing Next.js code.
- Preserve ecommerce navigation, product comprehension, controls, and checkout usability.
- Lazy-load expensive code and assets and split them at the route or component boundary.
- Avoid unnecessary render loops; pause work when hidden or offscreen and use demand rendering where possible.
- Dispose of geometry, materials, textures, observers, listeners, and animation handles.
- Limit texture resolution, draw calls, lighting complexity, overdraw, and device pixel ratio according to measured need.
- Provide a capable mobile fallback and a static or minimal reduced-motion fallback with equivalent content and actions.
- Avoid layout shift and never make essential content depend on canvas rendering.
- Test keyboard access, focus, resize and orientation changes, context loss, slow devices, and failure to initialize.

## Handoff

Document why real 3D was necessary, the fallback behavior, loading strategy, performance measurements, cleanup strategy, and any new dependency. If the gate is not met, route the work to `$noore-motion` techniques instead.
