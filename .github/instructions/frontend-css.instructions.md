---
description: "CSS conventions: layers, custom properties, modern native CSS, Stylelint."
applyTo: "**/*.css"
---

# CSS Conventions

- Plain modern CSS, no preprocessor: native nesting, custom properties, `light-dark()`, logical properties.
- Global styles live in `src/styles/global.css`, organised in the cascade layers `reset`, `tokens`, `base`. Do not add global selectors elsewhere.
- Use the design tokens (`--color-*`, `--space-*`, `--radius`) instead of literal values. Add a token when a value repeats.
- Class names are kebab-case (Stylelint enforces `stylelint-config-standard`).
- Component styles: CSS Modules (`*.module.css`) for React, a stylesheet per feature for the vanilla variant.
- Avoid `!important` and ID selectors. Keep specificity flat; nesting at most two levels deep.
- Respect user preferences: `prefers-reduced-motion` for animation, `prefers-color-scheme` through `light-dark()`.
