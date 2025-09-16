# Shared storage helpers

The planner provides tiny helpers for working with `localStorage` in [`src/lib/local-bootstrap.ts`](../src/lib/local-bootstrap.ts).

- `parseJSON(raw)` safely parses a JSON string and returns `null` on failure.
- `readLocal(key)` reads a value from `localStorage` and parses it with `parseJSON`.
- `writeLocal(key, value)` serializes a value to JSON and stores it.

These helpers are reused by both `db.ts` and `theme.ts`, including the static bootstrap logic shipped in [`public/scripts/theme-bootstrap.js`](../public/scripts/theme-bootstrap.js).
