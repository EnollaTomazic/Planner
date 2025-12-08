# Lavender-Glitch Layout Unification Plan

This plan documents the current page shells, hero patterns, and card/forms across the primary routes. It also outlines the proposed primitives (PageShell, Hero, Card, ProgressRing, TabBar, InsetInput) and how each page will map to them while keeping the hacked synthwave look.

## Current state (scan)

### Home (`/`)
- **Hero/Header:** Uses `Header` from `src/components/ui/layout/Header` to render the page title and subtitle before loading `HomePlannerIsland`/fallbacks.
- **Cards:** Summary and momentum blocks mix multiple card styles (neo, ghost, and inline panels) with hard-coded spacing in `HomePlannerIsland` and fallback modules.
- **Forms:** Quick-add controls and the AI landing toggle live inside bespoke sections rather than shared inputs.

### Planner (`/planner`)
- **Hero/Header:** `Header` renders title + view-mode tabs; a separate `PlannerHero` handles autopilot text, focus dial, and nudges.
- **Cards:** Day/Week/Month/Agenda views reuse several card shapes for day rows, reminders, and autopilot state.
- **Forms:** Focus dial slider, reminder toggles, and inline editors per task; status banners sit above the grid.

### Goals (`/goals`)
- **Hero/Header:** `Header` with icon + segmented tabs (Goals/Reminders/Timer); summary metrics surface inside `GoalsProgress`.
- **Cards:** Goal queue slots, reminders, and timer all render different card depths and corner radii.
- **Forms:** Goals add form (title/area/time) with inline validation; reminder forms and timer controls use their own inputs.

### Reviews (`/reviews`)
- **Hero/Header:** `Header` with search box and “New review” CTA.
- **Cards:** Review list items, detail editor, and empty/errored states each use separate card components.
- **Forms:** Search input plus inline editable fields for review metadata and notes.

### Team (`/team`)
- **Hero/Header:** Header plus optional tabs for cheat sheet/builder/jungle clears.
- **Cards:** Accordion cheat sheet rows, builder grid tiles, and jungle clears list each have unique card chrome.
- **Forms:** Simple dropdowns/toggles for filters; builder inputs for champion setup.

### Components gallery (`/components`)
- **Hero/Header:** Header with theme toggle; preview wrappers hand-roll padding and spacing.
- **Cards:** Gallery cards vary between raised and flat, with duplicated hover/focus treatments.
- **Forms:** Component knobs are ad-hoc per preview.

### Prompts (`/prompts`)
- **Hero/Header:** Header with search; tabs (Chat/Codex/Notes) above cards.
- **Cards:** Prompt/persona tiles and notes pad each style themselves; AI draft/outputs are plain panels.
- **Forms:** Prompt creation/edit flows live inline with their own inputs and validation.

## Duplicated patterns
- Multiple card shells for stats (home summary), weekly/day planner cards, Quick Summary/Momentum tiles, and Goals add/queue cards.
- Repeated tab controls: planner view tabs (Day/Week/Month/Agenda), theme and preview tabs, cheat sheet/builder/jungle tabs, and prompts tabs.
- Reused forms without a shared inset style: Goals Add, Reviews search, prompt editor, and autopilot inputs.
- Progress donuts appear in Home and Goals but use bespoke SVG wrappers.

## Proposed primitives
- **PageShell:** 12-column grid container with spacing tokens, neon edge option, and low-opacity glitch noise (<=0.06) to standardize shells across pages.
- **Hero:** Unified hero with title, subtitle, optional tabs/actions, and illustration slot; includes soft inner/outer shadows, subtle noise, and accent ring.
- **Card:** Slot-based header/body/footer with `status` states (info/success/error) and optional scanline glitch overlay.
- **ProgressRing:** Accent-aware donut with accessible `role="progressbar"` and token-based track/foreground colors for metrics.
- **TabBar:** Tokenized tablist with `role="tablist"`/`role="tab"`, keyboard roving, and neon/glitch variants for Day/Week/Month/Agenda and other tab sets.
- **InsetInput:** Shared inset styling for search/add forms (Goals Add, Reviews search, Prompts editor) to replace ad-hoc inputs.

## Page sketches using primitives
- **Home:** `PageShell` with top `Hero` (Noxi & Agnes leaning on a `ProgressRing`), action buttons for quick add, and two rows of `Card` stats (Summary, Momentum, AI focus). Noise kept under 0.06 for balance.
- **Planner:** `Hero` replaces autopilot header, embedding focus dial + `ProgressRing` and week tabs (`TabBar`). Day/Week/Month/Agenda panels align to the `PageShell` grid with consistent card chrome.
- **Goals:** `Hero` with overview metrics rendered via `ProgressRing`; goal queue and reminders become `Card` stacks; add form uses `InsetInput` fields.
- **Reviews:** `Hero` with search `InsetInput` and CTA; list/empty states use `Card status="info"`; detail editor inside grid-aligned `Card` columns.
- **Team:** `Hero` with tabbed cheat sheet/builder/jungle sections via `TabBar`; each section uses shared `Card` headers and footers for actions.
- **Components gallery:** Wrap previews in `PageShell` + `Hero` with theme tabs; demos render inside `Card` to show real spacing tokens.
- **Prompts:** `Hero` with search and CTA; tabs via `TabBar`; AI draft/suggestions wrapped in `AIOutput` atop `Card`.

## Character placement
- **Home hero:** Noxi & Agnes posed against the progress ring.
- **Planner autopilot:** Agnes balancing the focus dial beside the `Hero` illustration slot.
- **Goals overview:** Noxi guiding the donut metrics with glowing horns.
- **Reviews empty state:** Noxi writing notes while Agnes peeks over a `Card` edge.
- **Team builder:** Both characters selecting champions in the builder grid.

