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

export type SiteChromeProps = {
  children?: React.ReactNode;
};

/**
 * SiteChrome — sticky top bar for global navigation
 * - Uses .sticky-blur (backdrop + border) from globals.css
 * - Full-width container; content constrained by .page-shell
 * - Z-index > heroes, so it stays above scrolling headers
 */
export default function SiteChrome({ children }: SiteChromeProps) {
  return (
    <React.Fragment>
      <header
        role="banner"
        className="sticky top-0 z-50 sticky-blur"
      >
        {/* Bar content */}
        <PageShell
          grid
          className="relative pt-[calc(env(safe-area-inset-top)+var(--space-2))] pb-[var(--space-2)] md:py-[var(--space-2)]"
          contentClassName="items-center gap-y-[var(--space-2)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)),hsl(var(--accent)))] opacity-70"
          />

          <Link
            href="/"
            aria-label="Home"
            className="col-span-full flex items-center gap-[var(--space-2)] md:col-span-3"
          >
            <span
              aria-hidden="true"
              className="relative flex h-[var(--space-5)] w-[var(--space-1)] items-center justify-center overflow-hidden rounded-full bg-accent/40 shadow-[var(--shadow-glow-sm)]"
            >
              <span className="absolute inset-[calc(var(--space-1)/2)] rounded-full bg-[linear-gradient(180deg,hsl(var(--accent)),hsl(var(--accent-2)))] opacity-90" />
            </span>
            <BrandWordmark />
          </Link>

          <div className="col-span-full hidden min-w-0 justify-center md:col-span-6 md:flex lg:col-span-6">
            <NavBar />
          </div>

          <div className="col-span-full flex items-center justify-end md:col-span-3 md:justify-self-end">
            <div className="inline-flex items-center gap-[var(--space-1)] rounded-full border border-border/60 bg-background/80 px-[var(--space-2)] py-[var(--space-1)] shadow-[var(--shadow-glow-sm)] backdrop-blur">
              <ThemeToggle className="shrink-0" />
              <div className="shrink-0">
                <AnimationToggle />
              </div>
            </div>
          </div>

          <div className="col-span-full md:hidden">
            <BottomNav />
          </div>
        </PageShell>
      </header>
      {children}
    </React.Fragment>
  );
}
