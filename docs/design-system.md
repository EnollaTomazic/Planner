# Design System Usage

This project ships with a small design system based on Tailwind CSS and CSS variables. This guide summarizes how to use it when building new features.

For governance and enforcement workflows, read [Design System Governance](./design-governance.md).

## Onboarding quickstart

### Core tools

- React with Next.js powers the application shell.
- Tailwind CSS and CSS variables expose the design tokens documented below.
- Storybook and the `/components` gallery surface canonical component states for review.
- TypeScript keeps usage typed and encourages explicit props.

### Directory map

- `tokens/` – source of truth for tokens; `tokens.css` is generated from these definitions.
- `docs/` – system documentation (start with this file, governance, and the tokens reference).
- `src/components/` – feature components and shared primitives under `ui/`.
- `src/icons/` – curated icon set.
- `src/stories/` – Storybook stories that mirror gallery usage.

### Working agreements

- Compose new UI from tokens and primitives; avoid bespoke utility stacks.
- Honour the shared component gallery by updating examples alongside implementation work.
- Respect theme helpers, persistence, and reduced-motion preferences when adding interactions.
- Preserve keyboard and screen reader affordances: semantic landmarks, labelled controls, and visible focus remain non-negotiable.
- Keep contributions scoped and typed, running `pnpm run verify-prompts` to ensure gallery entries are registered and `pnpm run check` (tests, lint, design lint, typecheck) before requesting review.

## Gallery previews

- Run the canonical `pnpm run build-gallery-usage` command after touching gallery files. `pnpm install` runs a postinstall check that regenerates the manifest automatically when it detects gallery changes, but running the command yourself keeps `src/components/gallery/generated-manifest.ts` and the cached preview slugs current while you iterate and ensures Playwright coverage stays in sync.
- Visit `/preview/[slug]` to render a single component or state in isolation. Slugs combine the gallery entry, optional state, and the theme variant (currently Glitch and Aurora). Axis metadata surfaces as `axis-…` query parameters so automation can label captured variants.
- Trigger the **Visual Regression** workflow to record screenshots. It installs the production build, walks every generated preview route through the `@visual` Playwright suite, and uploads diffs when comparisons fail.
- Visit `/preview/theme-matrix` to audit every gallery entry and state across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir, and Hardstuck. The matrix reuses the in-gallery previews, ensuring Playwright screenshots and axe coverage span every theme without triggering layout shift.

## Tokens

- Color, radius, shadows and transitions are defined as CSS variables in `tailwind.config.ts` and `src/app/themes.css`.
- Use semantic classes like `bg-background`, `text-foreground` and `ring` instead of hard-coded values.
- Gradient utilities such as `bg-panel-tilt-strong`, `before:bg-gradient-drip-overlay-compact`, and `after:bg-glitch-overlay` map directly to the tokenized backgrounds documented in [`docs/tokens.md`](tokens.md); prefer them over ad-hoc `linear-gradient(...)` strings so themes can tune overlays without component changes.
- Pair high-chroma fills with the semantic text tokens: `text-warning-foreground` for alert banners, `text-success-foreground` for celebratory fills (including the success glow), `text-on-accent` for accent gradients, `text-accent-foreground` / `text-accent-2-foreground` for accent rails, and `text-danger-foreground` for destructive actions. This ensures the `color-contrast()` fallbacks in `themes.css` stay effective.
- If you need to introduce a new static color, map it to a token in [`COLOR_MAPPINGS.md`](../COLOR_MAPPINGS.md).
- Name color tokens in kebab-case with hyphenated numeric variants (e.g. `accent-2`).
- Input elements use `--control-radius` (16px) for consistent corner rounding.

### Effects tokens

