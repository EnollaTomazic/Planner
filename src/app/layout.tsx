// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";

import type { Metadata } from "next";
import SiteChrome from "@/components/chrome/SiteChrome";
import { CatCompanion } from "@/components/ui";
import { themeBootstrapScript } from "@/lib/theme";
import Script from "next/script";
import ThemeProvider from "@/lib/theme-context";

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
const noFlash = themeBootstrapScript();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html lang="en" className="theme-lg" suppressHydrationWarning>
      <head>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: noFlash }}
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
          <SiteChrome />
          <CatCompanion />
          <div id="main-content" tabIndex={-1} className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
