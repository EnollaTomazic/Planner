"use client";

import "@/app/globals.css";
import * as React from "react";
import NavBar from "@/components/chrome/NavBar";
import BottomNav from "@/components/chrome/BottomNav";
import BrandWordmark from "@/components/chrome/BrandWordmark";
import ThemeToggle from "@/components/ui/theme/ThemeToggle";
import AnimationToggle from "@/components/ui/AnimationToggle";
import { PageShell } from "@/components/ui";
import Link from "next/link";

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
      <PageShell
        grid
        className="pt-[var(--space-3)] pb-0 md:pb-[var(--space-3)]"
        contentClassName="items-center"
      >
        <Link
          href="/"
          aria-label="Home"
          className="col-span-full flex items-center gap-[var(--space-3)] md:col-span-3 lg:col-span-3"
        >
          <span
            className="h-[var(--space-2)] w-[var(--space-2)] rounded-full animate-pulse bg-[hsl(var(--accent-overlay))] shadow-[var(--shadow-glow-sm)]"
            aria-hidden
          />
          <BrandWordmark />
        </Link>

        <div className="col-span-full hidden min-w-0 items-center md:col-span-6 md:flex lg:col-span-7">
          <NavBar />
        </div>

        <div className="col-span-full flex items-center justify-end gap-[var(--space-3)] md:col-span-3 md:justify-self-end lg:col-span-2">
          <ThemeToggle />
          <AnimationToggle />
        </div>

        <div className="col-span-full md:hidden">
          <BottomNav />
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
