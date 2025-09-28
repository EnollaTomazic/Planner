This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

> **Prerequisite:** Install [Node.js](https://nodejs.org) 22 or newer for full support. Older LTS releases may still run, but expect reduced support and additional warnings.

Copy `.env.example` to `.env.local` before you start the dev server. The sample file documents every supported variable and provides sensible defaults for local work. Update the values to match your repository name, deployment branch, and any API endpoints you integrate.

This project automatically regenerates its UI component export index. The `npm run dev` and `npm run build` commands run `npm run regen-ui` to keep exports in sync, and the `postinstall` script does the same after dependency installs. You can run `npm run regen-ui` manually whenever components are added or removed.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Pages Deployment

Run `npm run deploy` from the project root whenever you're ready to publish. The script rebuilds the site with the correct GitHub Pages base path (`GITHUB_PAGES=true` and `BASE_PATH=<repo>`), then calls the [`gh-pages`](https://github.com/tschaub/gh-pages) CLI with `--nojekyll` so the `.nojekyll` marker is always published. Set `GH_PAGES_BRANCH` (or `GITHUB_PAGES_BRANCH`) if your site publishes from a branch other than the repository's default branch (detected automatically, falling back to `gh-pages`) so the deploy script targets the same branch you serve from.

Before building, the script verifies that a Git push target is configured. If `git remote get-url origin` fails and both `GITHUB_REPOSITORY` and `GITHUB_TOKEN` are missing, the deploy exits early and asks you to add an `origin` remote or supply those environment variables before re-running `npm run deploy`.

When the static files are published to `https://<username>.github.io/<repo>/`, the home page is served from `https://<username>.github.io/<repo>/` rather than the domain root. Use that base path whenever you link to or bookmark the deployed site.

For CI (or any environment that should push automatically), export `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and (optionally) `CI=true` before running the deploy script. When those values are present, the script adds an authenticated remote URL so the push succeeds without additional setup.

Running locally is zero-config in most cases as long as an `origin` remote exists—the script can infer the repository slug from `BASE_PATH`, `GITHUB_REPOSITORY`, your Git remote, or even the folder name if needed. You only need to set `BASE_PATH` manually if none of those sources are available.

To mirror the GitHub Pages behavior in development, provide the repository slug with `BASE_PATH` while enabling the GitHub Pages flag. For example:

```bash
GITHUB_PAGES=true BASE_PATH=<repo> npm run dev
```

Then open `http://localhost:3000/<repo>/` to load the home page under the same base path.

## Configuration Reference

The app reads configuration from your shell environment at build time. Use `.env.local` for local development and your CI provider's secret manager for deployments. The table below lists the available keys, their defaults in `.env.example`, and how they influence the app:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_PATH` | `""` | Repository slug added to exported asset URLs. Required for GitHub Pages deployments so the static site serves from `/<repo>/`. |
| `NEXT_PUBLIC_BASE_PATH` | `""` | Browser-visible base path. Mirror `BASE_PATH` when `GITHUB_PAGES` is `true` to keep runtime navigation and asset fetching in sync. |
| `GITHUB_PAGES` | `false` | Enables GitHub Pages specific behavior in Next.js builds (base path awareness and export tweaks). Set to `true` for GitHub Pages previews or exports. |
| `GITHUB_TOKEN` | `""` | Personal access token used by the deploy script to push from CI. Needs `public_repo` scope for public repositories. Leave empty locally when an `origin` remote is configured. |
| `GITHUB_REPOSITORY` | `""` | `owner/repo` slug resolved by the deploy script when no git remote is available (common in CI). |
| `GH_PAGES_BRANCH` | `gh-pages` | Target branch for the GitHub Pages deploy script. Override if your site publishes from a different branch. |
| `GITHUB_PAGES_BRANCH` | `""` | Optional alias the deploy script reads when `GH_PAGES_BRANCH` is unset. Useful when reusing existing CI variables. |
| `NEXT_PUBLIC_API_*` | _unset_ | Placeholder namespace for future API endpoints (for example, `NEXT_PUBLIC_API_BASE_URL`). Prefix additional public URLs with `NEXT_PUBLIC_` so Next.js exposes them to the client. |

> **Tip:** Keep `.env.local` out of version control. Only `.env.example` belongs in the repository so collaborators and CI pipelines can discover the supported configuration.

## Animations

This app respects your operating system's "reduced motion" setting. If reduced motion is enabled, animations will start disabled. You can override this preference at any time using the lightning bolt toggle in the header.

## Design System

Learn more about the components and guidelines in the [Design System](docs/design-system.md).

## Tokens

Generate design tokens as CSS variables, a JavaScript module, and a Markdown reference with:

```bash
npm run generate-tokens
```

The script shows a progress bar and runs automatically before `npm run build`.

## Contributing

- Before committing, run `npm run verify-prompts` to confirm gallery coverage and `npm run check` to execute tests, lint, and type checks.
- Run `npm run format` before committing to ensure code style consistency.
- When introducing new styles or components, add them to the prompts page (`src/app/prompts/page.tsx`) so they can be previewed.
