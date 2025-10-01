"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import QuickActionGrid from "./QuickActionGrid";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import styles from "./TeamPromptsCard.module.css";

const teamQuickActions = [
  {
    id: "team-archetypes",
    href: "/team?tab=cheat&sub=sheet",
    label: "Archetypes",
    asChild: true,
  },
  {
    id: "team-builder",
    href: "/team?tab=builder",
    label: "Team Builder",
    asChild: true,
  },
  {
    id: "team-jungle-clears",
    href: "/team?tab=clears",
    label: "Jungle Clears",
    asChild: true,
  },
];

export default function TeamPromptsCard() {
  return (
    <div className={`${layoutGridClassName} md:grid-cols-12`}>
      <div className="md:col-span-6">
        <DashboardCard title="Team quick actions">
          <QuickActionGrid
            actions={teamQuickActions}
            layout="twelveColumn"
            buttonVariant="ghost"
            buttonSize="lg"
            buttonClassName="col-span-12 min-w-0 justify-start text-left whitespace-normal text-balance border-card-hairline bg-card/60 md:col-span-6 lg:col-span-4"
          />
        </DashboardCard>
      </div>
      <div className="md:col-span-6">
        <DashboardCard
          title="Prompts peek"
          cta={{ label: "Explore Prompts", href: "/prompts" }}
        >
          <div className="relative overflow-hidden rounded-card r-card-md bg-card p-[var(--space-4)] text-center text-ui text-foreground">
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
                styles.promptsOverlay,
              )}
            />
            <span className="relative z-10 block">Get inspired with curated prompts</span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
