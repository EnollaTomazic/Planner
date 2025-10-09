# Contributing

Requires [Node.js](https://nodejs.org) 22.x and [pnpm](https://pnpm.io) 10.13.1. The CI pipeline reads `.nvmrc` and checks `node --version` and `pnpm --version` to ensure they match these values, so align your local environment accordingly.

## Scripts

Use [`tsx`](https://github.com/esbuild-kit/tsx) for running TypeScript-powered scripts. All pnpm tasks already invoke `tsx` (or `node --import tsx`) so aligning local commands with it keeps runtime behavior consistent with CI.

### Automatic regeneration during install

Running `pnpm install` invokes `scripts/postinstall.mjs`, which executes `scripts/regen-if-needed.ts`. The script validates that `src/components/gallery/generated-manifest.ts` exists and exports the gallery payload modules before the install completes. When the manifest is stale (for example, after checking out a branch that touched gallery entries) the postinstall step automatically runs `pnpm run build-gallery-usage` and other required generators. Expect a short CLI progress bar while the tasks run. If the manifest is missing or malformed locally, the script now regenerates it immediately (and refreshes its cached manifest) so installs self-heal instead of leaving a broken file behind.

## UI components

When adding a new UI component or style under `src/components/ui`, run:

```bash
pnpm run regen-ui
pnpm run check-prompts
```

`regen-ui` regenerates `src/components/ui/index.ts` so pages can import the component from `@/components/ui`.

`check-prompts` scans every prompt source file to confirm that components in `src/components/ui` and `src/components/prompts` are referenced somewhere in the gallery demos.

After running the scripts, add a demo of the new component to `src/app/prompts/page.tsx` so it appears in the prompts gallery.

`pnpm run build` runs the regeneration step automatically, but running it manually keeps the index and prompts page current during development.

## Git hooks

Running `pnpm install` triggers the `prepare` script, which installs Husky hooks. The pre-commit hook blocks commits unless the following commands succeed:

```bash
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run regen-ui
```

Ensure these checks pass before committing.

Husky also runs Commitlint on each commit message. The hook validates every change against the Conventional Commits rules defined in `commitlint.config.js` and fails fast when the type or scope is incorrect.

## Commit messages

Use Commitizen to generate commit messages interactively:

```bash
pnpm run commit
```

The prompt walks through selecting a Conventional Commit type and scope that align with the `commitlint.config.js` rules. Running `pnpm run commit` is optional but recommended because the command mirrors the Commitlint validation performed by the `commit-msg` hook.

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
