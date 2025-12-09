# Codemods

This folder contains utilities for moving the codebase off the legacy `@/` alias. Both scripts resolve module specifiers
with `tsconfig.json` so aliases and relative imports produce consistent results.

- `import-aliases.ts` — ts-morph CLI with `--dry-run` and `--report` switches. Run with `node --import tsx tools/codemods/import-aliases.ts`.
- `import-aliases.jscodeshift.cjs` — jscodeshift transform used by `pnpm codemod:imports` for fast bulk rewrites.

Defaults cover application code, Storybook stories, Vitest suites, and Playwright helpers. Override the `--paths` flag to target
custom globs without editing the script.
