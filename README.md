This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

> **Prerequisite:** Install [Node.js](https://nodejs.org) 22 or newer for full support. Older LTS releases may still run, but expect reduced support and additional warnings.

Copy `.env.example` to `.env.local` before you start the dev server. The sample file documents every supported variable and provides sensible defaults for local work. Update the values to match your repository name, deployment branch, and any API endpoints you integrate.

This project automatically regenerates its UI component export index. The `pnpm run dev` and `pnpm run build` commands run `pnpm run regen-ui` to keep exports in sync, and the `postinstall` script does the same after dependency installs. You can run `pnpm run regen-ui` manually whenever components are added or removed.

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Cleaning runtime artifacts

If `pnpm run check` or `pnpm run guard:artifacts` detect lingering `node-compile-cache` or `tsx-*` directories, run `pnpm run clean:artifacts` to remove them before retrying. The command deletes the caches created by `tsx` so the guard passes on the next run.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Pages Deployment

Run `pnpm run deploy` (or `npm run deploy`) from the project root whenever you're ready to publish. The `deploy:pages` script rebuilds the site with the correct GitHub Pages base path (`GITHUB_PAGES=true` and `BASE_PATH=<repo>`), then calls the [`gh-pages`](https://github.com/tschaub/gh-pages) CLI with `--nojekyll` so the `.nojekyll` marker is always published. Set `GH_PAGES_BRANCH` (or `GITHUB_PAGES_BRANCH`) if your site publishes from a branch other than the repository's default branch (detected automatically, falling back to `gh-pages`) so the deploy script targets the same branch you serve from.

Before building, the script verifies that a Git push target is configured. If `git remote get-url origin` fails and both `GITHUB_REPOSITORY` and `GITHUB_TOKEN` are missing, the deploy exits early and asks you to add an `origin` remote or supply those environment variables before re-running `pnpm run deploy` or `npm run deploy`.

When the static files are published to `https://<username>.github.io/<repo>/`, the home page is served from `https://<username>.github.io/<repo>/` rather than the domain root. Use that base path whenever you link to or bookmark the deployed site. Only repositories that exactly match `https://<username>.github.io` (user/organization GitHub Pages) skip the base path; similarly named repositories such as `docs.github.io` owned by another organization continue to publish under `/<repo>/`.

For CI (or any environment that should push automatically), export `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and (optionally) `CI=true` before running the deploy script. When those values are present, the script adds an authenticated remote URL so the push succeeds without additional setup.

Running locally is zero-config in most cases as long as an `origin` remote exists—the script can infer the repository slug from `BASE_PATH`, `GITHUB_REPOSITORY`, your Git remote, or even the folder name if needed. You only need to set `BASE_PATH` manually if none of those sources are available.

To mirror the GitHub Pages behavior in development, provide the repository slug with `BASE_PATH` while enabling the GitHub Pages flag. For example:

```bash
GITHUB_PAGES=true BASE_PATH=<repo> pnpm run dev
```

Then open `http://localhost:3000/<repo>/` to load the home page under the same base path.

## Configuration Reference

The app reads configuration from your shell environment at build time. Use `.env.local` for local development and your CI provider's secret manager for deployments. The table below lists the available keys, their defaults in `.env.example`, and how they influence the app:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_PATH` | `""` | Repository slug added to exported asset URLs. Required for GitHub Pages deployments so the static site serves from `/<repo>/`. |
| `NEXT_PUBLIC_BASE_PATH` | `""` | Browser-visible base path. Mirror `BASE_PATH` when `GITHUB_PAGES` is `true` to keep runtime navigation and asset fetching in sync. |
| `NEXT_PUBLIC_ENABLE_METRICS` | `"auto"` | Controls the browser web vitals hook. `auto` only ships metrics in production when a metrics endpoint is configured; set to `true`/`false` to force enable or disable respectively. |
| `NEXT_PUBLIC_METRICS_ENDPOINT` | `""` | Absolute or relative URL the browser uses for web vitals submissions. Leave empty to disable metrics when hosting static exports without a backend. |
| `SAFE_MODE` | `false` | Server-side safe mode for AI-assisted tooling. Enable in CI or production when external AI providers should remain isolated from unreleased flows. |
| `NEXT_PUBLIC_SAFE_MODE` | `false` | Client-side mirror of `SAFE_MODE`. Keep the values in sync so browser logic agrees with server enforcement. |
| `NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS` | `true` | Feature flag for SVG numeric filters in the planner UI. Disable if custom deployments hit rendering issues. |
| `NEXT_PUBLIC_DEPTH_THEME` | `false` | Feature flag enabling additional depth theming. Disable to render the legacy flat palette. |
| `NEXT_PUBLIC_ORGANIC_DEPTH` | `false` | Experimental organic depth visuals. Pair with `NEXT_PUBLIC_DEPTH_THEME` when exploring the layered look. |
| `GITHUB_PAGES` | `false` | Enables GitHub Pages specific behavior in Next.js builds (base path awareness and export tweaks). Set to `true` for GitHub Pages previews or exports. |
| `SKIP_PREVIEW_STATIC` | `false` | Disables generating preview routes during `next export`. Useful when slimming down GitHub Pages artifacts. |
| `SENTRY_DSN` | `""` | Server-side Sentry DSN. Provide alongside `SENTRY_ENVIRONMENT` to ship monitoring from production builds. |
| `SENTRY_ENVIRONMENT` | `""` | Human-readable label for server Sentry events (for example, `production` or `preview`). |
| `SENTRY_TRACES_SAMPLE_RATE` | `""` | Overrides the default tracing sample rate server-side. Leave empty to rely on Sentry defaults. |
| `NEXT_PUBLIC_SENTRY_DSN` | `""` | Browser Sentry DSN. Must be set when client-side monitoring is required. |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `""` | Human-readable label for browser Sentry events mirroring the server environment. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | `""` | Overrides the tracing sample rate for browser spans. Leave empty to inherit Sentry defaults. |
| `GITHUB_TOKEN` | `""` | Personal access token used by the deploy script to push from CI. Needs `public_repo` scope for public repositories. Leave empty locally when an `origin` remote is configured. |
| `GITHUB_REPOSITORY` | `""` | `owner/repo` slug resolved by the deploy script when no git remote is available (common in CI). |
| `GH_PAGES_BRANCH` | `gh-pages` | Target branch for the GitHub Pages deploy script. Override if your site publishes from a different branch. |
| `GITHUB_PAGES_BRANCH` | `""` | Optional alias the deploy script reads when `GH_PAGES_BRANCH` is unset. Useful when reusing existing CI variables. |
| `NEXT_PUBLIC_API_*` | _unset_ | Placeholder namespace for future API endpoints (for example, `NEXT_PUBLIC_API_BASE_URL`). Prefix additional public URLs with `NEXT_PUBLIC_` so Next.js exposes them to the client. |
| `NEXT_PUBLIC_UI_GLITCH_LANDING` | `true` | Gates the glitch landing experience. Set to `false` to render the legacy landing layout without glitch overlays while retaining the standard planner preview. |
| `NEXT_PHASE` | _unset_ | Optional Next.js phase override for debugging phase-specific logic. The build sets this automatically in most workflows. |
| `NODE_ENV` | `development` | Runtime environment hint used by Next.js. The build pipeline sets this automatically; override only for advanced debugging. |

> **Tip:** Keep `.env.local` out of version control. Only `.env.example` belongs in the repository so collaborators and CI pipelines can discover the supported configuration.

> **Note:** The gallery usage generator (`pnpm run build-gallery-usage`) defaults both `SAFE_MODE` and `NEXT_PUBLIC_SAFE_MODE` to `"false"` when they are missing so CI and local automation stay aligned with `.env.example` without extra setup.

## Metrics reporting on static hosts

Static exports (including GitHub Pages) no longer bundle a `/api/metrics` Route Handler. To keep the browser reporting hook lightweight and optional:

1. Leave `NEXT_PUBLIC_METRICS_ENDPOINT` empty to skip sending metrics entirely. The hook still runs in development, but production builds detect the missing endpoint and bail before serializing payloads.
2. Point `NEXT_PUBLIC_METRICS_ENDPOINT` at any HTTPS endpoint that accepts the payload defined in [`server/metrics-handler.ts`](server/metrics-handler.ts) if you want to continue aggregating vitals. Relative paths are resolved against `NEXT_PUBLIC_BASE_PATH`, making it safe to deploy a separate collector alongside GitHub Pages assets under the same origin.
3. Reuse the provided handler in your own Node runtime when you need parity with the previous Next.js route:

   ```ts
   import { createServer } from "node:http";

   import { handleMetricsRequest } from "./server/metrics-handler";

   const server = createServer((req, res) => {
     if (req.url === "/metrics" && req.method === "POST") {
       void handleMetricsRequest(req, res);
       return;
     }

     res.statusCode = 404;
     res.end();
   });

   server.listen(process.env.PORT ?? 4000);
   ```

   Deploy that server separately (e.g., on Fly.io, Render, or a simple Node host) and set `NEXT_PUBLIC_METRICS_ENDPOINT=https://<host>/metrics` so the static site can continue forwarding vitals.

## Animations

This app respects your operating system's "reduced motion" setting. If reduced motion is enabled, animations will start disabled. You can override this preference at any time using the lightning bolt toggle in the header.

## Design System

Learn more about the components and guidelines in the [Design System](docs/design-system.md).

## Tokens

Generate design tokens as CSS variables, a JavaScript module, and a Markdown reference with:

```bash
pnpm run generate-tokens
```

The script shows a progress bar and runs automatically before `pnpm run build`.

## Profiling React performance

Use the dedicated profiler workflow when you need detailed commit timing data. The `pnpm run profile` command runs the standard prebuild checks, enables the React profiler flags, and launches the dev server with Turbo for faster iteration. Profiling is blocked automatically when `SAFE_MODE` is active so CI and production builds cannot leak profiling bundles. See [docs/profiling.md](docs/profiling.md) for the full workflow.

## Contributing

- Before committing, run `pnpm run verify-prompts` to confirm gallery coverage and `pnpm run check` to execute tests, lint, and type checks.
- Run `pnpm run format` before committing to ensure code style consistency.
- When introducing new styles or components, add them to the prompts page (`src/app/prompts/page.tsx`) so they can be previewed.
