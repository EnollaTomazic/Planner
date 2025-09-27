"use client";

import { PageShell, Skeleton } from "@/components/ui";

const ACTION_PLACEHOLDERS = ["prev", "today", "next"] as const;
const WEEKDAY_PLACEHOLDERS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
const PANEL_PLACEHOLDERS = ["notes", "summary", "metrics"] as const;

export default function PlannerLoading() {
  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <div className="space-y-[var(--space-4)]">
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
            <div className="space-y-[var(--space-2)]">
              <Skeleton className="h-[var(--space-3)] w-1/4" radius="sm" />
              <Skeleton className="h-[var(--space-5)] w-1/2" radius="sm" />
              <Skeleton className="w-2/3" />
            </div>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {ACTION_PLACEHOLDERS.map((action) => (
                <Skeleton
                  key={action}
                  className="h-[var(--space-6)] w-[var(--space-16)]"
                  radius="full"
                />
              ))}
            </div>
          </div>
          <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]">
            <Skeleton className="h-[var(--space-5)] w-1/3" radius="sm" />
            <div className="grid gap-[var(--space-2)] sm:grid-cols-7">
              {WEEKDAY_PLACEHOLDERS.map((day) => (
                <Skeleton
                  key={day}
                  className="h-[var(--space-7)]"
                  radius="card"
                />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-busy="true"
      >
        <section className="grid gap-[var(--space-6)] lg:grid-cols-12">
          <div className="space-y-[var(--space-4)] lg:col-span-8">
            <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-6)] w-1/2" radius="sm" />
              <div className="space-y-[var(--space-2)]">
                <Skeleton className="w-full" radius="card" />
                <Skeleton className="w-11/12" radius="card" />
                <Skeleton className="w-10/12" radius="card" />
              </div>
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                <Skeleton className="h-[calc(var(--space-8)+var(--space-6))]" radius="card" />
                <Skeleton className="h-[calc(var(--space-8)+var(--space-6))]" radius="card" />
              </div>
            </div>
          </div>
          <aside className="space-y-[var(--space-4)] lg:col-span-4">
            {PANEL_PLACEHOLDERS.map((panel) => (
              <div
                key={panel}
                className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]"
              >
                <Skeleton className="h-[var(--space-6)] w-1/2" radius="sm" />
                <Skeleton className="w-full" />
                <Skeleton className="w-5/6" />
                <Skeleton className="w-2/3" />
              </div>
            ))}
          </aside>
        </section>
        <section className="space-y-[var(--space-3)]">
          <Skeleton className="h-[var(--space-5)] w-1/4" radius="sm" />
          <ul className="flex flex-col gap-[var(--space-3)]">
            {WEEKDAY_PLACEHOLDERS.map((day) => (
              <li
                key={day}
                className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-2)]"
              >
                <Skeleton className="h-[var(--space-5)] w-1/3" radius="sm" />
                <Skeleton className="w-full" />
                <Skeleton className="w-4/5" />
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </>
  );
}
