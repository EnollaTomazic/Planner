# Contributing

Requires [Node.js](https://nodejs.org) 22 or newer.

## UI components

When adding a new UI component or style under `src/components/ui`, run:

```bash
npm run regen-ui
npm run check-prompts
```

`regen-ui` regenerates `src/components/ui/index.ts` so pages can import the component from `@/components/ui`.

`check-prompts` verifies that every component in `src/components/ui` and `src/components/prompts` has a corresponding entry in `src/app/prompts/page.tsx` or `src/components/prompts/PromptsDemos.tsx`.

After running the scripts, add a demo of the new component to `src/app/prompts/page.tsx` so it appears in the prompts gallery.

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

## Manual QA

Every page must pass the [manual QA checklist](docs/qa-manual.md) before merging.
