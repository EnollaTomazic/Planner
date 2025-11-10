import * as React from "react";
import type { Metadata } from "next";

import { SiteChrome } from "@/components/chrome/SiteChrome";
import { NavBar } from "@/components/chrome/NavBar";
import { DecorLayer, PageShell } from "@/components/ui";
import { PageHero } from "@/components/ui/layout/PageHero";

import ThemeCycleControl from "./ThemeCycleControl";

export const metadata: Metadata = {
  title: "Navigation & background preview",
  description:
    "Preview how the global navigation and background layers render across every theme variant and backdrop.",
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): never[] {
  return [];
}

export default function NavAndBackgroundPreviewPage() {
  const headingId = "nav-preview-heading";

  return (
    <React.Fragment>
      <div aria-hidden className="page-backdrop">
        <PageShell>
          <DecorLayer className="page-backdrop__layer" variant="grid" />
          <DecorLayer className="page-backdrop__layer" variant="drip" />
        </PageShell>
      </div>
      <SiteChrome>
        <div className="relative z-10">
          <PageShell as="header" grid className="py-[var(--space-8)]">
            <PageHero
              id={headingId}
              accent="supportive"
              frame={false}
              glitch="off"
              eyebrow={<span className="normal-case text-accent-foreground/80">Theme preview</span>}
              title="Navigation & background layering"
            >
              <div className="max-w-2xl space-y-[var(--space-3)]">
                <p className="text-body-md text-muted-foreground">
                  Cycle through every variant and background pairing to verify that the navigation chrome and decorative backdrops stay in sync.
                </p>
                <ThemeCycleControl />
              </div>
            </PageHero>
          </PageShell>

          <PageShell
            as="main"
            id="page-main"
            tabIndex={-1}
            grid
            aria-labelledby={headingId}
            className="min-h-[60vh] pb-[var(--space-8)]"
          >
            <section className="col-span-full rounded-[var(--radius-2xl)] border border-border/80 bg-surface/90 p-[var(--space-6)] shadow-[var(--shadow-outline-subtle)] backdrop-blur-md">
              <div className="mx-auto max-w-4xl">
                <NavBar />
              </div>
            </section>
          </PageShell>
        </div>
      </SiteChrome>
    </React.Fragment>
  );
}
