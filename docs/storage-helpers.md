# Shared storage helpers

The planner provides tiny helpers for working with `localStorage` in [`src/lib/local-bootstrap.ts`](../src/lib/local-bootstrap.ts).

- `parseJSON(raw)` safely parses a JSON string and returns `null` on failure.
- `readLocal(key)` reads a value from `localStorage` and parses it with `parseJSON`.
- `writeLocal(key, value)` serializes a value to JSON and stores it.
- All helpers report quota and serialization problems through the shared
  [`persistenceLogger`](../src/lib/logging.ts), which warns during development
  and tests while staying silent in production builds. Use the same logger in
  any future persistence helpers so intentional fallbacks remain easy to audit
  without spamming end-user consoles.

These helpers are reused by both `db.ts` and `theme.ts`, including the static bootstrap logic shipped in [`public/scripts/theme-bootstrap.js`](../public/scripts/theme-bootstrap.js).
