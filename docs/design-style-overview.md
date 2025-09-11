# Design & Style Overview

This file summarizes all folders relevant to the design system and styling.

## Tools & Libraries

- React and Next.js provide the application foundation.
- Tailwind CSS and CSS variables express design tokens.
- Storybook showcases components in isolation.
- TypeScript supplies static typing.

## Visual Style

### Grid & Spacing

Layouts follow a 12-column grid. Spacing tokens `spacing-1`–`spacing-8` (4–64px) keep margins and gaps consistent.

### Color Palette

Surfaces use deep indigo tokens (`surface`, `surface-2`) with muted violet backgrounds. Bright lavender `primary` and magenta or cyan accents (`accent`, `accent-2`) highlight actions, while semantic colors (`danger`, `warning`, `success`) communicate state.

Key color tokens:

- `background` – near-black indigo canvas behind all screens.
- `surface` / `surface-2` – slightly lighter panels for cards and sheets.
- `foreground` – near-white text that contrasts on dark surfaces.
- `card` / `panel` – raised surfaces for cards and secondary panels.
- `border` / `line` – subtle outlines and dividers.
- `input` – lighter field for form controls.
- `primary` / `primary-foreground` – lavender actions with readable text.
- `accent` / `accent-2` / `accent-foreground` – magenta and cyan secondary accents.
- `ring` / `ring-muted` – violet focus outline and subtle borders.
- `muted` / `muted-foreground` – subdued surfaces and low‑emphasis text.
- `danger` / `warning` / `success` – red, amber, and pink semantic messages.
- `glow` – magenta aura used for active edges and effects.
- `icon-fg` – lavender tint for icon strokes and fills.

### Typography

Text follows the token ramp from compact captions to bold display headings. High-contrast `foreground` colors ensure readability on all surfaces.

### Interaction & States

Interactive elements reference `hover`, `ring`, `active`, `disabled`, and `loading` tokens. Corners draw from `radius-md`–`radius-xl` (8–16px), `shadow` adds depth, and motion tokens (`dur-quick`, `dur-chill`, `dur-slow`) provide smooth, reduced-motion-aware transitions.

## Directories

- `tokens/` – design tokens (colors, spacing, typography) consumed by Tailwind CSS and components
  - `tokens.css` – generated CSS variables
  - `tokens.js` – token definitions
- `docs/` – design documentation in Markdown
  - `design-system.md`
  - `tokens.md`
  - `planner-modules.md`
  - `qa-manual.md`
  - `storage-helpers.md`
  - `design-style-overview.md`
- `src/components/` – React UI components styled with Tailwind CSS
  - `chrome/`, `goals/`, `home/`, `planner/`, `prompts/`, `reviews/`, `team/`
  - `ui/` – primitives and shared elements
    - `primitives/`, `theme/`, `layout/`, `selects/`, `toggles/`, `feedback/`, `league/`
- `src/icons/` – React icon components
  - `ProgressRingIcon.tsx`, `TimerRingIcon.tsx`, `index.ts`
- `src/stories/` – Storybook examples in TypeScript
  - `planner/` – `DayRow.stories.tsx`, `ScrollTopFloatingButton.stories.tsx`
- `public/` – static assets
  - `noise.svg`

## Key Concepts

### Design Tokens

Design tokens are the smallest named decisions—colors, spacing, typography—that keep styles consistent. Values in `tokens/` map to CSS variables consumed throughout the app.

**Visual cues:**

- Color tokens map to specific visuals—`background` lays the dark canvas, `surface` tokens raise cards, `foreground` colors text, while `primary`, `accent`, and semantic tokens paint actions and statuses.
- Spacing tokens step in consistent increments to align with the grid.
- Typography tokens follow the predefined ramp from captions to headings.
- Radius and shadow tokens control corner rounding and depth, while motion tokens dictate easing and duration.

### Components

Components compose tokens and primitives into reusable UI pieces. Feature-specific components live in folders like `planner/` or `chrome/`, while shared primitives reside under `src/components/ui/`.

**Visual cues:**

- All parts snap to the 12-column grid and spacing scale.
- Interactive elements expose hover, focus, active, disabled, and loading states.
- Rounded corners and shadows come from tokens so surfaces stay consistent.
- Colors come strictly from tokens—buttons pull `primary` or `accent`, surfaces use `surface`, and focus rings use `ring`.

### Design System

The design system documents how tokens and components work together. Guides in `docs/` describe patterns, accessibility, and the rationale behind visual choices.

### Theme

The theme layer applies tokens to components to provide coherent light, dark, or custom appearances. Utilities in `src/components/ui/theme/` handle theme logic and respect user preferences.

**Visual cues:**

- Neutral backgrounds and text shift between light, dark, and high-contrast modes.
- Accent tokens swap automatically to preserve hierarchy across themes.
- Reduced-motion preferences are honored for transitions and animations.

## Planner Project – Unified Senior Guidelines

### Code & Workflow
- Keep code lean, typed, and consistent.
- Use strict typing; avoid shortcuts that reduce clarity.
- Edits must be minimal in scope, easy to review, and fast to implement.
- Always run checks, tests, and formatting before commit.

### Design System Discipline
- Build everything from tokens and primitives.
- Never hard-code colors, radii, shadows, or spacing; rely on semantic tokens only.
- Respect the 12-column grid and spacing scale.
- Typography follows the predefined ramp; no arbitrary text sizes.
- All interactive elements must define hover, focus, active, disabled, and loading states.

### Components
- Favor composition over invention. Extend existing primitives instead of creating new one-offs.
- Every new or updated building block must also be demonstrated in the component gallery.

### Navigation
- Nav bar state handling must remain untouched and consistent, no change to animation.
- Optimize for value and clarity in how active/inactive states are shown.
- Ensure navigation is simple to edit and extend quickly without breaking existing state behavior.

### Theming & Persistence
- All theme and background preferences must respect the global system and persist reliably across sessions.
- Do not bypass helpers or invent ad-hoc persistence.
- Respect user settings like reduced motion and high contrast at all times.

### Planner Logic
- Use centralized state and CRUD logic. Never duplicate functionality in local components.
- Hooks and context should be the only entry points into planner data.

### Task Suggestions
- Suggestions must be grouped logically (by day, project, or context) so they don’t overlap or conflict.
- Grouping ensures clarity and prevents multiple suggestions from overwriting each other.
- Keep grouping rules consistent across all pages and features.

### Accessibility
- Structure pages with semantic HTML.
- All controls must have visible text or clear ARIA labels.
- Keyboard navigation and focus rings must work everywhere.
- Default contrast levels must always pass accessibility standards.

### Performance & Feedback
- Favor optimizations that reduce unnecessary renders or recalculations.
- Provide clear loading states and consistent empty fallbacks.
- For any long-running process, provide visible progress feedback.
