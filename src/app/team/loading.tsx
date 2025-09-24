import type { JSX } from "react";
import { PageShell, Skeleton } from "@/components/ui";

export default function Loading(): JSX.Element {
  return (
    <PageShell
      as="main"
      aria-busy="true"
      className="space-y-[var(--space-5)] py-[var(--space-6)]"
    >
      <div className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/40 p-[var(--space-5)] shadow-neoSoft">
        <div className="grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]">
          <div className="space-y-[var(--space-3)] md:col-span-7">
            <Skeleton className="h-[var(--space-5)] w-full max-w-[calc(var(--space-8)*3)]" />
            <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*4)]" />
            <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*3)]" />
          </div>
          <div className="flex flex-col gap-[var(--space-3)] md:col-span-5">
            <Skeleton className="h-[var(--control-h-md)] w-full rounded-[var(--control-radius)]" />
            <Skeleton className="h-[var(--control-h-md)] w-full rounded-[var(--control-radius)]" />
          </div>
        </div>
      </div>
      <div className="grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={`team-card-${index}`}
            className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 p-[var(--space-4)] shadow-neoSoft md:col-span-6"
          >
            <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:gap-[var(--space-4)]">
              <Skeleton className="h-[calc(var(--space-8)+var(--space-2))] w-full rounded-full sm:h-[calc(var(--space-8)*2)] sm:w-[calc(var(--space-8)*2)]" />
              <div className="flex-1 space-y-[var(--space-3)]">
                <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*3)]" />
                <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*2+var(--space-4))]" />
                <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*2)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
