# Developer Guide

## Architecture overview
- **Next.js App Router** – Pages under `app/` load shared layout and providers from `app/`, bootstrapping theming, analytics, and the planner shell.
- **Pages & feature views** – Routed entries live under `app/` and typically delegate to client components in `src/components` for interactive flows.
- **API routes** – Server logic resides in `app/api/<resource>/route.ts`, exposing HTTP verb handlers that call shared libraries for validation, persistence, and rate limiting.
- **Shared design system** – UI builds on the tokens and primitives documented in [`docs/design-system.md`](./design-system.md); Tailwind semantic classes and token-driven CSS variables keep themes in sync.
- **State management** – Planner context providers wrap screens, synchronizing state with persistence helpers and feature-specific hooks colocated beside the UI that consumes them.
- **AI assistant integration** – The assistant lives in `src/lib/assistant`, with UI touchpoints like the floating action button and planner panels orchestrating prompt execution, safety budgets, and results display.

## Naming conventions & folder structure
- **Top-level layout** – Use `app/` for route segments and API handlers, `src/components` for shared UI, `src/lib` for utilities/services, and `tokens/` for design primitives.
- **Components** – Name files and exports in PascalCase (e.g., `PlannerFab.tsx`); colocate tests, stories, and styles next to the component. Surface reusable planner primitives through the generated barrels in `src/components/planner`.
- **Hooks & state** – Prefix reusable hooks with `use`, keep state logic under the relevant feature folder (for example, `src/components/planner/usePlannerStore.ts`), and ensure persistence flows through the existing context modules.
- **API handlers** – Add new endpoints by creating `app/api/<resource>/route.ts`, exporting the verbs you support (`GET`, `POST`, etc.) and delegating shared logic to `src/lib` helpers.
- **Design system assets** – Place token-aware primitives in `src/components/ui/primitives` and register any gallery or Storybook examples under `src/stories` so visual docs remain current.

## Playbook for adding a new component or feature
1. **Plan data and contract** – Confirm whether existing planner contexts, hooks, or API endpoints provide the required state. Extend the nearest hook or create a new file under `src/components/<feature>` when additional logic is needed.
2. **Implement with tokens** – Build UI using primitives from `src/components/ui` and apply design tokens as described in the design system guide. Avoid hard-coded values so light/dark themes stay aligned.
3. **Wire APIs or assistant flows** – Create or update route handlers in `app/api` for any backend changes, and integrate AI-facing work by reusing helpers in `src/lib/assistant` to respect safety guards and prompt verification.
4. **Document the experience** – Add or update Storybook stories and gallery entries for new components. Run the gallery regeneration scripts if required so previews remain synchronized.
5. **Validate UX** – Manually smoke-test keyboard navigation, focus management, and responsive layouts using the preview routes before opening a pull request.

## Working with the design system
Reference [`docs/design-system.md`](./design-system.md) for available tokens, gallery workflows, and component primitives. Consume design tokens through Tailwind semantic classes, CSS variables, or helper utilities rather than inlining raw values so themes, spacing, and typography remain consistent across surfaces.

## Pre-commit checklist
Run these scripts before committing to catch regressions:
- `pnpm run check`
- `pnpm run verify-prompts`
- Any additional lint, type-check, Storybook, or gallery scripts noted in the design system documentation when you touch those areas.
