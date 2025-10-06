# Deployment Prep Tasks

This checklist summarizes the hands-on work required before running the deployment command. Use it alongside the full deployment plan so every release starts from a clean, predictable state.

## 1. Environment readiness
- [ ] Install Node.js 22 (or newer) and pnpm 10.13.1 to match the repository engines.
- [ ] Copy `.env.example` to `.env.local` and adjust secrets, feature flags, and base-path variables.
- [ ] Confirm Sentry, metrics, and any other external integrations have production-ready endpoints.

## 2. Dependency hygiene
- [ ] Run `pnpm install` to hydrate the lockfile state locally.
- [ ] Clear stale build artefacts with `pnpm clean` if you switched branches or upgraded dependencies.
- [ ] Re-run `pnpm run regen-ui` after editing UI component filenames so exports stay in sync.

## 3. Verification gates
- [ ] Start the dev server with `pnpm run dev` to smoke-test critical flows, using `GITHUB_PAGES=true BASE_PATH=<repo>` when mirroring GitHub Pages.
- [ ] Execute `pnpm run verify-prompts` to validate prompt bundles.
- [ ] Execute `pnpm run check` to cover linting, type-checking, and tests.

## 4. Build validation
- [ ] Build locally with `pnpm run build` using the same environment variables you will deploy with.
- [ ] Inspect the output folder (`out/`) for expected routes, assets, and the `.nojekyll` marker.
- [ ] Run `pnpm run analyze` if you need a bundle-size diff against the previous release.

## 5. Release coordination
- [ ] Ensure `origin` points to the correct GitHub repository or provide `GITHUB_REPOSITORY`/`GITHUB_TOKEN` for CI.
- [ ] Confirm `GH_PAGES_BRANCH` (or the default branch) is correct before pushing.
- [ ] Notify stakeholders, update release notes, and schedule post-deploy monitoring.

Document the completion of these tasks in your release issue or checklist so the deployment trail stays auditable.
