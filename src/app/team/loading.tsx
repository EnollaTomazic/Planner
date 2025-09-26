"use client";

import { PageShell, Skeleton } from "@/components/ui";

const MAIN_TABS = ["cheat", "builder", "clears"] as const;
const SUB_TABS = ["sheet", "comps"] as const;
const CARD_GRID = ["card-1", "card-2", "card-3", "card-4"] as const;
const PANEL_ROWS = ["lane-1", "lane-2", "lane-3"] as const;

export default function TeamLoading() {
  return (
    <>
      <PageShell as="header" className="space-y-[var(--space-6)] py-[var(--space-6)]">
        <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
            <div className="space-y-[var(--space-2)]">
              <Skeleton className="h-[var(--space-3)] w-1/5" radius="sm" />
              <Skeleton className="h-[var(--space-5)] w-1/2" radius="sm" />
              <Skeleton className="w-2/3" />
            </div>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              <Skeleton className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]" radius="full" />
              <Skeleton className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]" radius="full" />
            </div>
          </div>
          <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
            <Skeleton className="h-[calc(var(--space-8)+var(--space-4))]" radius="card" />
            <Skeleton className="h-[calc(var(--space-8)+var(--space-4))]" radius="card" />
          </div>
        </div>
        <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-3)]">
            {MAIN_TABS.map((tab) => (
              <Skeleton
                key={tab}
                className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]"
                radius="full"
              />
            ))}
          </div>
        </div>
      </PageShell>
      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-busy="true"
      >
        <section className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-3)]">
            {SUB_TABS.map((tab) => (
              <Skeleton
                key={tab}
                className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]"
                radius="full"
              />
            ))}
          </div>
          <div className="grid gap-[var(--space-3)] lg:grid-cols-2">
            {CARD_GRID.map((card) => (
              <article
                key={card}
                className="rounded-card border border-border/40 p-[var(--space-4)] space-y-[var(--space-3)]"
              >
                <Skeleton className="h-[var(--space-5)] w-2/3" radius="sm" />
                <Skeleton className="w-full" />
                <Skeleton className="w-5/6" />
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  <Skeleton className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]" radius="full" />
                  <Skeleton className="h-[var(--space-6)] w-[calc(var(--space-8)*2)]" radius="full" />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="space-y-[var(--space-3)]">
          <Skeleton className="h-[var(--space-5)] w-1/3" radius="sm" />
          <div className="grid gap-[var(--space-3)] md:grid-cols-2 lg:grid-cols-3">
            {PANEL_ROWS.map((lane) => (
              <Skeleton
                key={lane}
                className="h-[calc(var(--space-8)+var(--space-4))]"
                radius="card"
              />
            ))}
          </div>
        </section>
      </PageShell>
    </>
  );
}
