"use client";

import * as React from "react";
import Link from "next/link";
import DashboardCard from "./DashboardCard";

export default function TeamPromptsCard() {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
      <div className="md:col-span-6">
        <DashboardCard title="Team quick actions">
          <div className="grid grid-cols-12 gap-[var(--space-4)]">
            <Link
              href="/team"
              className="col-span-12 rounded-card r-card-md border border-border px-[var(--space-3)] py-[var(--space-1)] text-label hover:bg-[--hover] active:bg-[--active] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 sm:col-span-6 lg:col-span-4"
            >
              Archetypes
            </Link>
            <Link
              href="/team"
              className="col-span-12 rounded-card r-card-md border border-border px-[var(--space-3)] py-[var(--space-1)] text-label hover:bg-[--hover] active:bg-[--active] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 sm:col-span-6 lg:col-span-4"
            >
              Team Builder
            </Link>
            <Link
              href="/team"
              className="col-span-12 rounded-card r-card-md border border-border px-[var(--space-3)] py-[var(--space-1)] text-label hover:bg-[--hover] active:bg-[--active] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 sm:col-span-6 lg:col-span-4"
            >
              Jungle Clears
            </Link>
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
