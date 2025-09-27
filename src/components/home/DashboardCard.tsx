"use client";

import * as React from "react";
import Link from "next/link";
import { Button, NeoCard } from "@/components/ui";

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
        <h2 className="text-title font-semibold tracking-[-0.01em] text-card-foreground">{title}</h2>
        {actions}
      </div>
      {children && (
        <div
          className="border-t border-card-hairline-60 pt-[var(--space-4)] space-y-[var(--space-4)]"
        >
          {children}
        </div>
      )}
      {cta && (
        <Button asChild variant="primary" size="md" className="self-start">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </NeoCard>
  );
}
