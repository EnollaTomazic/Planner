# Release Notes

## Unreleased

- Added the `NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS` environment flag to control numeric SVG filter parameters. The flag defaults to off so deployments continue using the CSS variable slope until the numeric path is validated.
- Added the `NEXT_PUBLIC_ORGANIC_DEPTH` flag to gate the organic depth utilities. The flag defaults to `false`, keeping the legacy control radii active; set it to `true` to roll out the new organic surfaces without shipping a code change.
- Retired the legacy prompt verifier path so `pnpm run verify-prompts` and `pnpm run check-prompts` now share the consolidated matcher; the deprecated `PROMPT_CHECK_MODE` flag is ignored, keeping existing automation behaviour unchanged.
- Tightened the GitHub Pages deploy script with automatic branch detection and a `DEPLOY_ARTIFACT_ONLY` escape hatch; existing pipelines continue publishing to `gh-pages` (or the configured `GH_PAGES_BRANCH`/`GITHUB_PAGES_BRANCH`) without changes.
- Consolidated the CI workflows on the shared `.github/actions/setup-node-project` composite action so `ci.yml`, `deploy-pages.yml`, and `workflow-lint.yml` reuse the same pnpm bootstrap while preserving the commands and gates they already run.
- Routed feature flags through the shared client environment helper so `NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS` and `NEXT_PUBLIC_FEATURE_GLITCH_LANDING` stay in sync across environments, with defaults that preserve the current UX until teams opt in to new behaviour.
