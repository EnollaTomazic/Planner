// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import SiteChrome from "@/components/chrome/SiteChrome";
import { CatCompanion, PageShell } from "@/components/ui";
import { withBasePath } from "@/lib/utils";
import Script from "next/script";
import ThemeProvider from "@/lib/theme-context";
import { THEME_BOOTSTRAP_SCRIPT_PATH } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "Planner",
    template: "%s · Planner",
  },
  description: "Local-first planner for organizing tasks and goals",
};

/**
 * No-flash bootstrap:
 * - Reads stored theme via namespaced key
 * - Falls back to system preference
 * - Applies appropriate theme classes
 */
const htmlStyle = {
  "--asset-noise-url": `url('${withBasePath("/noise.svg")}')`,
  "--asset-glitch-gif-url": `url('${withBasePath("/glitch-gif.gif")}')`,
} as CSSProperties;

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
      style={htmlStyle}
    >
      <head>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          nonce={nonce}
          src={withBasePath(THEME_BOOTSTRAP_SCRIPT_PATH)}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground glitch-root">
        <a
          className="fixed left-[var(--space-4)] top-[var(--space-4)] z-50 inline-flex items-center rounded-[var(--radius-lg)] bg-background px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium text-foreground shadow-outline-subtle outline-none transition-all duration-[var(--dur-quick)] ease-[var(--ease-out)] opacity-0 -translate-y-full pointer-events-none focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:shadow-ring focus-visible:no-underline focus-visible:outline-none hover:shadow-ring focus-visible:active:translate-y-[var(--space-1)]"
          href="#main-content"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <div aria-hidden className="page-backdrop">
            <div className="page-shell">
              <div className="page-backdrop__layer" />
            </div>
          </div>
          <SiteChrome />
          <CatCompanion />
          <div className="relative z-10">
            {children}
            <footer
              role="contentinfo"
              className="mt-[var(--space-8)] border-t border-border bg-surface"
            >
              <PageShell className="flex flex-col gap-[var(--space-1)] py-[var(--space-5)] text-label text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p className="text-ui font-medium text-foreground">
                  Planner keeps local-first goals organized so every ritual stays actionable.
                </p>
                <p>© {year} Planner Labs. All rights reserved.</p>
              </PageShell>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
