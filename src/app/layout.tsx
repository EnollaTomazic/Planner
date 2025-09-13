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
        <ThemeProvider>
          <SiteChrome />
          <CatCompanion />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
