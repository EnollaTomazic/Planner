# Continuous integration workflows

This project standardises Node-based automation through the reusable workflow defined at `.github/workflows/node-base.yml`. Jobs in `ci.yml`—covering the build and test matrix—call into that workflow so dependency management, caching, and Playwright bootstrapping stay consistent across CI runs. GitHub Pages publishing executes through the dedicated `Deploy Pages` workflow, which mirrors the same caching and export conventions while keeping production deployments isolated from PR validation noise.

## `node-base` workflow inputs

| Input | Description |
| --- | --- |
| `run` | Command executed after the environment is prepared. |
| `install-command` | Overrides the dependency installation command (defaults to `npm ci --prefer-offline --no-audit --no-fund`). |
| `cache-paths` | Newline-delimited list of cache directories. Leave empty to skip caching. |
| `cache-key` | Optional override for the cache key. When omitted the workflow derives one automatically. |
| `cache-restore-keys` | Optional newline-delimited restore prefixes used by the cache action. |
| `cache-key-prefix` | Prefix applied when the workflow generates cache keys automatically. |
| `cache-key-globs` | Newline-delimited globs that feed the automatic cache key generator. Blank lines group globs for layered fallbacks. |
| `install-playwright` | Installs Playwright browsers and primes the cache when `true`. |
| `checkout-ref` | Optional ref or commit SHA passed directly to the checkout action. |
| `artifact-name` / `artifact-path` | Upload artefacts after the run. Paths can be multi-line. |
| `artifact-on-failure` | Restrict artefact uploads to failing runs. |
| `summary-title` | Custom heading for the job summary block. |

## Cache guidance

- Next.js builds cache `.next/cache`. Reuse the glob groups from `ci.yml` so changes to dependencies or source invalidate the cache while retaining fallbacks for dependency-only changes.
- Playwright installs cache to `~/.cache/ms-playwright` automatically when `install-playwright` is enabled. The workflow derives the key from the detected Playwright version and lockfile hash.
- Additional cache directories can be layered by listing each path within `cache-paths`.

## Workflow usage

- `ci.yml` runs the prompt verifier (`npm run verify-prompts`), linting, the design token guard (`npm run lint:design`), type-checking, and unit tests before the dedicated `next-build` job creates the production `.next` output (with audit reporting and cached `.next/cache`). That single build artefact feeds both the accessibility suite and the Playwright E2E matrix so we avoid redundant compiles.
- The Vitest suite executes twice: once with the default legacy depth profile and again with `NEXT_PUBLIC_ORGANIC_DEPTH=true`. This keeps both code paths healthy so the flag can flip without requiring a fresh deploy.
- The accessibility job downloads the `next-build` artefact, verifies it before starting the server, and then exercises any tests tagged `@axe` (or the full suite when none are tagged).
- Visual E2E coverage now captures per-theme snapshots for the depth-aware button and card previews alongside rerunning axe against those preview routes. Keep `npx playwright test` wired into CI so this job remains the source of truth for depth and theme regressions.
- The `Deploy Pages` workflow builds the static export on pushes to `main`, verifying prompts before the export, uploading the artefact for traceability, and executing the [`actions/deploy-pages`](https://github.com/actions/deploy-pages) step to publish the site.

## Prompt verification modes

Prompt checks default to the consolidated matcher that scans every prompt file for references, but some teams still rely on the legacy behaviour that only inspects `src/app/prompts/page.tsx` and `src/components/prompts/PromptsDemos.tsx`. Opt in to the legacy pass by setting `PROMPT_CHECK_MODE=legacy` for any invocation (for example, `PROMPT_CHECK_MODE=legacy npm run verify-prompts`). When the variable is unset or holds another value the modern path runs.

In GitHub Actions jobs, add the flag within the step that runs the verifier:

```yaml
- name: Verify prompt coverage (legacy)
  run: npm run verify-prompts
  env:
    PROMPT_CHECK_MODE: legacy
```

The same environment variable applies to `npm run check-prompts` and downstream deployments, so Pages or custom CD pipelines can toggle modes without modifying the script itself.

## Manual visual regression workflow

- Trigger the `Visual Regression` workflow from the GitHub Actions tab when you need an on-demand screenshot comparison. Provide the branch or commit you want to exercise (defaults to `main`) and, optionally, a short environment label to capture which backend or deployment you are validating.
- The workflow builds once via a dedicated job that installs dependencies, seeds the Playwright browser cache, and uploads the `.next` directory as an artefact. Each browser matrix job depends on that build, downloads the artefact to serve the prebuilt app, then launches the production server and runs any Playwright tests tagged with `@visual`. If no tests carry the tag the run exits early with a notice so routine checks stay fast.
- Diff artefacts upload automatically when a comparison fails. Each browser matrix entry produces a zip named `visual-diff-<browser>` that contains the expected, actual, and diff images alongside the Playwright report output for that browser. Download the zip, extract it locally, and open the accompanying `index.html` to inspect failures interactively. Clean runs skip the upload so the manual workflow remains optional overhead rather than a required part of the release cadence.

The design token guard job is enforced as a required status check for protected branches so design regressions block merges alongside linting, type-checking, unit tests, accessibility, and the browser E2E checks that execute against the shared build. The `Deploy Pages` workflow is also required so merges confirm that the production Pages deployment pipeline remains healthy after each change.
