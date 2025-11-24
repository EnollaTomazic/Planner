"use client";

import "@/app/globals.css";
import * as React from "react";
import { NavBar } from "@/components/chrome/NavBar";
import { MobileNavDrawer } from "@/components/chrome/MobileNavDrawer";
import { BrandWordmark } from "@/components/chrome/BrandWordmark";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import { AnimationToggle } from "@/components/ui/AnimationToggle";
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
 * - Single header with centered nav and right-aligned utilities
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
        className="sticky top-0 z-50 border-b border-border/70 bg-gradient-to-b from-surface/95 via-surface/90 to-background/85 backdrop-blur-xl"
      >
        <div className="mx-auto grid h-14 w-full max-w-[var(--shell-max)] grid-cols-[auto,1fr,auto] items-center gap-[var(--space-3)] px-6">
          <Link
            href={withBasePath("/", { skipForNextLink: true })}
            aria-label="Home"
            className="flex items-center gap-[var(--space-2)]"
          >
            <span
              aria-hidden="true"
              className="relative flex size-[var(--space-4)] items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full bg-brandmark-halo opacity-80" />
              <span className="relative size-[calc(var(--space-2)+var(--spacing-0-5))] rounded-full bg-brandmark-fill shadow-glow-sm" />
            </span>
            <BrandWordmark />
          </Link>

          <div className="hidden min-w-0 justify-center md:flex">
            <NavBar />
          </div>

          <div className="flex items-center justify-end gap-[var(--space-2)]">
            <div className="md:hidden">
              <IconButton
                aria-label="Open navigation"
                aria-haspopup="dialog"
                aria-expanded={mobileNavOpen}
                aria-controls={navId}
                variant="neo"
                size="md"
                onClick={openMobileNav}
                className="shadow-glow-sm"
              >
                <Menu aria-hidden="true" className="size-[calc(var(--control-h-md)/2)]" />
              </IconButton>
            </div>
            <Toolbar label="Display controls">
              <ThemeToggle className="shrink-0" ariaLabel="Display" />
              <div className="shrink-0">
                <AnimationToggle />
              </div>
            </Toolbar>
          </div>
        </div>
        <MobileNavDrawer
          id={navId}
          open={mobileNavOpen}
          onClose={closeMobileNav}
        />
      </header>
      {children}
    </React.Fragment>
  );
}
