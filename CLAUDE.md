# Frontend

Vite + TypeScript frontend generated from `templates-frontend`. It talks to an ASP.NET Core backend through a typed OpenAPI client.

## Commands

- `npm run dev` — dev server (proxies `/api` to the backend when `API_HTTPS`/`API_HTTP` is set, e.g. by Aspire)
- `npm run check` — format check, lint, type-check, unit tests. Run before finishing any change.
- `npm run build` / `npm run test:e2e` — production build, then Playwright tests against it
- `npm run api:generate` — regenerate `src/api/schema.d.ts` from the backend OpenAPI document

## Rules

- Never weaken `tsconfig*.json`, `eslint.config.js` or `stylelint.config.js` to make code pass.
- No `any`, no `!` non-null assertions, no `enum`. Named exports only.
- Backend calls go through `src/api/client.ts`; never hand-write API types.
- Tests sit next to the code (`*.test.ts(x)`), query by role/label, use `user-event`.
- Detailed per-language rules: `.github/instructions/frontend-*.instructions.md` at the repository root.
- Commit messages follow gitmoji: `<emoji> <Third-person imperative summary>` (e.g. `✨ Adds user list page`).
