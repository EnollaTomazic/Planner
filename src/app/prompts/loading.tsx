"use client";

import { PageShell, Skeleton } from "@/components/ui";

const CHIP_PLACEHOLDERS = [
  "hover",
  "focus",
  "active",
  "disabled",
  "loading",
] as const;
const TAB_PLACEHOLDERS = ["chat", "codex", "notes"] as const;
const PROMPT_CARDS = ["prompt-1", "prompt-2", "prompt-3"] as const;

export default function PromptsLoading() {
  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <div className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <div className="space-y-[var(--space-2)]">
              <Skeleton className="h-[var(--space-3)] w-1/4" radius="sm" />
              <Skeleton className="h-[var(--space-5)] w-1/2" radius="sm" />
            </div>
            <Skeleton className="h-[var(--space-6)] w-[var(--space-16)]" radius="full" />
          </div>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {CHIP_PLACEHOLDERS.map((chip) => (
              <Skeleton
                key={chip}
                className="h-[var(--space-6)] w-[var(--space-16)]"
                radius="full"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Skeleton
              className="h-[calc(var(--space-8)+var(--space-2))] flex-1 min-w-[calc(var(--space-8)*4)]"
              radius="card"
            />
            <Skeleton className="h-[var(--space-6)] w-[var(--space-16)]" radius="full" />
          </div>
        </div>
      </PageShell>
      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-busy="true"
      >
        <nav className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-3)]">
            {TAB_PLACEHOLDERS.map((label) => (
              <Skeleton
                key={label}
                className="h-[var(--space-6)] w-[var(--space-16)]"
                radius="full"
              />
            ))}
          </div>
        </nav>
        <section className="grid gap-[var(--space-4)] lg:grid-cols-2">
          {PROMPT_CARDS.map((card) => (
            <article
              key={card}
              className="rounded-card card-neo-soft shadow-depth-outer-strong p-[var(--space-4)] space-y-[var(--space-3)]"
            >
              <Skeleton className="h-[var(--space-5)] w-2/3" radius="sm" />
              <Skeleton className="w-full" />
              <Skeleton className="w-5/6" />
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <Skeleton className="h-[var(--space-6)] w-[var(--space-16)]" radius="full" />
                <Skeleton className="h-[var(--space-6)] w-[var(--space-16)]" radius="full" />
              </div>
            </article>
          ))}
        </section>
      </PageShell>
    </>
  );
}
