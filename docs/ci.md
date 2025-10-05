# Continuous integration workflows

This project maintains three first-party workflows under `.github/workflows/`:

- `ci.yml` runs the validation and test matrix that gates every pull request and push.
- `deploy-pages.yml` publishes the static export to GitHub Pages after changes land on protected branches.
- `workflow-lint.yml` enforces style and correctness rules for workflow changes themselves.

Each workflow wires directly into the shared composite action at `.github/actions/setup-node-project` so pnpm, caching, and environment bootstrapping stay consistent without relying on a separate reusable workflow.

## Cache guidance

- Next.js builds cache `.next/cache`. Reuse the glob groups from `ci.yml` so changes to dependencies or source invalidate the cache while retaining fallbacks for dependency-only changes.
- Playwright installs cache to `~/.cache/ms-playwright` automatically when the browsers install step runs. Derive keys from the Playwright version and `pnpm-lock.yaml` hash to avoid stale binaries.
- Add new caches with explicit `actions/cache` steps in the relevant job or by extending the `setup-node-project` composite action so the configuration lives with the tasks that consume it.

## Local-first E2E opt-in

- End-to-end specs that exercise Planner, Reviews, and Team builder persistence run automatically in CI (because `CI` is set). When running Playwright locally, opt in by exporting `PLAYWRIGHT_ALLOW_LOCAL_FIRST=1` so those flows can mutate the sandboxed localStorage state without touching your personal Planner data. Without the flag the storage-heavy specs are skipped.

## Workflow usage

The `ci.yml` workflow defines first-class jobs for audits, linting, type-checking, unit tests, building, and Playwright coverage. Each job checks out the repo, invokes `setup-node-project` for pnpm and caching, and then runs its command sequence directly—no reusable workflow indirection—so any changes to the automation live alongside the jobs that consume them.

- `ci.yml` runs the prompt verifier (`pnpm run verify-prompts`), linting, the design token guard (`pnpm run lint:design`), type-checking, and unit tests before the dedicated `next-build` job creates the production `.next` output (with audit reporting and cached `.next/cache`). That single build artefact feeds both the accessibility suite and the Playwright E2E matrix so we avoid redundant compiles.
- The Vitest suite executes twice: once with the default legacy depth profile and again with `NEXT_PUBLIC_ORGANIC_DEPTH=true`. This keeps both code paths healthy so the flag can flip without requiring a fresh deploy.
- The accessibility job downloads the `next-build` artefact, verifies it before starting the server, and then exercises any tests tagged `@axe` (or the full suite when none are tagged).
- Visual E2E coverage now captures per-theme snapshots for the depth-aware button and card previews alongside rerunning axe against those preview routes. Keep `npx playwright test` wired into CI so this job remains the source of truth for depth and theme regressions.
- The `Deploy Pages` workflow builds the static export on pushes to `main`, verifying prompts before the export, uploading the artefact for traceability, and executing the [`actions/deploy-pages`](https://github.com/actions/deploy-pages) step to publish the site.
- `workflow-lint.yml` runs `actionlint` and `yamllint` whenever workflow files change (or on demand) so breaking changes surface before they land in `ci.yml` or `deploy-pages.yml`.

## Bundle analysis and performance budgets

- Run `pnpm run analyze` locally to generate static HTML bundle reports. The command seeds `docs/bundle-report/` with the latest client, edge, and Node bundle snapshots so you can diff asset growth without leaving the repo. Pass a custom `BUNDLE_ANALYZE_OUTPUT_DIR` when you need the artefacts somewhere else (for example, an absolute path inside a CI workspace).
- The `build:analyze` script is CI-friendly: it respects existing `prebuild` hooks, emits static analyser output without attempting to open a browser, and prints the destination folder after completion. Upload the `docs/bundle-report/` directory as a workflow artefact to keep bundle deltas visible in job summaries.
- Per-route performance budgets stay enforced manually until automated checks land. Keep the JavaScript payload under **180 KB gzipped** for every exported route, target **≤ 2.5 s Largest Contentful Paint** on a cold mobile profile, and hold **Cumulative Layout Shift below 0.10**. Flag any regression breaching those numbers so we can prioritise the fix before merging.

## Prompt verification behaviour

Prompt checks always run through the consolidated matcher that scans every prompt file for references. The legacy mode that only inspected a subset of prompt sources has been removed, and `pnpm run verify-prompts` / `pnpm run check-prompts` now share the same behaviour in every environment. The `PROMPT_CHECK_MODE` environment flag is no longer supported—remove it from any automation since it is ignored by the scripts.

## Manual visual regression workflow

- Trigger the `Visual Regression` workflow from the GitHub Actions tab when you need an on-demand screenshot comparison. Provide the branch or commit you want to exercise (defaults to `main`) and, optionally, a short environment label to capture which backend or deployment you are validating.
- The workflow builds once via a dedicated job that installs dependencies, seeds the Playwright browser cache, and uploads the `.next` directory as an artefact. Each browser matrix job depends on that build, downloads the artefact to serve the prebuilt app, then launches the production server and runs any Playwright tests tagged with `@visual`. If no tests carry the tag the run exits early with a notice so routine checks stay fast.
- Diff artefacts upload automatically when a comparison fails. Each browser matrix entry produces a zip named `visual-diff-<browser>` that contains the expected, actual, and diff images alongside the Playwright report output for that browser. Download the zip, extract it locally, and open the accompanying `index.html` to inspect failures interactively. Clean runs skip the upload so the manual workflow remains optional overhead rather than a required part of the release cadence.

The design token guard job is enforced as a required status check for protected branches so design regressions block merges alongside linting, type-checking, unit tests, accessibility, and the browser E2E checks that execute against the shared build. The `Deploy Pages` workflow is also required so merges confirm that the production Pages deployment pipeline remains healthy after each change.
