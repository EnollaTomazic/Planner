# Continuous integration workflows

This project standardises Node-based automation through the reusable workflow defined at `.github/workflows/node-base.yml`. Jobs in `ci.yml`—including the build, test, and GitHub Pages publishing steps—call into that workflow so dependency management, caching, and Playwright bootstrapping stay consistent across CI and deployment runs.

## `node-base` workflow inputs

| Input | Description |
| --- | --- |
| `run` | Command executed after the environment is prepared. |
| `install-command` | Overrides the dependency installation command (defaults to `npm ci --prefer-offline --no-audit --no-fund`). |
| `cache-paths` | Newline-delimited list of cache directories. Leave empty to skip caching. |
| `cache-key` | Optional override for the cache key. When omitted the workflow hashes `package-lock.json`. |
| `cache-restore-keys` | Optional newline-delimited restore prefixes used by the cache action. |
| `install-playwright` | Installs Playwright browsers and primes the cache when `true`. |
| `checkout-ref` | Optional ref or commit SHA passed directly to the checkout action. |
| `artifact-name` / `artifact-path` | Upload artefacts after the run. Paths can be multi-line. |
| `artifact-on-failure` | Restrict artefact uploads to failing runs. |
| `summary-title` | Custom heading for the job summary block. |

## Cache guidance

- Next.js builds cache `.next/cache`. Use the key pattern from `ci.yml`—`hashFiles('next.config.*', 'src/**/*.{js,jsx,ts,tsx,mdx}', 'app/**/*.{js,jsx,ts,tsx,mdx}')`—so changes to dependencies or source invalidate the cache while retaining fallbacks for dependency-only changes.
- Playwright installs cache to `~/.cache/ms-playwright` automatically when `install-playwright` is enabled. The workflow derives the key from the detected Playwright version and lockfile hash.
- Additional cache directories can be layered by listing each path within `cache-paths`.

## Workflow usage

- `ci.yml` runs linting, the design token guard (`npm run lint:design`), type-checking, unit tests, a build (with audit reporting and cached `.next/cache`), and E2E suites that opt into Playwright installation and per-browser artefacts.
- The `pages-build` job inside `ci.yml` reuses `node-base` to create the static export for GitHub Pages, while `pages-deploy` consumes that artefact and executes the [`actions/deploy-pages`](https://github.com/actions/deploy-pages) step to publish the site.

## Manual visual regression workflow

- Trigger the `Visual Regression` workflow from the GitHub Actions tab when you need an on-demand screenshot comparison. Provide the branch or commit you want to exercise (defaults to `main`) and, optionally, a short environment label to capture which backend or deployment you are validating.
- The workflow builds once via a dedicated job that installs dependencies, seeds the Playwright browser cache, and uploads the `.next` directory as an artefact. Each browser matrix job depends on that build, downloads the artefact to serve the prebuilt app, then launches the production server and runs any Playwright tests tagged with `@visual`. If no tests carry the tag the run exits early with a notice so routine checks stay fast.
- Diff artefacts upload automatically when a comparison fails. Each browser matrix entry produces a zip named `visual-diff-<browser>` that contains the expected, actual, and diff images alongside the Playwright report output for that browser. Download the zip, extract it locally, and open the accompanying `index.html` to inspect failures interactively. Clean runs skip the upload so the manual workflow remains optional overhead rather than a required part of the release cadence.

The design token guard job is enforced as a required status check for protected branches so design regressions block merges alongside linting, type-checking, and unit tests.
