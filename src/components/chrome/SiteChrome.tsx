"use client";

import * as React from "react";
import NavBar from "@/components/chrome/NavBar";
import ThemeToggle from "@/components/ui/theme/ThemeToggle";
import AnimationToggle from "@/components/ui/AnimationToggle";
import { PageShell } from "@/components/ui";
import Link from "next/link";
import "@/app/globals.css";

/**
 * SiteChrome — sticky top bar with Lavender-Glitch hairline
 * - Uses .sticky-blur (backdrop + border) from globals.css
 * - Full-width container; content constrained by .page-shell
 * - Z-index > heroes, so it stays above scrolling headers
 */
export default function SiteChrome() {
  return (
    <header role="banner" className="sticky top-0 z-50 sticky-blur">
      {/* Bar content */}
      <PageShell className="flex items-center justify-between py-[var(--space-3)]">
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center gap-[var(--space-3)]"
        >
          <span
            className="h-[var(--space-2)] w-[var(--space-2)] rounded-full animate-pulse bg-[hsl(var(--accent-overlay))] shadow-[0_0_6px_hsl(var(--glow-active))]"
            aria-hidden
          />
          <span className="font-mono tracking-wide text-muted-foreground">
            noxi
          </span>
        </Link>

        <div className="flex items-center gap-[var(--space-3)]">
          <div className="hidden min-w-0 items-center md:flex md:flex-1">
            <NavBar />
          </div>
          <ThemeToggle />
          <AnimationToggle />
        </div>
      </PageShell>

      {/* Hairline (neon-friendly, non-interactive) */}
      <div
        aria-hidden
        className="pointer-events-none h-[var(--hairline-w)] w-full bg-[linear-gradient(90deg,transparent,hsl(var(--border)),transparent)]"
      />
    </header>
  );
}
