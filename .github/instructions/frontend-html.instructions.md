---
description: "HTML conventions: semantics, accessibility and document structure."
applyTo: "**/*.html"
---

# HTML Conventions

- Keep `index.html` minimal: metadata, the `#app` mount point and the module script. UI is rendered from TypeScript.
- Always set `lang` on `<html>`, a meaningful `<title>` and `<meta name="description">`.
- Semantic elements first (`header`, `main`, `nav`, `section`, `button`); ARIA only when no native element fits.
- Every image needs `alt` (empty `alt=""` for decorative images). Every form control needs a `<label>`.
- Static files that must keep their exact name go in `public/`. Everything imported from code goes in `src/` so Vite can hash and optimise it.
