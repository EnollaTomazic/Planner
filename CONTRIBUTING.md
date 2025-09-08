# Contributing

## UI components

When adding a new UI component or style under `src/components/ui`, run:

```bash
npm run regen-ui
```

This regenerates `src/components/ui/index.ts` so pages can import the component from `@/components/ui`.

After running the script, add a demo of the new component to `src/app/prompts/page.tsx` so it appears in the prompts gallery.

`npm run build` runs the regeneration step automatically, but running it manually keeps the index and prompts page current during development.
