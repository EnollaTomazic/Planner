"use client";

import * as React from "react";
import Link from "next/link";
import { NeoCard } from "@/components/ui";

interface DashboardCardProps {
  title: string;
  children?: React.ReactNode;
  cta?: { label: string; href: string };
  actions?: React.ReactNode;
}

export default function DashboardCard({
  title,
  children,
  cta,
  actions,
}: DashboardCardProps) {
  return (
    <NeoCard className="p-[var(--space-4)] md:p-[var(--space-6)] space-y-[var(--space-4)]">
      <div className="flex items-center justify-between">
        <h2 className="text-body font-semibold tracking-[-0.01em]">{title}</h2>
        {actions}
      </div>
      {children && (
        <div className="border-t border-border pt-[var(--space-4)] space-y-[var(--space-4)]">
          {children}
        </div>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center text-ui font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-foreground active:text-accent active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-reduce:transition-none"
        >
          {cta.label}
        </Link>
      )}
    </NeoCard>
  );
}
