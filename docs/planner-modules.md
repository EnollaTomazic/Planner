# Planner Modules

This directory splits the planner logic into focused modules:

- `plannerStore.ts` – React context with persistent planner data (`days`, `focus`, and selection). Wrap planner pages with `PlannerProvider` and consume the raw store via `usePlannerStore`.
- `plannerCrud.ts` – Factory for project and task CRUD helpers. Given a day ISO string and an `upsertDay` function, it returns operations like `addProject` and `toggleTask`.
- `usePlanner.ts` – Hook exposing high-level planner state for the current focus day. It wires the store with CRUD helpers and also exports selection hooks.
- `useDay.ts` – Hook returning a convenient view of any day. It derives task counts and reuses `plannerCrud` to mutate the targeted day.

Together these modules provide a clearer entry point for new contributors and eliminate duplicated CRUD code.
