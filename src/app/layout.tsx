// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";

import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  geistMonoVariable,
  geistSansClassName,
  geistSansVariable,
} from "./fonts";
import tokens from "../../tokens/tokens.js";
import SiteChrome from "@/components/chrome/SiteChrome";
import { CatCompanion, PageShell } from "@/components/ui";
import { withBasePath } from "@/lib/utils";
import Script from "next/script";
import ThemeProvider from "@/lib/theme-context";
import { THEME_BOOTSTRAP_SCRIPT_PATH } from "@/lib/theme";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";

export const metadata: Metadata = {
  title: {
    default: "Planner",
    template: "%s · Planner",
  },
  description: "Local-first planner for organizing tasks and goals",
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: `hsl(${tokens.background})`,
    },
    {
      media: "(prefers-color-scheme: light)",
      color: `hsl(${tokens.foreground})`,
    },
  ],
};

/**
 * No-flash bootstrap:
 * - Reads stored theme via namespaced key
 * - Falls back to system preference
 * - Applies appropriate theme classes
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let nonce: string | undefined;
  const year = new Date().getFullYear();

  if (process.env.GITHUB_PAGES === "true") {
    // Static exports (GitHub Pages) do not provide response headers,
    // so skip reading the nonce in that environment.
    nonce = undefined;
  } else {
    const nonceHeader = await headers();
    nonce = nonceHeader.get("x-nonce") ?? undefined;
  }
  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html
      lang="en"
      className="theme-lg"
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
    >
      <head>
        {nonce ? <meta property="csp-nonce" content={nonce} /> : null}
        <meta name="color-scheme" content="dark light" />
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          nonce={nonce}
          src={withBasePath(THEME_BOOTSTRAP_SCRIPT_PATH)}
        />
      </head>
      <body
        className={`${geistSansClassName} ${geistSansVariable} ${geistMonoVariable} min-h-screen bg-background text-foreground glitch-root`}
      >
        <a
          className="fixed left-[var(--space-4)] top-[var(--space-4)] z-50 inline-flex items-center rounded-[var(--radius-lg)] bg-background px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium text-foreground shadow-outline-subtle outline-none transition-all duration-quick ease-out opacity-0 -translate-y-full pointer-events-none focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:shadow-ring focus-visible:no-underline focus-visible:outline-none hover:shadow-ring focus-visible:active:translate-y-[var(--space-1)]"
          href="#main-content"
        >
          Skip to main content
        </a>
        <noscript>
          <div
            role="status"
            className="w-full border-b border-border bg-surface px-[var(--space-4)] py-[var(--space-2)] text-center text-ui font-medium text-foreground"
          >
            Animations stay optional—Planner works fully without JavaScript.
          </div>
        </noscript>
        <StyledJsxRegistry nonce={nonce}>
          <ThemeProvider>
            <div aria-hidden className="page-backdrop">
              <div className="page-shell">
                <div className="page-backdrop__layer" />
              </div>
            </div>
            <SiteChrome>
              <CatCompanion />
              <div className="relative z-10">
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <footer
                  role="contentinfo"
                  className="mt-[var(--space-8)] border-t border-border bg-surface"
                >
                  <PageShell
                    className="flex flex-col gap-[var(--space-1)] text-label text-muted-foreground md:flex-row md:items-center md:justify-between"
                    padding={5}
                  >
                    <p className="text-ui font-medium text-foreground">
                      Planner keeps local-first goals organized so every ritual stays actionable.
                    </p>
                    <p>© {year} Planner Labs. All rights reserved.</p>
                  </PageShell>
                </footer>
              </div>
            </SiteChrome>
          </ThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
