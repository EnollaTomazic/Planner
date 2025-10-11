# Developer Guide

## Architecture overview
- **Next.js app directory** – The app shell lives under `src/app`, with the root layout wiring global providers, feature flags, design tokens, and shared chrome for every page render.【F:src/app/layout.tsx†L1-L175】
- **Page and route organization** – Application pages reside in nested route groups inside `src/app`, while API endpoints are implemented as Route Handlers under `src/app/api` (for example the metrics ingestion handler).【F:src/app/layout.tsx†L67-L173】【F:src/app/api/metrics/route.ts†L1-L152】
- **Shared design system** – Tailwind-powered primitives and tokens underpin every feature; the design system guide outlines the canonical directories, gallery coverage, and working agreements for consuming those tokens.【F:docs/design-system.md†L1-L121】
- **State management** – Feature modules expose persistent, local-first state via React context providers and hooks. The planner feature is representative: context providers persist day, focus, and reminder data, while hooks such as `usePlannerStore` coordinate CRUD helpers and legacy migrations.【F:src/components/planner/plannerContext.tsx†L1-L200】【F:src/components/planner/usePlannerStore.ts†L1-L132】
- **AI assistant integration** – The planner assistant agent enforces prompt sanitation, token budgeting, and schema validation before surfacing suggestions to the UI, keeping safe-mode limits aligned with the broader AI guardrails documented in the README.【F:src/lib/assistant/plannerAgent.ts†L1-L200】【F:README.md†L128-L154】

## Naming conventions & folder structure
- **Components** – Place shared primitives in `src/components/ui/primitives` and compose feature-specific components within feature folders (e.g. `src/components/planner`). Keep exports synchronized via the auto-generated feature barrels (see `src/components/planner/index.ts`).【F:docs/design-system.md†L18-L121】【F:src/components/planner/index.ts†L1-L46】
- **Design tokens & theming** – Declare new tokens in `tokens/` and consume them through the semantic Tailwind utilities and CSS variables documented in the design system guide. Avoid hard-coded values; instead, rely on classes such as `bg-background`, gradient helpers, and shared radii tokens so themes remain consistent.【F:docs/design-system.md†L40-L70】
- **API handlers** – Add server endpoints under `src/app/api/<route>/route.ts`, mirroring the existing metrics handler pattern. Each handler can export the HTTP verbs it supports and share logic from `src/lib` as needed.【F:src/app/api/metrics/route.ts†L1-L152】
- **State logic** – Co-locate stateful hooks, serializers, and context providers with their feature folders (`usePlannerStore`, `plannerContext`, etc.) to keep persistence utilities near their consumers. Persisted state should reuse the shared `@/lib/db` helpers to stay hydration-safe.【F:src/components/planner/plannerContext.tsx†L1-L200】【F:src/components/planner/usePlannerStore.ts†L1-L132】

## Playbook: adding a component or feature
1. **Scaffold the UI** inside the appropriate feature folder or `src/components/ui/primitives` if it becomes a reusable primitive. Export it through the relevant barrel so downstream imports remain stable.【F:docs/design-system.md†L18-L121】【F:src/components/planner/index.ts†L1-L46】
2. **Style with tokens** by pulling semantic classes or CSS variables from the design system instead of bespoke utility stacks. Reference `docs/design-system.md` for gradients, spacing, and typography guidance.【F:docs/design-system.md†L40-L121】
3. **Wire up state** via existing context providers or new hooks colocated with the feature. Leverage `@/lib/db` persistence helpers when storing client state to preserve hydration safety.【F:src/components/planner/plannerContext.tsx†L1-L200】【F:src/components/planner/usePlannerStore.ts†L1-L132】
4. **Update previews & docs** – Refresh the component gallery or Storybook entries so design reviewers can inspect new states. Run `pnpm run build-gallery-usage` when gallery entries change and mirror coverage in `storybook/` where applicable.【F:docs/design-system.md†L24-L38】
5. **Validate AI touchpoints** if the feature interacts with assistant flows. Sanitize prompts, respect safe-mode ceilings, and reuse the planner agent’s schema enforcement patterns.【F:src/lib/assistant/plannerAgent.ts†L1-L200】【F:README.md†L128-L154】

## Consuming design tokens
Continue to follow the [design system guide](./design-system.md) for token usage. Compose UI from the provided semantic Tailwind classes, gradients, and CSS custom properties so theme variants and gallery previews stay in sync.【F:docs/design-system.md†L1-L70】

## Pre-commit checklist
Run the project’s validation scripts before pushing:
- `pnpm run check` – aggregated lint, type, and test suite.【F:AGENTS.md†L13-L20】
- `pnpm run verify-prompts` – required when prompts or AI behaviors change.【F:AGENTS.md†L17-L20】
- Regenerate component indexes or gallery data if you touched UI exports: `pnpm run regen-ui`, `pnpm run build-gallery-usage`, and other feature scripts noted in the repository README.【F:README.md†L16-L21】【F:docs/design-system.md†L24-L38】
