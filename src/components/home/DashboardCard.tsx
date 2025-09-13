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
    <NeoCard className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
        {actions}
      </div>
      {children && (
        <div className="border-t border-border pt-4 space-y-4">
          {children}
        </div>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="text-sm font-medium text-accent underline"
        >
          {cta.label}
        </Link>
      )}
    </NeoCard>
  );
}
