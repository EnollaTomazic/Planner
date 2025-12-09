# ADR: Package-Level Boundaries for Shared Code

## Status
Proposed; tooling and migration plan committed, refactors in progress.

## Context
The monolithic `@/` alias allowed any module in `src/` to import anything else. That flexibility made it
hard to reason about ownership, delayed design-system reuse, and made test fixtures in Storybook/Vitest/Playwright
pull in application-only utilities. We are standardizing on package-level boundaries so UI primitives, feature
modules, and domain services can evolve independently and publish stable contracts.

## Decision
We are replacing the `@/` catch-all alias with four explicit workspaces and matching import prefixes:

- `@ui/*` maps to `packages/ui/src/*` and contains the design system primitives, tokens, and Storybook stories.
- `@features/*` maps to `packages/features/src/*` for feature slices that orchestrate UI and domain logic.
- `@core/*` maps to `packages/core/src/*` for cross-cutting utilities, configuration helpers, and domain services.
- `@api/*` maps to `packages/api/src/*` for API contracts, client shims, and test doubles for networked boundaries.

Additional aliases (for environment, config, and tooling) remain available but should not be used as a replacement for
these four boundaries.

## Consequences
- Imports must be rewritten to point at the package-aligned alias that owns the code; `@/` is reserved for legacy-only
  compatibility and will be removed after migration.
- Storybook, Vitest, and Playwright fixtures should import from `@ui`, `@features`, `@core`, or `@api` so the same source
  is exercised in both preview and test environments.
- Future lint rules will enforce cross-boundary contracts; the codemods shipped here prepare the tree for that check.

## Implementation Notes
- A ts-morph-based CLI (`tools/codemods/import-aliases.ts`) resolves imports using `tsconfig.json` and rewrites matches to
  the new prefixes. It supports apply, dry-run, and report-only modes.
- A companion jscodeshift transform (`tools/codemods/import-aliases.jscodeshift.cjs`) enables fast batch runs while
  sharing the same alias resolution rules.
- The `pnpm codemod:imports` script targets application code, Storybook stories, Vitest suites, and Playwright helpers so
  every test surface migrates together.
