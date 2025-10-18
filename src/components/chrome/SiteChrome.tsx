"use client";

import "@app/globals.css";
import * as React from "react";
import { NavBar } from "@/components/chrome/NavBar";
import { MobileNavDrawer } from "@/components/chrome/MobileNavDrawer";
import { BrandWordmark } from "@/components/chrome/BrandWordmark";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import { AnimationToggle } from "@/components/ui/AnimationToggle";
import { PageShell } from "@/components/ui";
import { withBasePath } from "@/lib/utils";
import Link from "next/link";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Menu } from "lucide-react";
import { Toolbar } from "@/components/chrome/Toolbar";

export type SiteChromeProps = {
  children?: React.ReactNode;
};

/**
 * SiteChrome — sticky top bar for global navigation
 * - Uses .sticky-blur (backdrop + border) from globals.css
 * - Full-width container; content constrained by .page-shell
 * - Z-index > heroes, so it stays above scrolling headers
 */
export function SiteChrome({ children }: SiteChromeProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const navId = React.useId();
  const openMobileNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);
  const closeMobileNav = React.useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <React.Fragment>
      <header
        role="banner"
        className="sticky top-0 z-50 sticky-blur"
      >
        {/* Bar content */}
        <PageShell
          grid
          className="relative pt-[calc(env(safe-area-inset-top)+var(--space-1))] pb-[var(--space-1)] md:pt-[calc(env(safe-area-inset-top)+var(--space-1))] md:pb-[var(--space-1)]"
          contentClassName="items-center gap-y-[var(--space-1)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,hsl(var(--glow)/0.75),hsl(var(--accent-2)),hsl(var(--glow)/0.75))] opacity-80"
          />

          <Link
            href={withBasePath("/")}
            aria-label="Home"
            className="col-span-full flex items-center gap-[var(--space-2)] md:col-span-3"
          >
            <span
              aria-hidden="true"
              className="relative flex size-[var(--space-4)] items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--glow)/0.7),transparent_70%)] opacity-80" />
              <span className="relative size-[calc(var(--space-2)+var(--spacing-0-5))] rounded-full bg-[linear-gradient(180deg,hsl(var(--accent)),hsl(var(--accent-2)))] shadow-[var(--shadow-glow-sm)]" />
            </span>
            <BrandWordmark />
          </Link>

          <div className="col-span-full hidden min-w-0 justify-center md:col-span-6 md:col-start-4 md:flex lg:col-span-6">
            <NavBar />
          </div>

          <div className="col-span-full flex items-center justify-end gap-[var(--space-1)] md:col-span-3 md:justify-self-end">
            <div className="md:hidden">
              <IconButton
                aria-label="Open navigation"
                aria-haspopup="dialog"
                aria-expanded={mobileNavOpen}
                aria-controls={navId}
                variant="neo"
                size="md"
                onClick={openMobileNav}
                className="shadow-[var(--shadow-glow-sm)]"
              >
                <Menu aria-hidden="true" className="size-[calc(var(--control-h-md)/2)]" />
              </IconButton>
            </div>
            <Toolbar label="Display controls">
              <ThemeToggle className="shrink-0" />
              <div className="shrink-0">
                <AnimationToggle />
              </div>
            </Toolbar>
          </div>
          <MobileNavDrawer
            id={navId}
            open={mobileNavOpen}
            onClose={closeMobileNav}
          />
        </PageShell>
      </header>
      {children}
    </React.Fragment>
  );
}
