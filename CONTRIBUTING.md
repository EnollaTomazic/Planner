# Contributing

## UI components

When adding a new UI component or style under `src/components/ui`, run:

```bash
npm run regen-ui
```

This regenerates `src/components/ui/index.ts` so pages can import the component from `@/components/ui`.

After running the script, add a demo of the new component to `src/app/prompts/page.tsx` so it appears in the prompts gallery.

`npm run build` runs the regeneration step automatically, but running it manually keeps the index and prompts page current during development.

## Git hooks

Running `npm install` triggers the `prepare` script, which installs a Husky pre-commit hook. The hook blocks commits unless the following commands succeed:

```bash
npm test
npm run lint
npm run typecheck
npm run regen-ui
```

Ensure these checks pass before committing.

## Testing

`npm test` runs only the tests for files changed since the last commit. To execute the full test suite, run:

```bash
npm test -- --run
```

## Branch workflow

### Feature branch naming

Create descriptive feature branches so their purpose is clear. Use short hyphenated names such as `feat/login-form` or `fix/header-alignment`.

### Small, focused commits

Keep commits scoped to a single change. Avoid mixing unrelated updates so reviews stay quick and the history remains easy to follow.

### Rebase before merge

Rebase your branch on top of `main` before merging to maintain a clean, linear commit history.

## Pull requests

- Keep pull requests manageable, ideally under about 300 lines of changes.
- Open draft PRs early when you want feedback before the work is finished.
