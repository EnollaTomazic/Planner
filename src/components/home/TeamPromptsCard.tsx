"use client";

import * as React from "react";
import Link from "next/link";
import DashboardCard from "./DashboardCard";

export default function TeamPromptsCard() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DashboardCard title="Team quick actions">
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/team"
            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs hover:bg-[--hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0"
          >
            Archetypes
          </Link>
          <Link
            href="/team"
            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs hover:bg-[--hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0"
          >
            Team Builder
          </Link>
          <Link
            href="/team"
            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs hover:bg-[--hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0"
          >
            Jungle Clears
          </Link>
        </div>
      </DashboardCard>
      <DashboardCard title="Prompts peek" cta={{ label: "Explore Prompts", href: "/prompts" }}>
        <div
          className="rounded-lg p-4 text-center text-sm"
          style={{ background: "var(--seg-active-grad)", color: "var(--neon-soft)" }}
        >
          Get inspired with curated prompts
        </div>
      </DashboardCard>
    </div>
  );
}
