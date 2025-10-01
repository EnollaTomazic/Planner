# Design System Governance

This guide codifies how we keep the Planner design system consistent across implementations. Each section pairs a governance control with the enforcement mechanism that keeps it actionable.

## Token enforcement

- **Cause**: Visual drift appears when contributors bypass our semantic tokens for ad-hoc values. **Impact**: Themes desynchronize and accessibility regressions slip into production.
- Treat `tokens/tokens.css` and `src/app/themes.css` as the single source of truth. New design decisions must land in tokens first, then be consumed through semantic utilities like `bg-surface`, `text-foreground`, or the control radius variables.
- Extend the existing `tokens` build step so CI can validate that every Tailwind class or inline style references a semantic token. The `scripts` folder already houses utilities for build-time checks; add a `lint:tokens` script that walks component source files, inspects class strings, and flags raw hex values or hard-coded spacing.
- Wire the bespoke ESLint rule `design/no-raw-design-values` into the flat config so `npm run lint:design` enforces token usage in `app/` and `src/`. The rule guards raw hex colors and pixel values while explicitly permitting responsive image `sizes` strings, media-query labels, and other viewport metadata. Inline format guards (e.g., `value.startsWith("rgb(")`) can use local `eslint-disable` comments when documenting third-party syntax.
- Require a design review checklist item for every PR that touches styles. Reviewers confirm that token deltas include a corresponding entry in `COLOR_MAPPINGS.md` when new hues ship and that component code consumes the semantic alias instead of the raw value.

## Lint coverage

- **Cause**: Our current ESLint preset focuses on React correctness but does not guard design decisions. **Impact**: Subtle violations (e.g., manual spacing, inline colors) pass code review undetected.
- Layer style-specific rules into `eslint.config.mjs` by composing `no-restricted-syntax` blocks that disallow literal color strings, pixel-based spacing, or importing CSS files outside the themes/tokens pipeline. Mirror the allowed vocabulary by loading the token names from `tokens/tokens.js` so the rule set evolves with the design system.
- Keep the existing `npm run lint:design` command wired into `npm run check` (see `.github/workflows/ci.yml`, which now runs `npm run verify-prompts` ahead of the aggregate check). CI must continue running this task so the design lint gate always reports alongside the broader checks and blocks merges when it fails. Developers can scope design linting by running `npm run lint:design -- --max-warnings=0` locally.
- Surface actionable messages (e.g., "Use `space-5` instead of `20px`") to teach newcomers the preferred token. Pair the rule with a fixer where possible so migrations stay lightweight.

## Component gallery accountability

- **Cause**: Without canonical examples, teams implement components from memory, diverging from the approved patterns. **Impact**: Accessibility affordances (roles, focus management) and token usage degrade across surfaces.
- Treat `src/components/gallery` as the authoritative showcase. Every component or primitive change must ship with a corresponding gallery entry, variant metadata, and usage guidance. The `/components` route renders this gallery (`src/app/components/page.tsx`), so additions surface immediately in the public catalog.
- Document required states (default, hover, focus-visible, disabled) and content density for each gallery example. Use the gallery metadata to prove that tokens like `text-accent-foreground` and `shadow-dropdown` render correctly across themes.
- Back the gallery with snapshot tests (via Storybook stories or the existing runtime manifest) so CI fails if a refactor strips required landmarks, aria labels, or token hooks. When regressions arise, the gallery doubles as the reproduction harness for debugging.

Following these governance practices keeps Planner’s UI system durable: contributors inherit proven patterns, lint rules catch drift, and the component gallery acts as a living contract between design and engineering.
