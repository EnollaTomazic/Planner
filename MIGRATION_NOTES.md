# Migration: `@/` imports to package aliases

This migration introduces the `@ui`, `@features`, `@core`, and `@api` prefixes in place of the legacy `@/` catch-all.
Use the codemods in `tools/codemods` to rewrite imports after code moves into the new workspaces.

## Expected path moves

- UI primitives, icons, and storybook-only helpers → `packages/ui/src` (`@ui/*`).
- Feature slices and page-level wiring (previously under `src/app` or `src/features`) → `packages/features/src` (`@features/*`).
- Shared utilities, configuration helpers, and domain logic currently under `src/lib`, `src/config`, or `src/utils` → `packages/core/src` (`@core/*`).
- API clients, mocks, and schema contracts → `packages/api/src` (`@api/*`).

## Codemod workflow

1. Run a report to understand what will change:
   ```bash
   pnpm codemod:imports -- --report
   ```
2. Dry-run a subset (supports Storybook, Vitest, and Playwright files). The `--dry-run` flag reports changes without writing:
   ```bash
   pnpm codemod:imports -- --dry-run --paths "src/**/*.{ts,tsx}" "packages/**/*.{ts,tsx}" "tests/**/*" "storybook/**/*" "playwright.config.ts"
   ```
3. Apply rewrites once directories are relocated:
   ```bash
   pnpm codemod:imports -- --paths "src/**/*.{ts,tsx,js,jsx}" "packages/**/*.{ts,tsx,js,jsx}" "tests/**/*" "storybook/**/*" "playwright.config.ts" "vitest.config.ts"
   ```

The codemods resolve module specifiers via `tsconfig.json`, so `@/` imports and relative paths that target the new package
roots are rewritten to `@ui`, `@features`, `@core`, or `@api`. Use the report output to confirm Storybook stories, Vitest
suites, and Playwright helpers move in sync with application code.
