// src/app/layout.tsx
import "./globals.css";
// Load tokens + per-theme backdrops AFTER globals so overrides win.
import "./themes.css";


import type { Metadata } from "next";
import SiteChrome from "@/components/chrome/SiteChrome";

export const metadata: Metadata = {
  title: "13 League Review",
  description: "Local-first League review with a Lavender-Glitch personality",
};

/**
 * No-flash bootstrap:
 * - Reads ('lg-mode' | 'lg-variant')
 * - (Optional) migrates legacy 'lg-theme' -> new keys
 * - Applies one 'theme-*' class
 * - Only applies '.light' when variant === 'lg'
 */
const noFlash = `
(function () {
  try {
    var MODE_KEY = 'lg-mode';
    var VAR_KEY  = 'lg-variant';
    var BG_KEY   = 'lg-bg';
    var LEGACY   = 'lg-theme';
    var cl = document.documentElement.classList;

    // ---- migrate legacy 'lg-theme' if present ----
    var legacy = localStorage.getItem(LEGACY);
    if (legacy) {
      var migratedMode =
        legacy.indexOf('light') >= 0 ? 'light' : 'dark';
      // Map any old custom names to your new set if needed
      var migratedVariant =
        legacy.indexOf('theme-citrus') >= 0 ? 'citrus' :
        legacy.indexOf('theme-noir')   >= 0 ? 'noir'   :
        'lg';

      try {
        localStorage.setItem(MODE_KEY, migratedMode);
        localStorage.setItem(VAR_KEY, migratedVariant);
        localStorage.removeItem(LEGACY);
      } catch (_) {}
    }

    // ---- read current mode/variant, with sensible fallbacks ----
    var mode = localStorage.getItem(MODE_KEY);
    if (mode !== 'light' && mode !== 'dark') {
      mode =
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark' : 'light';
      try { localStorage.setItem(MODE_KEY, mode); } catch (_) {}
    }

    var variant = localStorage.getItem(VAR_KEY);
    if (!variant) {
      variant = 'lg';
      try { localStorage.setItem(VAR_KEY, variant); } catch (_) {}
    }
      var bg = parseInt(localStorage.getItem(BG_KEY) || '0', 10);
      if (bg !== 1 && bg !== 2 && bg !== 3 && bg !== 4 && bg !== 5) {
        bg = 0;
        try { localStorage.setItem(BG_KEY, String(bg)); } catch (_) {}
      }

    // ---- apply one theme-* class ----
    Array.from(cl).forEach(function (name) {
      if (name.indexOf('theme-') === 0) cl.remove(name);
    });
    cl.add('theme-' + variant);
      ['bg-alt1','bg-alt2','bg-light','bg-vhs','bg-streak'].forEach(function (c) { cl.remove(c); });
      if (bg === 1) cl.add('bg-alt1');
      else if (bg === 2) cl.add('bg-alt2');
      else if (bg === 3) cl.add('bg-light');
      else if (bg === 4) cl.add('bg-vhs');
      else if (bg === 5) cl.add('bg-streak');

    // ---- light only matters for the base LG theme ----
    if (variant === 'lg') {
      if (mode === 'light') cl.add('light'); else cl.remove('light');
    } else {
      cl.remove('light');
    }
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Default SSR state: LG (dark). The no-flash script will tweak immediately.
    <html lang="en" className="theme-lg" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] glitch-root">
        <SiteChrome />
        <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
