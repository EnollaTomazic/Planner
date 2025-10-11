# Developer Guide

## Architecture overview
- **Next.js App Router** – The public entrypoint in `app/` re-exports the canonical layout from `src/app/layout.tsx`, which bootstraps global styles, feature flags, theming providers, observability, and shared chrome around all pages. 【F:src/app/layout.tsx†L1-L170】
- **Pages and views** – Feature pages (for example, the home experience) live under `src/app`, often delegating to client components (`page-client.tsx`) that wrap UI in the planner context and shared shells. 【F:src/app/page.tsx†L1-L11】【F:src/app/page-client.tsx†L1-L167】
- **API routes** – Server functionality is implemented with Next.js route handlers in `src/app/api`. Each handler (e.g. `/api/metrics`) exports HTTP verb functions and shares validation, rate limiting, and response shaping logic with supporting libraries. 【F:src/app/api/metrics/route.ts†L1-L152】
- **Shared design system** – Components and pages consume tokens, Tailwind utilities, and gallery/Storybook coverage described in the design system guide. The system emphasizes token-driven styles, multi-theme support, and synchronized gallery previews. 【F:docs/design-system.md†L11-L57】
- **State management** – Planner experiences centralize data inside React context providers that sync to `localStorage` via `usePersistentState`. Supporting hooks expose CRUD helpers, focus tracking, and derived counts through modular files under `src/components/planner`. 【F:docs/data.md†L3-L38】【F:docs/planner-modules.md†L5-L15】
- **AI assistant integration** – The planner agent enforces prompt sanitization, safety budgets, and structured suggestions, while UI surfaces like `PlannerFab` request plans, display results, and handle safe-mode fallbacks. 【F:src/lib/assistant/plannerAgent.ts†L18-L199】【F:src/components/planner/PlannerFab.tsx†L1-L118】

## Naming conventions and folder structure
- **Directory layout** – Use the `app/` directory for routed pages, `src/app/api` for route handlers, `src/components` for UI, and `tokens/` for design primitives; Storybook stories live in `src/stories`. 【F:docs/design-system.md†L16-L23】
- **Components** – Name React components and files in PascalCase (e.g. `PlannerFab.tsx`) and colocate supporting styles or helpers nearby. Export shared planner primitives through the generated `src/components/planner/index.ts` barrel. 【F:src/components/planner/PlannerFab.tsx†L1-L47】【F:src/components/planner/index.ts†L1-L46】
- **Hooks and state utilities** – Prefix reusable hooks with `use`, keep them under the relevant feature folder (`src/components/planner/use*.ts`), and leverage the planner context to read/write state. 【F:src/components/planner/usePlannerStore.ts†L1-L80】【F:docs/planner-modules.md†L7-L15】
- **API handlers** – Add new endpoints inside `src/app/api/<resource>/route.ts`, implementing verb exports (`GET`, `POST`, etc.) that delegate to shared libraries for validation and persistence. 【F:src/app/api/metrics/route.ts†L1-L152】
- **Design system primitives** – Place shared, theme-aware UI primitives under `src/components/ui/primitives` and register visual examples with the gallery/Storybook manifests so documentation stays current. 【F:docs/design-system.md†L20-L38】【F:docs/design-system.md†L101-L155】

## Playbook for adding a component or feature
1. **Plan the API and state needs** – Decide whether existing planner hooks or context provide the data you need; add new selectors or CRUD helpers under `src/components/planner` if required, keeping persistence logic within the established modules. 【F:docs/planner-modules.md†L5-L15】
2. **Build with tokens and primitives** – Compose UI from existing primitives in `src/components/ui` and adhere to the token usage guidance in the design system. Avoid bespoke utility stacks so themes stay consistent. 【F:docs/design-system.md†L26-L46】【F:docs/design-system.md†L101-L155】
3. **Document and preview** – Update the component gallery/Storybook entry alongside implementation changes and regenerate manifests with `pnpm run build-gallery-usage` to keep previews synchronized. 【F:docs/design-system.md†L32-L38】
4. **Wire API or assistant flows** – For new server endpoints, add `route.ts` handlers under `src/app/api`. For AI-backed features, reuse the planner agent helpers to enforce token budgets and safe-mode handling when integrating with client UI surfaces. 【F:src/app/api/metrics/route.ts†L1-L152】【F:src/lib/assistant/plannerAgent.ts†L18-L199】【F:src/components/planner/PlannerFab.tsx†L37-L118】
5. **Cross-check accessibility and theming** – Verify focus management, keyboard support, and theme coverage by visiting `/preview/[slug]` or `/preview/theme-matrix` before submitting changes. 【F:docs/design-system.md†L32-L38】

## Working with the design system
Consult [`docs/design-system.md`](./design-system.md) for token definitions, gallery workflows, and component primitives. Consume tokens via Tailwind semantic classes and CSS variables instead of hard-coded values so multi-theme rendering remains correct. 【F:docs/design-system.md†L11-L57】

## Pre-commit checklist
Run the repository quality gates before pushing:
- `pnpm run check`
- `pnpm run verify-prompts`
- Any feature-specific follow-ups (lint, typecheck, Storybook rebuilds) referenced in the design system guide.
