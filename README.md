This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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

- Run `npm run check` before committing to run tests, lint, and typecheck.
- Run `npm run format` before committing to ensure code style consistency.
- When introducing new styles or components, add them to the prompts page (`src/app/prompts/page.tsx`) so they can be previewed.
