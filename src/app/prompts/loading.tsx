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
        <div className="space-y-[var(--space-3)]">
          <Skeleton className="h-[var(--space-5)] w-full max-w-[calc(var(--space-8)*3)]" />
          <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*5)]" />
          <div className="flex flex-wrap gap-[var(--space-3)] pt-[var(--space-2)]">
            <Skeleton className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)] rounded-[var(--control-radius)]" />
            <Skeleton className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)] rounded-[var(--control-radius)]" />
            <Skeleton className="h-[var(--control-h-md)] w-[calc(var(--space-8)*2)] rounded-[var(--control-radius)]" />
          </div>
        </div>
      </div>
      <div className="grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]">
        <div className="space-y-[var(--space-4)] md:col-span-8">
          {[0, 1, 2].map((index) => (
            <div
              key={`prompt-card-${index}`}
              className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 p-[var(--space-4)] shadow-neoSoft"
            >
              <div className="space-y-[var(--space-3)]">
                <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*3)]" />
                <Skeleton className="h-[calc(var(--space-8)+var(--space-2))] w-full rounded-[var(--radius-xl)]" />
                <Skeleton className="h-[calc(var(--space-8)+var(--space-2))] w-full rounded-[var(--radius-xl)]" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-[var(--space-4)] md:col-span-4">
          <div className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 p-[var(--space-4)] shadow-neoSoft">
            <div className="space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*2)]" />
              <Skeleton className="h-[calc(var(--space-8)*2)] w-full rounded-[var(--radius-xl)]" />
              <Skeleton className="h-[calc(var(--space-8)*2)] w-full rounded-[var(--radius-xl)]" />
            </div>
          </div>
          <div className="rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 p-[var(--space-4)] shadow-neoSoft">
            <div className="space-y-[var(--space-3)]">
              <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*2)]" />
              <Skeleton className="h-[calc(var(--space-8)+var(--space-3))] w-full rounded-[var(--radius-xl)]" />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
