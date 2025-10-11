# Workflow Redundancy Analysis

This document highlights areas where the GitHub Actions workflows can be simplified by eliminating repeated logic or consolidating overlapping automation. Recommendations focus on reducing maintenance overhead while preserving the existing quality gates.

## Repeated runtime validation steps

Every job in `CI` begins with a hand-written shell step that re-implements `.nvmrc` enforcement even though the preceding `setup-node-project` composite action already provisions Node.js using the same file. The repetition spans the audit, lint, typecheck, unit test, build, and Playwright jobs and adds hundreds of lines to the workflow definition.【F:.github/workflows/ci.yml†L36-L82】【F:.github/workflows/ci.yml†L112-L201】【F:.github/workflows/ci.yml†L208-L287】【F:.github/workflows/ci.yml†L293-L381】【F:.github/workflows/ci.yml†L392-L548】【F:.github/workflows/ci.yml†L593-L730】

The custom `Verify tool versions` composite action then performs the same Node.js comparison again alongside a pnpm check, and the build job runs an additional bespoke `Validate runtime versions` script that duplicates the composite action’s logic.【F:.github/workflows/ci.yml†L85-L201】【F:.github/workflows/ci.yml†L343-L507】 Because `setup-node-project` uses `actions/setup-node` with the declared `.nvmrc` and already enforces pnpm availability, the shell step and the extra build validation can be removed in favor of relying solely on `verify-tool-versions`. If a guardrail is still desired, move the Node.js assertion directly into the composite action so that all jobs inherit it automatically. The composite action already centralizes the pnpm version check, so augmenting it with a `node -v` comparison keeps the workflow YAML lean while retaining a single source of truth for runtime enforcement.【F:.github/actions/setup-node-project/action.yml†L1-L156】【F:.github/actions/verify-tool-versions/action.yml†L1-L45】

## Rebuilding gallery metadata in every job

Each CI job invokes `pnpm run build-gallery-usage`, leading to redundant work across five separate runners.【F:.github/workflows/ci.yml†L91-L353】【F:.github/workflows/ci.yml†L448-L652】 If the manifest is only needed by downstream jobs, consider a dedicated “prepare assets” job that runs once, uploads the generated files with `actions/upload-artifact`, and exposes a `needs: prepare-gallery` dependency. Subsequent jobs could download the artifact (or declare a dependency) instead of re-running the same script, saving several minutes per pipeline while guaranteeing all consumers operate on the same metadata snapshot.

## Parallel deployment workflows

The repository ships two GitHub Pages deployment workflows: a bespoke `Deploy Pages` pipeline and the stock `Deploy Next.js site to Pages` sample. Both target `main` pushes and produce the same artifact, which risks double publishes and forces the team to maintain two sets of deployment logic.【F:.github/workflows/deploy-pages.yml†L1-L70】【F:.github/workflows/nextjs.yml†L1-L122】 Removing the scaffolded sample (or disabling its trigger) will prevent redundant runs and ensure all custom environment checks—such as `pnpm exec tsx scripts/validate-deploy-env.ts`—live in one place.【F:.github/workflows/deploy-pages.yml†L45-L63】

## Next steps

1. Fold the Node.js version assertion into `setup-node-project` (or the shared `verify-tool-versions` composite action) and delete the duplicated shell step from each job.
2. Drop the build job’s custom `Validate runtime versions` step to avoid a third copy of the same check and keep all runtime validation inside the composite action.
3. Extract `pnpm run build-gallery-usage` into a single reusable job with uploaded artifacts.
4. Retire the sample `nextjs.yml` workflow so only the customized Pages deployment runs on pushes.

These changes will keep the workflows functionally equivalent while reducing the amount of YAML that must be updated when tool versions or project scripts change.
