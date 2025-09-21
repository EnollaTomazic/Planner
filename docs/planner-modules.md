# Planner Modules

This directory splits the planner logic into focused modules:

- `plannerTypes.ts` – Shared planner type definitions (`ISODate`, `DayRecord`, `Project`, etc.).
- `plannerSerialization.ts` – Pure helpers for decoding storage, computing aggregates, and pruning stale days.
- `plannerContext.tsx` – React contexts with persistent planner data (`days`, `focus`, and selection). Wrap planner pages with `PlannerProvider` and consume state via `useDays`, `useFocus`, and `useSelection`.
- `plannerStore.ts` – Re-exports the shared types, serialization helpers, and context entry points for backwards compatibility.
- `plannerCrud.ts` – Factory for project and task CRUD helpers. Given a day ISO string and an `upsertDay` function, it returns operations like `addProject` and `toggleTask`.
- `usePlannerStore.ts` – Hook exposing persistent planner state and CRUD helpers for the current focus day.
- `useFocusDate.ts` – Hooks for managing the focused date and deriving week information.
- `useSelection.ts` – Hooks for tracking the selected project and task per day.
- `useDay.ts` – Hook returning a convenient view of any day. It derives task counts and reuses `plannerCrud` to mutate the targeted day.

Together these modules provide a clearer entry point for new contributors and eliminate duplicated CRUD code.
