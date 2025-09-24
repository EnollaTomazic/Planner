import type { JSX } from "react";
import { PageShell, Skeleton } from "@/components/ui";

export default function Loading(): JSX.Element {
  return (
    <>
      <PageShell as="header" aria-busy="true" className="pt-[var(--space-6)]">
        <div className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/40 p-[var(--space-5)] shadow-neoSoft backdrop-blur-md">
          <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
            <div className="space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-5)] w-full max-w-[calc(var(--space-8)*3)]" />
              <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*4)]" />
            </div>
            <div className="flex shrink-0 flex-col gap-[var(--space-3)] md:flex-row">
              <Skeleton className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)] rounded-[var(--control-radius)]" />
              <Skeleton className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)] rounded-[var(--control-radius)]" />
            </div>
          </div>
        </div>
      </PageShell>
      <PageShell
        as="main"
        aria-busy="true"
        className="mt-[var(--space-6)] pb-[var(--space-6)] md:mt-[var(--space-8)] md:pb-[var(--space-8)]"
      >
        <div className="space-y-[var(--space-5)]">
          <div className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 p-[var(--space-5)] shadow-neoSoft backdrop-blur-md">
            <div className="grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]">
              <div className="space-y-[var(--space-3)] md:col-span-7">
                <Skeleton className="h-[var(--space-6)] w-full max-w-[calc(var(--space-8)*3)]" />
                <Skeleton className="h-[calc(var(--space-8)+var(--space-2))] w-full rounded-[var(--radius-xl)]" />
                <Skeleton className="h-[calc(var(--space-8)+var(--space-2))] w-full rounded-[var(--radius-xl)]" />
              </div>
              <div className="space-y-[var(--space-3)] md:col-span-5">
                <Skeleton className="h-[var(--space-6)] w-full max-w-[calc(var(--space-8)*3)]" />
                <Skeleton className="h-[calc(var(--space-8)*2)] w-full rounded-[var(--radius-xl)]" />
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  );
}