- `--edge-iris` – iridescent conic gradient for edges and focus rings. Defined in the dark base and re-colored for the Aurora theme ([themes.css](../src/app/themes.css#L69-L76), [Aurora override](../src/app/themes.css#L171-L178)).
- `--seg-active-grad` – linear gradient for active segments such as tabs; the Aurora theme swaps in its green-purple spectrum ([themes.css](../src/app/themes.css#L77-L82), [Aurora override](../src/app/themes.css#L179-L184)).
- `--neon` and `--neon-soft` – default glow color for buttons and accents. `--neon-soft` blends the tone for subtle backgrounds and upgrades via `color-mix` when supported ([themes.css](../src/app/themes.css#L48-L49), [color-mix](../src/app/themes.css#L92)).
- `--card-hairline` – low-contrast border used on cards; gains an accent tint when `color-mix` is available ([themes.css](../src/app/themes.css#L55), [color-mix](../src/app/themes.css#L93-L97)).
- `--shadow` – drop shadow for elevated surfaces; Aurora supplies a lighter variant ([themes.css](../src/app/themes.css#L83), [Aurora override](../src/app/themes.css#L185)).
- `--shadow-dropdown` – menu and popover elevation token shared by Tailwind's `shadow-dropdown` utility ([tokens.css](../tokens/tokens.css)).
- `--shadow-neon` – layered neon text glow built from spacing tokens ([themes.css](../src/app/themes.css#L13-L16)).
- `--aurora-g-light` / `--aurora-p-light` – static fallbacks for the aurora gradients when `color-mix` is unavailable. Use them with the `aurora` classes instead of blending alphas manually so the palette remains consistent across browsers.
- `--shadow-inner-sm` / `--shadow-inner-md` / `--shadow-outer-lg` – inset and deep outer shadows that align with the neumorphic depth model. Use the small inner layer for pressed controls, the medium inner layer for sunken panels, and the large outer layer for wide surfaces. Hardstuck and Noir clamp the alpha mix to retain readable foreground contrast across the darker palettes ([themes.css](../src/app/themes.css#L784-L789), [Noir override](../src/app/themes.css#L620-L625)).
- `--glow-primary` – chroma glow tied to `--primary`; upgrades via `color-mix` for richer bloom while honoring each theme's accessibility baseline ([themes.css](../src/app/themes.css#L244-L245), [Hardstuck mix](../src/app/themes.css#L449-L455)).
- `--blob-surface-1` / `--blob-surface-2` / `--blob-surface-3` / `--blob-surface-shadow` – organic surface stops for hero blobs and vignette backgrounds. Default values borrow from the neutral surfaces and receive theme-specific blends in the color-mix block so Hardstuck and Noir lighten their fills without sacrificing depth ([themes.css](../src/app/themes.css#L246-L248), [color-mix overrides](../src/app/themes.css#L433-L470)).
- `--glitch-noise-primary` / `--glitch-noise-secondary` / `--glitch-noise-contrast` – scoped noise overlays for glitch treatments. The base palette keys off accent, ring, and foreground tokens while Hardstuck/Noir swap in greener and ruby-tinted alphas for accessible luminance ([themes.css](../src/app/themes.css#L249-L253), [Hardstuck noise tuning](../src/app/themes.css#L793-L796)).

## Layout and spacing

- Use a 12‑column grid with 24px gutters.
- Spacing tokens: `1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=24px, `6`=32px, `7`=48px, `8`=64px.
- Wrap page-level content with `.page-shell` or the `<PageShell />` component to get the shared container rhythm: `space-6` on
  small screens, `space-7` at `md`, and `space-8` at `lg`. Add vertical padding per view instead of redefining horizontal
  gutters. The shell's maximum width is governed by `--shell-width`, with `--shell-max` available for per-page overrides ([tokens.css](../tokens/tokens.css), [globals.css](../src/app/globals.css)).
- When pairing a hero header with body content, place the hero inside a `<PageShell as="header">` before the `<PageShell as="main">`. The main shell automatically exposes `id="main-content"` so the "Skip to main content" link lands after the header frame.

## Typography

- Font sizes: 12px for labels, 15px for UI text, 19px for body copy, and 24/30px for titles.
- Tracking: headers `-0.01em`; pills and labels `+0.02em`.
- Use one weight per tier – `500` for UI, `600` for titles.

## Radius and borders

- Corner radii follow an 8/12/16/24px scale; most components use 16px while pills are fully rounded.
- Borders are `1px` solid `hsl(--line/0.35)`; avoid double outlines except on focus rings.

## Texture

- Background scanlines should not exceed `0.08` opacity and grain textures `0.06`.
- Avoid stacking both textures on small components; reserve them for large panels.

## Global styles

- `src/app/globals.css` resets layout, sets typography and applies focus and selection styles.
- Respect the `no-animations` class for reduced motion users. Avoid forcing animations when it is present.

## Icons

- Prefer icons from `lucide-react`.
- Define any custom icons in `src/icons` and import them where needed.
- Avoid embedding raw `<svg>` tags in components. An inline SVG remains in `Hero` for a noise texture background.

## Primitive components

- Reusable building blocks live under `src/components/ui/primitives` (e.g. `Button`, `Badge`, `Input`).
- Prefer composing these primitives rather than creating bespoke styles.
- Variant props are provided for sizing and icon placement where appropriate.
- `Input` fields reuse their generated `id` as the default `name` to avoid
  collisions when several fields share the same label. Supply a custom `name`
  (or `id`) if you need specific form field identifiers.
- Control height is set via a `height` prop that accepts `"sm" | "md" | "lg" | "xl"`
  or a control height token (e.g. `var(--control-h-lg)` for large controls). The native `size`
  attribute remains available for setting character width.
- `Button` automatically sizes any `svg` icons based on the `size` option
  and sets icon gaps: `gap-1` for `sm`, `gap-2` for `md`, `gap-3` for `lg`.
- `Button` and `IconButton` share the `variant` options
  `"default" | "neo" | "quiet" | "glitch"`. Legacy aliases map to these
  canonical names (`"primary"` → `"default"`, `"secondary"/"soft"` → `"neo"`,
  `"ghost"/"minimal"` → `"quiet"`).
- When you need the chromatic fill, pick the default variant (or another
  tone/variant pairing from the gallery) so the accent-tinted backgrounds
  and focus shadows replace the neutral panel treatment.

```tsx
import { Button } from "@/components/ui/primitives/Button";
import { Plus } from "lucide-react";

export function Submit() {
  return (
    <Button size="sm">
      <Plus />
      Save
    </Button>
  );
}
```

## Theme system

- `ThemeToggle` (in `src/components/ui/theme`) lets users switch among preset themes and backgrounds while persisting preferences in local storage.
- Apply the provided classes (`bg-intense`, variant names, etc.) to opt into specific theme behavior.

```tsx
import ThemeToggle from "@/components/ui/theme/ThemeToggle";

export function Header() {
  return (
    <header className="flex justify-end p-4">
      <ThemeToggle />
    </header>
  );
}
```

Following these guidelines keeps the interface consistent and lets theme updates propagate automatically.

## Feedback components

### Toast

- Toast surfaces time-sensitive feedback and dismisses itself after `duration` milliseconds.
- Hovering the toast container or focusing any interactive element inside it pauses the auto-dismiss timer until the interaction ends.
- Pass `showProgress` to render a shrinking progress bar that mirrors the remaining time and pauses in sync with hover/focus states.

## Layout components

### Header

- Sticky top bar with a neon underline and high z-index so content scrolls beneath it.
- `tabs` renders a segmented control in the top-right for quick section switching.

### Hero

- HUD-glitch banner built on `Header`.
- `subTabs` adds a secondary segmented tab row; legacy `tabs` prop remains.
- A neon divider forms a neon search row that can host a pill `SearchBar` and optional actions.

## Reviews module

- `ReviewList` swaps to the glitch ghost empty state when no reviews exist. Pair the create action with that prompt instead of leaving an inert list.
- Keep the hero search, sort, and filter controls disabled until a review exists so the locked state communicates that nothing is available yet.
- Respect reduced-motion preferences: the ghost avatar holds still while the button and copy remain available, matching the Storybook coverage for accessibility sign-off.

## SearchBar

- Wraps its input in a `<form role="search">` for accessibility.
- Submitting the form calls `onValueChange` immediately and optionally `onSubmit` with the current query.
- Disables `autoComplete`, `autoCorrect`, `spellCheck`, and `autoCapitalize` by default for consistent text entry.
- Accepts an optional `label` prop that renders the shared `<Label>` component and wires up `htmlFor`/`id` automatically. When you omit `label`, supply your own `aria-labelledby` or `aria-label` as needed.

```tsx
import { SearchBar } from "@/components/ui";

export function Demo() {
  return (
    <SearchBar
      value=""
      onValueChange={() => {}}
      onSubmit={(q) => console.log(q)}
      label="Search tasks"
    />
  );
}
```
