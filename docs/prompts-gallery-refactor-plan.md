# Prompts gallery refactor plan

## Current pain points
- `prompts.gallery.tsx` centralizes imports for almost every UI primitive and feature module, making it slow to navigate and review changes. The import block alone is dozens of lines long and mixes unrelated feature dependencies.【F:src/components/prompts/prompts.gallery.tsx†L40-L120】
- The file defines the gallery spec type, demo data, helper previews, and the section registry in one 5k-line module. Domain fixtures such as `demoPrompts`, `demoPersonas`, and `heroPlannerHighlightsDemo` live beside React components and gallery registration logic, so even small edits cause huge diffs.【F:src/components/prompts/prompts.gallery.tsx†L124-L200】
- Inline React helpers like `PromptsHeaderChipStatePreview` and `PromptsHeaderSearchStatePreview` embed stateful UI logic inside the configuration file. These previews mix hooks, derived state, and presentation logic, which makes the registry hard to reason about and nearly impossible to unit test in isolation.【F:src/components/prompts/prompts.gallery.tsx†L398-L460】
- `LEGACY_SPEC_DATA` stores every gallery entry, variant state, and usage guideline in a single literal. The object spans thousands of lines and feeds directly into `gallerySections`, so adding or removing one spec requires editing the monolith and scrolling through unrelated sections.【F:src/components/prompts/prompts.gallery.tsx†L2067-L2134】【F:src/components/prompts/prompts.gallery.tsx†L5350-L5395】
- The module exports dozens of React elements and ad-hoc helper utilities without a stable public surface, so downstream consumers import deep internals instead of relying on a curated API. This tight coupling blocks incremental refactors because each change risks breaking multiple call sites.【F:src/components/prompts/prompts.gallery.tsx†L320-L396】

## Target architecture
- **Directory layout**
  ```
  src/components/prompts/gallery/
  ├── index.ts                  # Aggregates and exports `defineGallerySection` calls
  ├── sections/
  │   ├── prompts.ts            # Each file exports a `LegacySpec[]` and related preview helpers
  │   ├── personas.ts
  │   └── …
  ├── fixtures/
  │   ├── personas.ts           # Demo data used by previews and feature surfaces
  │   ├── prompts.ts
  │   └── planner.ts
  ├── previews/
  │   ├── PromptsHeaderChipStatePreview.tsx
  │   ├── PromptsHeaderSearchStatePreview.tsx
  │   └── …
  └── utils/
      ├── buildFocusRingClasses.ts
      └── useDemoPrompts.ts
  ```
- `prompts.gallery.tsx` becomes a compatibility shim that re-exports the new `gallery/index.ts` default export while gradually migrating consumers to the new entry point.
- Gallery metadata lives in plain TypeScript objects without React dependencies. Preview components receive fixtures via explicit props so they can be rendered in isolation or lazy-loaded via dynamic imports.

## Incremental migration plan
1. **Establish shared types**
   - Extract `LegacySpec`, `GallerySection`, and related types into `gallery/types.ts`. Replace local type aliases in the monolith with imports from the new module to unblock downstream files.
   - Add `gallery/utils/guards.ts` with narrow runtime asserts (e.g., `assertLegacySpec`) for use in tests and legacy pathways.
2. **Carve out fixtures first**
   - Move demo data literals (personas, prompts, planner highlights) into `gallery/fixtures/`. Re-export from `prompts.gallery.tsx` to avoid churn while updating the initial set of imports.
   - Update any preview helpers that read fixtures from module scope to accept them as props. Keep default props that pipe in the shared fixtures to minimize call-site changes.
3. **Extract preview components**
   - Promote inline helpers (chip/search previews, theme pickers, skeleton loaders) into `gallery/previews/`. Supply explicit props for state, theme, and feature toggles so the components are pure and testable.
   - Where multiple previews share logic (e.g., focus ring styling, persona avatar rendering), introduce small utilities or hooks in `gallery/utils/` and import them across previews.
4. **Split gallery sections**
   - Create one module per gallery section under `gallery/sections/`, exporting a `LegacySpec[]` plus any section-specific helper builders.
   - Replace `LEGACY_SPEC_DATA` with an aggregated map built from the per-section exports. During the transition, keep the existing constant but compose it from the new modules to preserve behavior.
   - Add an integration test that ensures the aggregated spec matches the legacy snapshot (sorted by `id`) before deleting the old literal.
5. **Introduce orchestrator index**
   - Implement `gallery/index.ts` that imports all section arrays and calls `defineGallerySection`. Export both the assembled `gallerySections` map and helper queries.
   - Gradually update feature surfaces to import from `gallery/index.ts`. Once complete, delete the compatibility shim and rename files if necessary.

## Testing and verification strategy
- **Static schema tests**: With the data split per section, add `vitest` suites that import each `LegacySpec[]` and assert unique IDs, required fields, and valid preview factories (ensuring every entry defines `element` and that state previews exist when `states` is populated). These tests can live under `tests/prompts/gallery/` and run quickly because they never mount React components.【F:src/components/prompts/prompts.gallery.tsx†L2067-L2134】【F:src/components/prompts/prompts.gallery.tsx†L5350-L5395】
- **Fixture conformance tests**: Snapshot the exported fixtures to guarantee deterministic data, and add assertions that all fixtures referenced by previews are exported (e.g., `expect(fixtures.prompts['demo']).toBeDefined()`).
- **Component-level tests**: For extracted preview components, use React Testing Library to verify focus rings, skeleton loaders, and conditional rendering logic without touching the registry. For example, render `PromptsHeaderChipStatePreview` with `state="loading"` and assert that the spinner is present and the button is disabled.【F:src/components/prompts/prompts.gallery.tsx†L398-L438】
- **Contract tests for the aggregator**: Once the sections live in separate modules, keep a thin `prompts.gallery.tsx` (or `gallery/index.ts`) that imports them and pipes through `defineGallerySection`. A dedicated test can validate that every exported section ID maps to the expected `GalleryEntryKind` and that previews resolve without throwing, safeguarding future refactors.【F:src/components/prompts/prompts.gallery.tsx†L5350-L5395】
- **Storybook smoke tests**: After the split, configure Storybook stories for each preview. Use Storybook play functions (or Chromatic) to exercise hover/focus interactions and guard against regressions before cutting the legacy module.

## Tooling and automation follow-ups
- Add an ESLint rule or custom lint check that forbids importing from `prompts.gallery.tsx` once the shim is removed, steering new code toward the modular API.
- Create a `pnpm run verify-gallery` script that runs schema tests, component tests, and optional Storybook builds in CI so the refactor stays enforced over time.
- Document the new gallery architecture in `docs/prompts-gallery.md`, including how to add a new section or fixture, and link it from `CONTRIBUTING.md` to guide future contributors.

## Functional isolation ideas
- Introduce a narrow `PromptsGalleryConfig` type that excludes React elements and instead references lazy component factories. This lets you separate static metadata from the components themselves and defer expensive imports until the preview renders.
- Wrap the shared demo data in providers or hooks (e.g., `useDemoPrompts`) so real features and gallery examples consume the same API. That keeps behavior consistent while letting you stub the hooks in unit tests.
- Consider Storybook stories per section once the modules are split. They double as documentation and smoke tests, and Storybook's auto-generated play functions can verify interactive states like hover/focus without editing the monolith.

Implementing the steps above turns `prompts.gallery.tsx` from a 5,000-line catch-all into a maintainable set of focused modules with targeted tests and reusable fixtures.
