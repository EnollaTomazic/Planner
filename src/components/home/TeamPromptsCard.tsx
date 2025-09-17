"use client";

import * as React from "react";
import Link from "next/link";
import Button from "@/components/ui/primitives/Button";
import DashboardCard from "./DashboardCard";

const quickActionClassName =
  "col-span-12 w-full justify-start text-left border-border bg-card/60 [--focus:var(--theme-ring)] focus-visible:ring-offset-0 sm:col-span-6 lg:col-span-4";

export default function TeamPromptsCard() {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
      <div className="md:col-span-6">
        <DashboardCard title="Team quick actions">
          <div className="grid grid-cols-12 gap-[var(--space-4)]">
            <Button asChild size="sm" variant="ghost" className={quickActionClassName}>
              <Link href="/team">Archetypes</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className={quickActionClassName}>
              <Link href="/team">Team Builder</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className={quickActionClassName}>
              <Link href="/team">Jungle Clears</Link>
            </Button>
          </div>
        </DashboardCard>
      </div>
      <div className="md:col-span-6">
        <DashboardCard
          title="Prompts peek"
          cta={{ label: "Explore Prompts", href: "/prompts" }}
        >
          <div className="rounded-card r-card-md bg-seg-active-grad p-[var(--space-4)] text-center text-ui text-neon-soft">
            Get inspired with curated prompts
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
