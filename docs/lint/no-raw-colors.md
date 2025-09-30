# `design-tokens/no-raw-colors`

The Planner surfaces rely on semantic tokens for theme parity. The custom ESLint rule `design-tokens/no-raw-colors` blocks raw color literals inside:

- `src/components/planner/**/*`
- `src/components/ui/theme/**/*`

## What the rule catches

- Hex values such as `#fff` or `#1a1a1a`
- `rgb()`, `rgba()`, `hsl()`, and `hsla()` usages that do not originate from a token variable
- Tailwind opacity shortcuts like `bg-muted/12` or `text-ring/80`
- Arbitrary class names that encode raw colors, e.g. `bg-[hsl(var(--background)/0.85)]`

## Suggested replacements

| Raw literal | Token-first replacement |
|-------------|------------------------|
| `bg-card/55` | `surface-card-soft` |
| `bg-card/70` | `surface-card-strong` |
| `bg-card/80` | `surface-card-strong-active` |
| `bg-card/85` | `surface-card-strong` |
| `bg-card/90` | `surface-card-strong-today` |
| `bg-accent-3/20` | `bg-interaction-info-tintActive` |
| `bg-accent-3/30` | `bg-interaction-info-surfaceHover` |
| `bg-[hsl(var(--background)/…)]` | Move the backdrop into `style.css` and reference it with a class such as `planner-fab__backdrop`. |

The rule ships with auto-suggestions for the tabulated mappings. When ESLint reports a violation, apply the suggested fix or swap the literal for another surface or interaction utility from `tailwind.config.ts`.

## Codemod

Run the codemod to migrate existing Planner files:

```bash
npm run codemod:planner-colors
```

The codemod rewrites the common background patterns listed above. Review the diff afterward for any context-specific adjustments.

## CI coverage

`npm run check` already runs `npm run lint`, so this rule gates every pull request. The rule prevents new raw literals from entering Planner or theme components and keeps the surfaces aligned with the token contract documented in [`docs/design-system.md`](../design-system.md).
