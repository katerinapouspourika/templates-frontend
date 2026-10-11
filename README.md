# Templates - Frontend

A starting point for new frontends built with **TypeScript, HTML and CSS**, in two flavours, designed to sit next to an ASP.NET Core backend created from [templates-dotnet](https://github.com/kritikos-io/templates-dotnet).

| Variant   | What you write                                |
| --------- | --------------------------------------------- |
| `vanilla` | Plain TypeScript, HTML and CSS. No framework. |
| `react`   | React 19 components in TSX, CSS Modules.      |

Both share the same tooling: Vite 8, strict TypeScript, ESLint, Prettier, Stylelint, Vitest, Playwright, a typed client generated from your API's OpenAPI document, and Aspire-ready dev proxying. [docs/conventions.md](docs/conventions.md) explains every choice.

## Getting started

Requires Node.js 24 or later (`nvm use` reads `.nvmrc`).

### Option A: a standalone frontend repository

1. Create a repository from this template (**Use this template** on GitHub), or add it as a remote to an empty one so you can pull updates later:

   ```shell
   git remote add template https://github.com/katerinapouspourika/templates-frontend
   git fetch --all
   git merge template/main --allow-unrelated-histories
   ```

2. Pick a variant:

   ```shell
   npm run init -- --variant react    # or: --variant vanilla
   ```

   This keeps the chosen variant, removes the other one and its packages, deletes template-only files and runs `npm install`.

### Option B: inside a templates-dotnet repository

Clone this template anywhere, then point `init` at a folder of your .NET repository:

```shell
npm run init -- --variant react --target ../MyProduct/src/Web
```

Besides copying the frontend, this adds to the .NET repository:

- `.github/workflows/frontend.yml`: CI for the frontend, triggered only by changes under `src/Web`.
- `.github/dependabot.yml` (or prints the entry to add if you already have one).
- `.github/instructions/frontend-*.instructions.md`: Copilot rules scoped to frontend files.
- A git pre-commit hook installed from the repository root.

Then wire it into Aspire as described in [docs/aspire.md](docs/aspire.md).

## Scripts

| Command                                     | What it does                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`                               | Dev server with hot reload. Proxies `/api` when Aspire sets the API address.                   |
| `npm run build`                             | Type-checks, then builds to `dist/`.                                                           |
| `npm run preview`                           | Serves the production build locally.                                                           |
| `npm run check`                             | Format check, lint, type-check and unit tests. Run before pushing.                             |
| `npm run lint` / `lint:fix`                 | ESLint and Stylelint.                                                                          |
| `npm run format`                            | Formats everything with Prettier.                                                              |
| `npm run typecheck`                         | TypeScript only.                                                                               |
| `npm test` / `test:watch` / `test:coverage` | Vitest unit and component tests.                                                               |
| `npm run test:e2e`                          | Playwright end-to-end tests (run `npm run build` first; first time: `npx playwright install`). |
| `npm run api:generate`                      | Regenerates `src/api/schema.d.ts` from the backend OpenAPI document.                           |

## Project layout

```
src/
  api/          typed backend client (client.ts) and generated types (schema.d.ts)
  styles/       global CSS: reset, design tokens, base styles
  test/         test setup
  main.ts(x)    entry point
e2e/            Playwright tests
public/         static files copied as-is
docker/         optional nginx image for hosting without Aspire
```

## Features

- **Strict TypeScript 7** for type-checking, with the TypeScript 6 API kept for ESLint until TypeScript 7.1 ships its new API.
- **Type-aware linting** (`typescript-eslint` strict presets), comparable to the C# analyzers in templates-dotnet.
- **Formatting on save and on commit** via Prettier, EditorConfig, husky and lint-staged.
- **Typed API calls**: change a C# model, regenerate, and mismatches fail the type-check.
- **One `/api` contract** across the Vite proxy, Aspire (YARP) and nginx.
- **CI** on GitHub Actions and weekly **Dependabot** updates.
- **AI assistant guidance** for Copilot and Claude Code, mirroring templates-dotnet.

## Updating from the template

```shell
git pull template main
```

Shared configuration (lint, format, TypeScript, CI) merges cleanly. Files that came from a variant (`vite.config.ts`, `eslint.config.js`, `index.html`, `src/`) are yours after `init`, so compare those with `variants/<name>/` in the template by hand. Expect `variants/` to reappear after a pull; delete it again.

## Recommendations

- Bump `.nvmrc` to `26` after Node 26 becomes LTS (2026-10-28).
- Add routing, state management or a UI library per project; the template stays unopinionated about app libraries.
- When TypeScript 7.1 ships its API and typescript-eslint supports it, replace the two TypeScript aliases with a single `typescript` dependency.
