---
description: "Frontend testing conventions: Vitest, Testing Library and Playwright."
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Frontend Testing Conventions

## Tools

- **Unit and component tests**: Vitest + Testing Library, files named `*.test.ts(x)` next to the code under test.
- **End-to-end tests**: Playwright, files named `*.spec.ts` in `e2e/`, run against the production build.

## Style

- Import test functions explicitly from `vitest` (globals are off).
- `describe` names the unit under test; `it` reads as a sentence about behaviour: `it("increments the counter on click")`.
- Follow Arrange / Act / Assert, separated by blank lines.
- Query the DOM the way a user would: `getByRole` with an accessible name first, then `getByLabelText`, `getByText`. Use `data-testid` only as a last resort.
- Simulate interaction with `@testing-library/user-event` (`userEvent.setup()`), not `fireEvent`.
- Test behaviour, not implementation details: no assertions on internal state, CSS class names or component instances.
- For every new or changed unit, cover the happy path, each documented edge case, and each expected error.
