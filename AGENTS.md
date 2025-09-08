# Repository Guidelines

This file provides instructions for all contributors.

## Coding Standards
- Write TypeScript/React code following the project's Prettier and ESLint configurations (2‑space indent, semicolons, double quotes, trailing commas).
- Reuse primitives and follow the design system documented in [docs/design-system.md](docs/design-system.md).
- Whenever you create a new style or component, add it to the prompts page (`src/app/prompts/page.tsx`).

## Scripts
- Regenerate the UI component index with `npm run regen-ui` after adding, removing, or renaming UI components.
- A future `npm run regen-feature` will update feature scaffolding; run it once available.

## Testing
- Before committing, run and fix:
  - `npm test`
  - `npm run lint`
  - `npm run typecheck`
- Only commit when all checks pass.

