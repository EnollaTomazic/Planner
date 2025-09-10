"use client";

import * as React from "react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  children?: React.ReactNode;
  cta?: { label: string; href: string };
  actions?: React.ReactNode;
}

export default function DashboardCard({ title, children, cta, actions }: DashboardCardProps) {
  return (
    <div className="card-neo-soft shadow-neo-strong p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        {actions}
      </div>
      {children}
      {cta && (
        <Link href={cta.href} className="text-sm font-medium text-accent underline">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

