This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

> **Prerequisite:** Install [Node.js](https://nodejs.org) 22 or newer for full support. Older LTS releases may still run, but expect reduced support and additional warnings.

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

Run `npm run deploy` from the project root whenever you're ready to publish. The script rebuilds the site with the correct GitHub Pages base path (`GITHUB_PAGES=true` and `NEXT_PUBLIC_BASE_PATH=/&lt;repo&gt;`), then calls the [`gh-pages`](https://github.com/tschaub/gh-pages) CLI with `--nojekyll` so the `.nojekyll` marker is always published. Set `GH_PAGES_BRANCH` (or `GITHUB_PAGES_BRANCH`) if your site publishes from a branch other than `gh-pages` so the deploy script targets the same branch you serve from.

Before building, the script verifies that a Git push target is configured. If `git remote get-url origin` fails and both `GITHUB_REPOSITORY` and `GITHUB_TOKEN` are missing, the deploy exits early and asks you to add an `origin` remote or supply those environment variables before re-running `npm run deploy`.

When the static files are published to `https://<username>.github.io/<repo>/`, the home page is served from `https://<username>.github.io/<repo>/` rather than the domain root. Use that base path whenever you link to or bookmark the deployed site.

For CI (or any environment that should push automatically), export `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and (optionally) `CI=true` before running the deploy script. When those values are present, the script adds an authenticated remote URL so the push succeeds without additional setup.

Running locally is zero-config in most cases as long as an `origin` remote exists—the script can infer the repository slug from `NEXT_PUBLIC_BASE_PATH`, `GITHUB_REPOSITORY`, your Git remote, or even the folder name if needed. You only need to set `NEXT_PUBLIC_BASE_PATH` manually if none of those sources are available.

To mirror the GitHub Pages behavior in development, provide the repository slug with `NEXT_PUBLIC_BASE_PATH` while enabling the GitHub Pages flag. For example:

```bash
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/<repo> npm run dev
```

Then open `http://localhost:3000/<repo>/` to load the home page under the same base path.

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

- Before committing, run `npm run check` to execute tests, lint, and type checks.
- Run `npm run format` before committing to ensure code style consistency.
- When introducing new styles or components, add them to the prompts page (`src/app/prompts/page.tsx`) so they can be previewed.
