"use client";

import * as React from "react";
import Link from "next/link";
import { Button, NeoCard } from "@/components/ui";
import { withBasePath } from "@/lib/utils";

import {
  type DashboardSectionHeaderShowCodeProps, DashboardSectionHeader } from "./DashboardSectionHeader";

interface DashboardCardProps {
  title: string;
  children?: React.ReactNode;
  cta?: { label: string; href: string };
  actions?: React.ReactNode;
  headerLoading?: boolean;
  showCode?: DashboardSectionHeaderShowCodeProps;
}

export function DashboardCard({
  title,
  children,
  cta,
  actions,
  headerLoading,
  showCode,
}: DashboardCardProps) {
  return (
    <NeoCard className="space-y-[var(--space-4)] p-[var(--space-4)] sm:p-[var(--space-5)] lg:p-[var(--space-6)]">
      <DashboardSectionHeader
        title={title}
        actions={actions}
        loading={headerLoading}
        showCode={showCode}
      />
      {children && (
        <div
          className="border-t border-card-hairline-60 pt-[var(--space-4)] space-y-[var(--space-4)]"
        >
          {children}
        </div>
      )}
      {cta && (
        <Button asChild variant="default" size="md" className="self-start">
          <Link href={withBasePath(cta.href)}>
            {cta.label}
          </Link>
        </Button>
      )}
    </NeoCard>
  );
}
