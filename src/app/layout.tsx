// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";
import "../styles/glitch.css";


import type { Metadata } from "next";
import SiteChrome from "@/components/chrome/SiteChrome";
import { themeBootstrapScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "13 League Review",
  description: "Local-first League review with a Lavender-Glitch personality",
};

/**
 * No-flash bootstrap:
 * - Reads stored theme via namespaced key
 * - Falls back to system preference
 * - Applies appropriate theme classes
 */
const noFlash = themeBootstrapScript();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html lang="en" className="theme-lg" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] glitch-root">
        <SiteChrome />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
