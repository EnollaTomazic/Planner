# Design System Usage

This project ships with a small design system based on Tailwind CSS and CSS variables. This guide summarizes how to use it when building new features.

## Tokens
- Color, radius, shadows and transitions are defined as CSS variables in `tailwind.config.ts` and `src/app/themes.css`.
- Use semantic classes like `bg-background`, `text-foreground` and `ring` instead of hard-coded values.
- If you need to introduce a new static color, map it to a token in [`COLOR_MAPPINGS.md`](../COLOR_MAPPINGS.md).
- Input elements use `--control-radius` (16px) for consistent corner rounding.

## Layout and spacing
- Use a 12‑column grid with 24px gutters.
- Spacing scale is limited to 8/12/16/20/24/32px.

## Typography
- Font sizes: 12px for labels, 14px for UI text, 16px for body copy, and 20/24px for titles.
- Tracking: headers `-0.01em`; pills and labels `+0.02em`.
- Use one weight per tier – `500` for UI, `600` for titles.

## Radius and borders
- Corner radius is 16px on all components (pills use full rounding).
- Borders are `1px` solid `hsl(--line/0.35)`; avoid double outlines except on focus rings.

## Texture
- Background scanlines should not exceed `0.08` opacity and grain textures `0.06`.
- Avoid stacking both textures on small components; reserve them for large panels.

## Global styles
- `src/app/globals.css` resets layout, sets typography and applies focus and selection styles.
- Respect the `no-animations` class for reduced motion users. Avoid forcing animations when it is present.

## Primitive components
- Reusable building blocks live under `src/components/ui/primitives` (e.g. `button`, `badge`, `input`).
- Prefer composing these primitives rather than creating bespoke styles.
- Variant props are provided for sizing and icon placement where appropriate.

```tsx
import { Button } from "@/components/ui/primitives/button";

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
