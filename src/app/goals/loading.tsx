"use client";

import { Skeleton } from "@/components/ui";

const TAB_PLACEHOLDERS = ["goals", "reminders", "timer"] as const;
const QUEUE_PLACEHOLDERS = ["queue-1", "queue-2", "queue-3"] as const;
const CARD_PLACEHOLDERS = ["reminders", "timer"] as const;

export default function GoalsLoading() {
  return (
    <>
      <header className="page-shell py-[var(--space-6)]">
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Skeleton className="h-[var(--space-3)] w-1/5" radius="sm" />
            <Skeleton className="h-[var(--space-5)] w-1/3" radius="sm" />
            <Skeleton className="w-2/3" />
          </div>
          <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)]">
            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            {TAB_PLACEHOLDERS.map((key) => (
              <Skeleton
                key={key}
                className="h-[var(--space-6)] w-[calc(var(--space-8)*2)] flex-none"
                radius="full"
              />
            ))}
            </div>
          </div>
        </div>
      </header>
      <main
        className="page-shell space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-busy="true"
      >
        <section className="grid gap-[var(--space-6)] lg:grid-cols-12">
          <div className="space-y-[var(--space-4)] lg:col-span-8">
            <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-6)] w-2/3" radius="sm" />
              <div className="space-y-[var(--space-2)]">
                <Skeleton className="w-full" radius="card" />
                <Skeleton className="w-11/12" radius="card" />
                <Skeleton className="w-10/12" radius="card" />
              </div>
            </div>
            <div className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-6)] w-1/3" radius="sm" />
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                {QUEUE_PLACEHOLDERS.map((item) => (
                  <div
                    key={item}
                    className="rounded-card border border-border/40 p-[var(--space-4)]"
                  >
                    <Skeleton className="h-[var(--space-5)] w-2/3" radius="sm" />
                    <div className="mt-[var(--space-3)] space-y-[var(--space-2)]">
                      <Skeleton className="w-full" />
                      <Skeleton className="w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-[var(--space-4)] lg:col-span-4">
            {CARD_PLACEHOLDERS.map((item) => (
              <div
                key={item}
                className="rounded-card card-neo-soft shadow-neo-strong p-[var(--space-4)] space-y-[var(--space-3)]"
              >
                <Skeleton className="h-[var(--space-6)] w-1/2" radius="sm" />
                <Skeleton className="h-[var(--space-6)]" radius="card" />
                <Skeleton className="h-[var(--space-6)]" radius="card" />
              </div>
            ))}
          </aside>
        </section>
      </main>
    </>
  );
}
