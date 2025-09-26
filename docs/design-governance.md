# Design System Governance

This guide codifies how we keep the Planner design system consistent across implementations. Each section pairs a governance control with the enforcement mechanism that keeps it actionable.

## Token enforcement

- **Cause**: Visual drift appears when contributors bypass our semantic tokens for ad-hoc values. **Impact**: Themes desynchronize and accessibility regressions slip into production.
- Treat `tokens/tokens.css` and `src/app/themes.css` as the single source of truth. New design decisions must land in tokens first, then be consumed through semantic utilities like `bg-surface`, `text-foreground`, or the control radius variables.
- Extend the existing `tokens` build step so CI can validate that every Tailwind class or inline style references a semantic token. The `scripts` folder already houses utilities for build-time checks; add a `lint:tokens` script that walks component source files, inspects class strings, and flags raw hex values or hard-coded spacing.
- Require a design review checklist item for every PR that touches styles. Reviewers confirm that token deltas include a corresponding entry in `COLOR_MAPPINGS.md` when new hues ship and that component code consumes the semantic alias instead of the raw value.

## Lint coverage

- **Cause**: Our current ESLint preset focuses on React correctness but does not guard design decisions. **Impact**: Subtle violations (e.g., manual spacing, inline colors) pass code review undetected.
- Layer style-specific rules into `eslint.config.mjs` by composing `no-restricted-syntax` blocks that disallow literal color strings, pixel-based spacing, or importing CSS files outside the themes/tokens pipeline. Mirror the allowed vocabulary by loading the token names from `tokens/tokens.js` so the rule set evolves with the design system.
- Add a dedicated `npm run lint:design` command that reuses these rules and plug it into `npm run check`. Failing the design lint should block merges, keeping the governance signal in the same report developers already monitor.
- Surface actionable messages (e.g., "Use `space-5` instead of `20px`") to teach newcomers the preferred token. Pair the rule with a fixer where possible so migrations stay lightweight.

## Component gallery accountability

- **Cause**: Without canonical examples, teams implement components from memory, diverging from the approved patterns. **Impact**: Accessibility affordances (roles, focus management) and token usage degrade across surfaces.
- Treat `src/components/gallery` as the authoritative showcase. Every component or primitive change must ship with a corresponding gallery entry, variant metadata, and usage guidance. Because `src/components/prompts/PromptsPage` renders the gallery, additions become instantly visible in the prompts demo route.
- Document required states (default, hover, focus-visible, disabled) and content density for each gallery example. Use the gallery metadata to prove that tokens like `text-accent-foreground` and `shadow-dropdown` render correctly across themes.
- Back the gallery with snapshot tests (via Storybook stories or the existing runtime manifest) so CI fails if a refactor strips required landmarks, aria labels, or token hooks. When regressions arise, the gallery doubles as the reproduction harness for debugging.

Following these governance practices keeps Planner’s UI system durable: contributors inherit proven patterns, lint rules catch drift, and the component gallery acts as a living contract between design and engineering.
