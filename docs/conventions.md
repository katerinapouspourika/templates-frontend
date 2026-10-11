# Tooling decisions

Why each tool and setting was chosen, as of October 2026. The guiding rule: pick the most widely adopted, actively maintained option, and match the strictness of the templates-dotnet C# setup.

## Runtime and package manager

| Choice                | Why                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js 24** (LTS)  | Active LTS today; Node 26 becomes LTS on 2026-10-28. `.nvmrc` pins the major line and `engines` accepts 24.15+ and 26+. Bump `.nvmrc` to `26` once it is LTS.                                                          |
| **npm**               | Ships with Node, needs no setup, is the default for Aspire's JavaScript integration, Microsoft's own templates and GitHub's `setup-node` cache. pnpm is a fine upgrade for large monorepos; switching means replacing the lockfile and CI commands. |

## Build

| Choice     | Why                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vite 8** | The standard build tool for new projects, with the highest satisfaction score in State of JS. Aspire has first-class support (`AddViteApp`). One config drives dev, build and tests (Vitest). |

## TypeScript

**TypeScript 7 for type-checking, TypeScript 6 API for tools.** TypeScript 7 (the native Go port) is roughly 10× faster but ships without a programmatic API, which typescript-eslint and openapi-typescript still need. Microsoft's recommended setup installs both through npm aliases, which is what `package.json` does:

```json
"@typescript/native": "npm:typescript@^7.0.2",
"typescript": "npm:@typescript/typescript6@^6.0.2"
```

`npx tsc` runs 7.0; anything that imports `typescript` gets 6.0. Once TypeScript 7.1 ships its new API and typescript-eslint supports it, collapse both into a single `typescript` dependency.

Compiler options follow Vite's official template plus the extra strictness TypeScript 7 now defaults to:

- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUncheckedSideEffectImports`
- `verbatimModuleSyntax` and `erasableSyntaxOnly`: TypeScript syntax that only erases (no `enum`, no `namespace`), so files work with any fast transpiler.
- `moduleResolution: bundler`, `noEmit`: Vite compiles, `tsc` only checks.
- `paths` instead of `baseUrl` (removed in TypeScript 7) for the `@/` alias.

## Code quality

| Choice                                          | Why                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ESLint 10** + **typescript-eslint** (`strictTypeChecked`, `stylisticTypeChecked`) | Still the most used linter by a wide margin (about 160M weekly downloads vs. 18M for Biome). Type-aware rules catch real bugs (floating promises, unsafe `any`), the closest match to the C# analyzers in templates-dotnet. Flat config with `defineConfig`. |
| **Prettier**                                    | De facto formatter for TS, CSS, HTML, JSON, YAML and Markdown. `eslint-config-prettier` keeps ESLint out of formatting. Defaults are kept, since those are what most codebases use.                                                     |
| **Stylelint** + `stylelint-config-standard`     | The standard CSS linter. Since Stylelint 16 it no longer formats, so it never fights Prettier.                                                                                                                                      |
| **eslint-plugin-react-hooks** / **react-refresh** (React only) | The rules React and Vite ship in their own templates.                                                                                                                                                                  |
| **EditorConfig**                                | Same indentation and line-ending rules as templates-dotnet.                                                                                                                                                                         |
| **husky** + **lint-staged**                     | The common pre-commit setup: lints and formats only the staged files.                                                                                                                                                              |

Vite's own `create-vite` templates moved to Oxlint, which is much faster but has no type-aware rules yet. Biome is a good all-in-one alternative. Both are reasonable later swaps; ESLint stays the default here for type-aware rules and ecosystem coverage.

`eslint-plugin-jsx-a11y` is not included because it does not support ESLint 10 yet. Add it when it does.

## CSS

Plain modern CSS: native nesting, custom properties, cascade layers and `light-dark()` are supported by all evergreen browsers, so Sass adds little. React components use **CSS Modules** (built into Vite) for scoped class names. Tailwind is a popular alternative but a larger stylistic commitment; add it per project if wanted.

## Testing

| Choice                                      | Why                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest 5**                                | The test runner of the Vite ecosystem: same config, same transforms, Jest-compatible API. Globals are off, so tests import what they use. |
| **Testing Library** + **user-event**        | Tests query the DOM the way users and assistive technology do (by role and label).                                                        |
| **jsdom**                                   | The most compatible DOM implementation for unit tests.                                                                                    |
| **Playwright**                              | The most used end-to-end framework; runs against the production build in CI.                                                              |
| **V8 coverage**                             | Native, fast coverage via `@vitest/coverage-v8`.                                                                                          |

## Backend integration

| Choice                                         | Why                                                                                                                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **openapi-typescript** + **openapi-fetch**     | Generates types only (zero runtime besides a ~6 kB fetch wrapper) from the OpenAPI document that templates-dotnet already produces. Framework-agnostic, so it suits both variants. Orval or Kiota generate full clients if you prefer. |
| **Relative `/api` URLs**                       | One contract for the Vite proxy, Aspire's YARP proxy and nginx. See [aspire.md](aspire.md).                                                                                                                 |

## Repository

- **GitHub Actions** CI: format check, lint, type-check, unit tests with coverage, build, Playwright.
- **Dependabot** (built into GitHub, no app to install): weekly npm and Actions updates, minor and patch grouped into one PR.
- **gitmoji** commit messages, same as templates-dotnet (`.github/copilot-commit-message-instructions.md`).
- **AI assistant instructions** for Copilot (`.github/instructions/`) and Claude Code (`CLAUDE.md`), mirroring templates-dotnet.

## Sources

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/?p=5246) and [Nx: TypeScript 7 guide](https://nx.dev/docs/technologies/typescript/guides/typescript-7)
- [Vite create-vite templates](https://github.com/vitejs/vite/tree/main/packages/create-vite)
- [Aspire JavaScript integration](https://aspire.dev/integrations/frameworks/javascript) and [deploying JavaScript apps](https://aspire.dev/deployment/javascript-apps/)
- [State of JavaScript 2025 summary](https://blog.codercops.com/blog/state-of-javascript-2025-survey-2026)
- [ESLint vs Biome download comparison](https://www.pkgpulse.com/compare/eslint-vs-biome)
- [Orval vs openapi-typescript vs Kubb](https://www.pkgpulse.com/guides/orval-vs-openapi-typescript-vs-kubb-openapi-client-2026)
- [Node.js release schedule](https://github.com/nodejs/Release)
- [eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)
