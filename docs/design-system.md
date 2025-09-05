# Design System Usage

This project ships with a small design system based on Tailwind CSS and CSS variables. This guide summarizes how to use it when building new features.

## Tokens
- Color, radius, shadows and transitions are defined as CSS variables in `tailwind.config.ts` and `src/app/themes.css`.
- Use semantic classes like `bg-background`, `text-foreground` and `ring` instead of hard-coded values.
- If you need to introduce a new static color, map it to a token in [`COLOR_MAPPINGS.md`](../COLOR_MAPPINGS.md).
- Input elements use `--control-radius` (16px) for consistent corner rounding.

## Global styles
- `src/app/globals.css` resets layout, sets typography and applies focus and selection styles.
- Respect the `no-animations` class for reduced motion users. Avoid forcing animations when it is present.

## Primitive components
- Reusable building blocks live under `src/components/ui/primitives` (e.g. `Button`, `Badge`, `Input`).
- Prefer composing these primitives rather than creating bespoke styles.
- Variant props are provided for sizing and icon placement where appropriate.

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
