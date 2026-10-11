---
description: "TypeScript conventions for the frontend: strictness, modules, naming and API access."
applyTo: "**/*.{ts,tsx}"
---

# TypeScript Conventions

The compiler and linter settings are the source of truth (`tsconfig.app.json`, `eslint.config.js`). Do not weaken them to make code compile.

## Types

- `strict` and `noUncheckedIndexedAccess` are on. Handle `undefined` explicitly; never silence it with `!` (non-null assertion) or `as` casts.
- No `any`. Use `unknown` for untrusted data and narrow it.
- Prefer `type` imports for types only: `import type { Foo } from "./foo"` (required by `verbatimModuleSyntax`).
- No `enum` or `namespace` (`erasableSyntaxOnly`). Use union string literals or `as const` objects.
- Annotate return types on exported functions (React components excepted); let TypeScript infer locals.

## Modules and naming

- ES modules only. Named exports over default exports (except where a tool requires a default, like config files).
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for React components.
- Identifiers: `camelCase` for values and functions, `PascalCase` for types, interfaces and components, `UPPER_SNAKE_CASE` only for true constants.
- Import order: Node built-ins, packages, then local files, separated by blank lines. `@/` resolves to `src/`.

## Backend API

- Call the backend only through `src/api/client.ts` (openapi-fetch). Never hand-write request or response types for API data.
- After the backend contract changes, run `npm run api:generate` and commit the updated `src/api/schema.d.ts`.
- Use relative URLs (`/api/...`). The dev proxy, Aspire and nginx forward them to the backend.

## Environment

- Only `VITE_`-prefixed variables reach browser code, via `import.meta.env`. Declare new ones in `src/vite-env.d.ts`.
- Never put secrets in `VITE_` variables: they are embedded in the public bundle.
