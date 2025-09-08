# Design System Usage

This project ships with a small design system based on Tailwind CSS and CSS variables. This guide summarizes how to use it when
building new features.

## Tokens
- Color, radius, shadows and transitions are defined as CSS variables in `tailwind.config.ts` and `src/app/themes.css`.
- Use semantic classes like `bg-background`, `text-foreground` and `ring` instead of hard-coded values.
- If you need to introduce a new static color, map it to a token in [`COLOR_MAPPINGS.md`](../COLOR_MAPPINGS.md).
- A custom ESLint rule (`semantic-tokens/no-raw-colors`) flags Tailwind classes that use unknown tokens or unmapped raw colors.
- Name color tokens in kebab-case with hyphenated numeric variants (e.g. `accent-2`).
- Input elements use `--control-radius` (16px) for consistent corner rounding.

### Adding new colors
1. Add the raw color and its replacement token to [`COLOR_MAPPINGS.md`](../COLOR_MAPPINGS.md).
2. Define the token under `theme.extend.colors` in `tailwind.config.ts`.
3. Use the new token in your components (`bg-your-token`, `text-your-token`, etc.).

### Effects tokens
- `--edge-iris` – iridescent conic gradient for edges and focus rings. Defined in the dark base and re-colored for the Aurora theme ([themes.css](../src/app/themes.css#L69-L76), [Aurora override](../src/app/themes.css#L171-L178)).
- `--seg-active-grad` – linear gradient for active segments such as tabs; the Aurora theme swaps in its green-purple spectrum ([themes.css](../src/app/themes.css#L77-L82), [Aurora override](../src/app/themes.css#L179-L184)).
- `--neon` and `--neon-soft` – default glow color for buttons and accents. `--neon-soft` blends the tone for subtle backgrounds and upgrades via `color-mix` when supported ([themes.css](../src/app/themes.css#L48-L49), [color-mix](../src/app/themes.css#L92)).
- `--card-hairline` – low-contrast border used on cards; gains an accent tint when `color-mix` is available ([themes.css](../src/app/themes.css#L55), [color-mix](../src/app/themes.css#L93-L97)).
- `--shadow` – drop shadow for elevated surfaces; Aurora supplies a lighter variant ([themes.css](../src/app/themes.css#L83), [Aurora override](../src/app/themes.css#L185)).

## Layout and spacing
- Use a 12‑column grid with 24px gutters.
- Spacing tokens: `1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=24px, `6`=32px, `7`=48px, `8`=64px.

## Typography
- Font sizes: 12px for labels, 14px for UI text, 16px for body copy, and 20/24px for titles.
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

## Primitive components
- Reusable building blocks live under `src/components/ui/primitives` (e.g. `Button`, `Badge`, `Input`).
- Prefer composing these primitives rather than creating bespoke styles.
- Variant props are provided for sizing and icon placement where appropriate.
- `Input` fields reuse their generated `id` as the default `name` to avoid
  collisions when several fields share the same label. Supply a custom `name`
  (or `id`) if you need specific form field identifiers.
- Control height is set via a `height` prop that accepts `"sm" | "md" | "lg"`
  or a numeric Tailwind token (e.g. `12` for `h-12`). The native `size`
  attribute remains available for setting character width.

```tsx
import { Button } from "@/components/ui/primitives/Button";

export function Submit() {
  return (
    <Button className="bg-primary text-primary-foreground">Save</Button>
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

## SearchBar
- Wraps its input in a `<form role="search">` for accessibility.
- Submitting the form calls `onValueChange` immediately and optionally `onSubmit` with the current query.
- Disables `autoComplete`, `autoCorrect`, `spellCheck`, and `autoCapitalize` by default for consistent text entry.

```tsx
import { SearchBar } from "@/components/ui";

export function Demo() {
  return (
    <SearchBar
      value=""
      onValueChange={() => {}}
      onSubmit={(q) => console.log(q)}
    />
  );
}
```
