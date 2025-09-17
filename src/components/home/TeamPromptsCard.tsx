"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import QuickActionGrid from "./QuickActionGrid";

const teamQuickActions = [
  {
    href: "/team",
    label: "Archetypes",
    asChild: true,
  },
  {
    href: "/team",
    label: "Team Builder",
    asChild: true,
  },
  {
    href: "/team",
    label: "Jungle Clears",
    asChild: true,
  },
];

export default function TeamPromptsCard() {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
      <div className="md:col-span-6">
        <DashboardCard title="Team quick actions">
          <QuickActionGrid
            actions={teamQuickActions}
            layout="grid"
            className="grid-cols-12"
            buttonVariant="ghost"
            buttonSize="sm"
            buttonClassName="col-span-12 w-full justify-start text-left border-border bg-card/60 sm:col-span-6 lg:col-span-4"
          />
        </DashboardCard>
      </div>
      <div className="md:col-span-6">
        <DashboardCard
          title="Prompts peek"
          cta={{ label: "Explore Prompts", href: "/prompts" }}
        >
          <div className="relative overflow-hidden rounded-card r-card-md bg-seg-active-grad p-[var(--space-4)] text-center text-ui text-primary-foreground">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[linear-gradient(90deg,hsl(var(--primary)/0.35),hsl(var(--accent)/0.35),hsl(var(--accent-3)/0.35))]"
            />
            <span className="relative z-10 block">Get inspired with curated prompts</span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
