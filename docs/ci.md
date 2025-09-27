# Continuous integration workflows

This project standardises Node-based automation through the reusable workflow defined at `.github/workflows/node-base.yml`. Jobs in `ci.yml` and deployment flows call into that workflow so dependency management, caching, and Playwright bootstrapping stay consistent.

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

- Next.js builds cache `.next/cache`. Use the key pattern from `ci.yml` so changes to dependencies or source invalidate the cache while retaining fallbacks for dependency-only changes.
- Playwright installs cache to `~/.cache/ms-playwright` automatically when `install-playwright` is enabled. The workflow derives the key from the detected Playwright version and lockfile hash.
- Additional cache directories can be layered by listing each path within `cache-paths`.

## Workflow usage

- `ci.yml` runs linting, type-checking, unit tests, a build (with audit reporting and cached `.next/cache`), and E2E suites that opt into Playwright installation and per-browser artefacts.
- `nextjs.yml` first calls the reusable workflow with the deployment ref to produce the static export and upload it as an artefact, then a follow-up job configures GitHub Pages and deploys the downloaded export.
