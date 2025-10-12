# Workflow Redundancy Analysis

This document highlights areas where the GitHub Actions workflows can be simplified by eliminating repeated logic or consolidating overlapping automation. Recommendations focus on reducing maintenance overhead while preserving the existing quality gates.

## Repeated runtime validation steps

The CI workflow now relies exclusively on the shared `setup-node-project` composite action for provisioning Node.js and pnpm across every matrix entry, eliminating the bespoke shell snippets that previously re-parsed `.nvmrc` in each job. The action itself performs the Node.js assertion by comparing the active runtime against either the supplied override or the repository’s version file, so the pipeline keeps a single source of truth for tool validation while avoiding redundant setup commands.【F:.github/actions/setup-node-project/action.yml†L5-L266】【F:.github/workflows/ci.yml†L82-L130】

## Rebuilding gallery metadata in every job

Instead of re-running `pnpm run build-gallery-usage` on every runner, the CI pipeline now introduces a `prepare-gallery` job that builds the manifest once, uploads the generated files, and shares them with downstream quality gates. Each matrix task downloads the artifact before executing its checks, ensuring consistent gallery metadata without burning extra minutes on duplicate builds.【F:.github/workflows/ci.yml†L21-L88】

## Parallel deployment workflows

The stock `nextjs.yml` Pages workflow has been removed so that only the custom `deploy-pages.yml` automation runs on pushes. This avoids duplicate deployments and keeps environment validation centralized within the bespoke workflow.【F:.github/workflows/deploy-pages.yml†L1-L70】

## Current status

The redundant runtime checks, manifest rebuilds, and overlapping deployment workflows identified in the original analysis have been addressed through the updates above, leaving the GitHub Actions configuration leaner and easier to maintain.
