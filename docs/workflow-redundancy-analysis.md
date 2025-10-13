# Workflow Redundancy Analysis

This report now documents how the CI/CD configuration eliminates the overlapping logic that previously drove the recommendations in earlier revisions.

## Centralised runtime validation

The `.github/actions/setup-node-project` composite action accepts a `node-version` input, normalises the value from either the explicit input or `.nvmrc`, provisions the requested release through `actions/setup-node`, and fails the job if the active runtime does not satisfy the declared major/minor/patch constraint.【F:.github/actions/setup-node-project/action.yml†L5-L205】【F:.github/actions/setup-node-project/action.yml†L256-L294】 Each CI matrix entry simply forwards its Node requirement to the composite, so the workflow no longer needs to hand-roll per-job shell checks or maintain temporary `.nvmrc` copies.【F:.github/workflows/ci.yml†L46-L118】

## Shared gallery manifest stage

`ci.yml` introduces a dedicated `prepare-gallery` job that bootstraps pnpm once, runs `pnpm run build-gallery-usage`, and uploads the generated manifest files as a reusable artifact.【F:.github/workflows/ci.yml†L22-L44】 Downstream quality jobs declare `needs: prepare-gallery` and download the artifact before installing dependencies, ensuring every gate operates on the same manifest snapshot without re-running the generator on separate runners.【F:.github/workflows/ci.yml†L46-L118】

## Single deployment pipeline

With the stock `nextjs.yml` sample removed, GitHub Pages deployments run exclusively through the bespoke `deploy-pages.yml` workflow, keeping environment validation and publishing logic in one place.【F:.github/workflows/deploy-pages.yml†L1-L70】 Maintaining a single pipeline avoids double publishes while preserving the repository-specific checks around prompt validation and export uploads.

## Ongoing monitoring

The streamlined setup should reduce drift between jobs, but future audits should keep an eye on long-running caches and additional generator steps that might benefit from the same "build once, fan out" pattern.
