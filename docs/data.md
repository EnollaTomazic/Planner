# Planner Data Persistence

## Local storage state managed by `PlannerProvider`

`PlannerProvider` wraps planner screens and wires planner data into React context hooks. It keeps planner state in sync with `localStorage` through `usePersistentState`, which hydrates client-side after mount and writes changes with a debounced queue. All storage keys are namespaced via `createStorageKey` (e.g. allowing multi-tenant prefixes) and fall back to legacy prefixes when present. 【F:src/components/planner/PlannerProvider.tsx†L199-L218】【F:src/lib/db.ts†L333-L436】

The provider persists three primary concerns:

- **Daily planner records** – `usePersistentState<Record<ISODate, DayRecord>>("planner:days", ...)` stores all projects, tasks, per-day metadata, and derived lookups. Custom decoders rebuild task indexes and counts when hydrating. 【F:src/components/planner/PlannerProvider.tsx†L199-L241】【F:src/components/planner/plannerSerialization.ts†L31-L88】
- **Focused day** – `usePersistentState<ISODate>("planner:focus", ...)` remembers which date the UI should emphasize. A placeholder is replaced with `todayISO()` on first load to avoid stale focus. 【F:src/components/planner/PlannerProvider.tsx†L203-L236】【F:src/components/planner/PlannerProvider.tsx†L243-L263】
- **Goals** – `usePersistentState<Goal[]>("goals.v2", ...)` tracks the current goal list, undo stack, and cap validation. Decoder upgrades allow backward-compatible hydration from older goal schemas. 【F:src/components/planner/PlannerProvider.tsx†L214-L308】

### Legacy key migration

`usePersistentState` automatically checks for historical prefixes and removes migrated keys after a successful load to keep storage tidy. In addition, `usePlannerStore` migrates planner day data from pre-v2 `planner:projects` / `planner:tasks` snapshots if they are discovered. The migration ensures derived counts and task lookup tables are rebuilt before removing the legacy entries. 【F:src/lib/db.ts†L373-L436】【F:src/components/planner/usePlannerStore.ts†L1-L88】

## Abstracting the persistence layer

To swap `localStorage` for another backend without rewriting planner logic, introduce a storage facade and provider boundary:

1. **Define a `PlannerPersistence` interface** (e.g. `{ load(): Promise<PlannerSnapshot>; save(update): Promise<void>; subscribe(handler): Unsubscribe }`) covering CRUD needs for days, focus, and goals.
2. **Implement adapters**: start with a `LocalStoragePersistence` that wraps `usePersistentState` / `scheduleWrite` to match the interface, then add remote adapters for services like Supabase, Firebase Firestore, or a custom REST API.
3. **Wrap the interface in context**: create a `PlannerPersistenceProvider` that injects the active adapter (local by default) and update `PlannerProvider` to use the abstraction for hydration and writes. This keeps React stateful logic intact while swapping the persistence backend.
4. **Provide hooks** (`usePlannerPersistence`) to access the interface, enabling feature-specific hooks to opt into remote sync (e.g. when a user signs in).

When integrating third-party services:

- **Supabase** – Implement the interface with Supabase client queries (e.g. `supabase.from("planner_days")`). Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables and initialize the client inside the persistence provider. Ensure row-level security policies mirror local validation.
- **Firebase (Firestore)** – Wrap Firestore reads/writes inside the adapter, using batched writes for daily snapshots. Supply `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and related config keys expected by `initializeApp`. Guard SSR imports by lazy-loading the SDK in `useEffect`.
- **Custom REST API** – Compose `fetch` helpers for planner resources (`/api/planner/days`, `/api/planner/goals`) and exchange JWT or session cookies as required. Document any `NEXT_PUBLIC_API_BASE_URL` needed for browser calls.

## Syncing and rehydrating with external services

1. **Hydration** – On sign-in, fetch the remote snapshot and merge it with the in-memory local state. Respect `decodePlannerDays` invariants to rebuild derived fields before committing the merge. Provide a manual "Resync" action if schema mismatches occur.
2. **Optimistic updates** – Keep local UI latency-free by applying updates immediately, queuing remote writes via the persistence interface. Reconcile failures by rolling back using stored patches or refreshing the affected day from the backend.
3. **Conflict resolution** – Use `updatedAt` timestamps per day/goal to detect divergent edits. Prefer last-write-wins for simplicity, but expose hooks for manual conflict resolution (e.g. prompt the user when both local and remote changes exist within a merge window).
4. **Background refresh & storage sync** – Reuse `usePersistentState`'s `storage` event handling to update open tabs. For remote backends, register realtime listeners (Supabase channels, Firestore snapshots, or SSE) and funnel payloads through the same merge utility.
5. **Environment & SDK setup** – Ensure adapter-specific environment variables are injected via `.env` and surfaced in documentation. When bundling SDKs, respect Next.js dynamic import patterns and the project's logging hooks (`persistenceLogger`) for visibility.

By centralizing persistence responsibilities behind an interface, the planner can evolve from local-only storage to hybrid or fully remote backends without rewriting UI flows, while preserving offline-first behavior for unauthenticated users.
