# React Profiler Workflow

The planner ships with a dedicated development workflow for capturing React profiler traces without accidentally enabling profiling in production builds.

## Prerequisites

- Ensure `SAFE_MODE` (and `NEXT_PUBLIC_SAFE_MODE`) are set to `false` in your local `.env.local`. Profiling is intentionally blocked when safe mode is active so CI and production environments cannot ship profiling bundles by mistake.
- Install dependencies with `pnpm install` so the local Next.js binary is available.

## Start the profiler

Run the dedicated profile script:

```bash
pnpm run profile
```

The script performs the standard prebuild checks, sets `REACT_PROFILER=1`, and launches `next dev` through `scripts/run-next.ts` with the required `--profiling` flag. While the profiler is enabled, the runner also forces the Turbo dev server (`--turbo`) for faster refresh cycles.

If `SAFE_MODE` is still enabled, the script exits early with a clear error so that production environments never launch the profiler.

## Capture traces

1. Open [http://localhost:3000](http://localhost:3000) in Chrome.
2. Open the React Developer Tools Profiler tab.
3. Start a profiling session, interact with the app, then stop recording to analyze the commit timings.

## Return to the standard dev server

Stop the profiler session (`Ctrl+C`) and restart the dev server with the usual command:

```bash
pnpm run dev
```

This restores the default configuration without the profiling flags or Turbo override.
