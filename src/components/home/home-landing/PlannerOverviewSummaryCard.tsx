"use client";

import * as React from "react";
import Link from "next/link";
import { NeoCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlannerOverviewSummaryProps } from "./types";

function PlannerOverviewSummaryCardComponent({
  label,
  title,
  items,
}: PlannerOverviewSummaryProps) {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4">
      <NeoCard className="flex h-full flex-col gap-[var(--space-3)] md:p-[var(--space-5)]">
        <div className="space-y-[var(--space-1)]">
          <p className="text-label text-muted-foreground">{label}</p>
          <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
            {title}
          </h3>
        </div>
        <ul className="grid gap-[var(--space-2)]" role="list">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-[var(--space-3)] rounded-[var(--control-radius)] border border-border/60 bg-card/70 px-[var(--space-3)] py-[var(--space-2)] transition",
                  "hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 motion-reduce:transition-none",
                  "active:border-primary/60 active:bg-card/80",
                )}
              >
                <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                  <span className="text-label text-muted-foreground">{item.label}</span>
                  <span className="text-ui font-semibold text-card-foreground text-balance">
                    {item.value}
                  </span>
                </div>
                <span className="shrink-0 text-label font-medium text-primary transition-colors group-hover:text-primary-foreground group-active:text-primary-foreground motion-reduce:transition-none">
                  {item.cta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </NeoCard>
    </div>
  );
}

export default React.memo(PlannerOverviewSummaryCardComponent);
