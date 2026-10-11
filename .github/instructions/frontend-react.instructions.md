---
description: "React component conventions: function components, hooks, styling and accessibility."
applyTo: "**/*.tsx"
---

# React Conventions

- Function components only, one exported component per file, named export matching the file name (`UserCard.tsx` exports `UserCard`).
- Type props with a `type` named `<Component>Props`. Destructure props in the signature.
- Follow the Rules of Hooks (enforced by `eslint-plugin-react-hooks`). Do not silence its warnings; restructure the code instead.
- Derive values during render instead of syncing them into state with `useEffect`. Reach for `useEffect` only to synchronise with something outside React.
- Style with CSS Modules: `Component.module.css` next to the component, kebab-case class names in CSS, camelCase in TSX (`.user-card` becomes `styles.userCard`).
- Use semantic elements (`button`, `nav`, `main`, `label`) before ARIA attributes. Every interactive element must be reachable and usable with the keyboard.
- Keep data fetching out of presentational components; wrap API calls from `src/api/client.ts` in hooks under `src/hooks/` or feature folders.
