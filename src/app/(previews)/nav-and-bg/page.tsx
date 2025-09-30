import * as React from "react";
import type { Metadata } from "next";

import SiteChrome from "@/components/chrome/SiteChrome";
import NavBar from "@/components/chrome/NavBar";
import { DecorLayer, PageShell } from "@/components/ui";

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
  return (
    <React.Fragment>
      <div aria-hidden className="page-backdrop">
        <div className="page-shell">
          <DecorLayer className="page-backdrop__layer" variant="grid" />
          <DecorLayer className="page-backdrop__layer" variant="drip" />
        </div>
      </div>
      <SiteChrome>
        <div className="relative z-10">
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-[60vh] flex-col py-[var(--space-8)]"
          >
            <PageShell className="flex flex-col gap-[var(--space-6)]">
              <header className="max-w-2xl space-y-[var(--space-2)]">
                <p className="text-label text-accent-foreground/80">Theme preview</p>
                <h1 className="text-display-sm font-semibold text-foreground">
                  Navigation & background layering
                </h1>
                <p className="text-body-md text-muted-foreground">
                  Cycle through every variant and background pairing to verify that the navigation chrome and decorative backdrops stay in sync.
                </p>
                <ThemeCycleControl />
              </header>
              <section className="rounded-[var(--radius-2xl)] border border-border/80 bg-surface/90 p-[var(--space-6)] shadow-[var(--shadow-outline-subtle)] backdrop-blur-md">
                <div className="mx-auto max-w-4xl">
                  <NavBar />
                </div>
              </section>
            </PageShell>
          </main>
        </div>
      </SiteChrome>
    </React.Fragment>
  );
}
