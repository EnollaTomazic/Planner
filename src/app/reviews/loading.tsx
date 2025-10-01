"use client";

import { PageShell, Skeleton } from "@/components/ui";

const FILTER_PLACEHOLDERS = ["filter-sort", "filter-tags"] as const;
const LIST_PLACEHOLDERS = [
  "review-1",
  "review-2",
  "review-3",
  "review-4",
  "review-5",
] as const;
const DETAIL_SECTIONS = ["summary", "edit"] as const;

export default function ReviewsLoading() {
  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <div className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Skeleton className="h-[var(--space-3)] w-1/4" radius="sm" />
            <Skeleton className="h-[var(--space-5)] w-1/3" radius="sm" />
          </div>
          <div className="grid gap-[var(--space-3)] md:grid-cols-12">
            <Skeleton className="md:col-span-8 h-[calc(var(--space-8)+var(--space-2))]" radius="card" />
            <div className="md:col-span-2 space-y-[var(--space-2)]">
              <Skeleton className="h-[var(--space-3)] w-1/2" radius="sm" />
              <Skeleton className="h-[var(--space-8)]" radius="card" />
            </div>
            <Skeleton className="md:col-span-2 h-[var(--space-8)]" radius="card" />
          </div>
        </div>
      </PageShell>
      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-busy="true"
      >
        <section className="grid gap-[var(--space-4)] md:grid-cols-6 lg:grid-cols-12">
          <aside className="space-y-[var(--space-3)] md:col-span-2 lg:col-span-4">
            <div className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-3)] space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-3)] w-2/3" radius="sm" />
              <div className="space-y-[var(--space-2)]">
                {FILTER_PLACEHOLDERS.map((filter) => (
                  <Skeleton
                    key={filter}
                    className="h-[var(--space-6)]"
                    radius="card"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-3)] space-y-[var(--space-2)]">
              {LIST_PLACEHOLDERS.map((item) => (
                <div
                  key={item}
                  className="rounded-card border border-border/40 p-[var(--space-3)] space-y-[var(--space-2)]"
                >
                  <Skeleton className="h-[var(--space-4)] w-2/3" radius="sm" />
                  <Skeleton className="w-5/6" />
                </div>
              ))}
            </div>
          </aside>
          <section className="space-y-[var(--space-4)] md:col-span-4 lg:col-span-8">
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {DETAIL_SECTIONS.map((section) => (
                <Skeleton
                  key={section}
                  className="h-[var(--space-6)] w-[var(--space-16)]"
                  radius="full"
                />
              ))}
            </div>
            <article className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-4)] space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-5)] w-1/2" radius="sm" />
              <Skeleton className="w-full" />
              <Skeleton className="w-5/6" />
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                <Skeleton className="h-[var(--space-12)]" radius="card" />
                <Skeleton className="h-[var(--space-12)]" radius="card" />
              </div>
            </article>
          </section>
        </section>
      </PageShell>
    </>
  );
}
