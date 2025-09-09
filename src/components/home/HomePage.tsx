"use client";

import * as React from "react";
import Link from "next/link";
import Button from "@/components/ui/primitives/Button";
import { SearchBar } from "@/components/ui";
import { useRouter } from "next/navigation";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import { todayISO, type DayRecord, type ISODate } from "@/components/planner/plannerStore";
import type { Goal, Review } from "@/lib/types";
import { LOCALE } from "@/lib/utils";

export default function HomePage() {
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const [days] = usePersistentState<Record<ISODate, DayRecord>>("planner:days", {});
  const [goals] = usePersistentState<Goal[]>("goals.v2", []);
  const [reviews] = usePersistentState<Review[]>("reviews.v1", []);

  const iso = todayISO();
  const tasks = React.useMemo(() => days[iso]?.tasks ?? [], [days, iso]);
  const topTasks = tasks.slice(0, 3);

  const activeGoals = React.useMemo(() => goals.filter(g => !g.done).slice(0, 3), [goals]);

  const recentReviews = React.useMemo(
    () => [...reviews].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [reviews],
  );

  return (
    <main className="page-shell py-6 space-y-8">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Welcome to Planner</h1>
        <p className="text-sm text-muted-foreground">Plan your day, track goals, and review games.</p>
      </header>

      {/* Hero */}
      <section aria-label="Quick actions" className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => router.push("/planner")}>Planner Today</Button>
          <Button variant="ghost" onClick={() => router.push("/goals")}>New Goal</Button>
          <Button variant="ghost" onClick={() => router.push("/reviews")}>New Review</Button>
        </div>
        <div className="md:justify-self-end">
          <SearchBar role="search" value={query} onValueChange={setQuery} />
        </div>
      </section>
      <div className="h-1 w-full rounded-full" style={{ background: "var(--edge-iris)" }} />

      {/* Dashboard grid */}
      <section aria-label="Dashboard" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Today" cta={{ label: "Open Planner", href: "/planner" }}>
          <ul className="space-y-2">
            {topTasks.map(t => (
              <li key={t.id} className="flex justify-between text-sm">
                <span>{t.title}</span>
                <span className="text-muted-foreground">Today</span>
              </li>
            ))}
            {topTasks.length === 0 && (
              <li className="text-sm text-muted-foreground">No tasks</li>
            )}
          </ul>
        </DashboardCard>

        <DashboardCard title="Active goals" cta={{ label: "Manage Goals", href: "/goals" }}>
          <ul className="space-y-2">
            {activeGoals.map(g => (
              <li key={g.id}>
                <p className="text-sm">{g.title}</p>
                <div className="mt-1 h-2 w-full rounded-full bg-card-hairline">
                  <div className="h-2 rounded-full" style={{ background: "var(--neon)", width: "0%" }} />
                </div>
              </li>
            ))}
            {activeGoals.length === 0 && (
              <li className="text-sm text-muted-foreground">No active goals</li>
            )}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Recent reviews"
          actions={
            <div className="flex gap-2">
              <Link href="/reviews" className="text-sm text-accent underline">
                Open Reviews
              </Link>
              <Link href="/reviews" className="text-sm text-accent underline">
                New
              </Link>
            </div>
          }
        >
          <ul className="space-y-2">
            {recentReviews.map(r => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>{r.title || "Untitled"}</span>
                <span className="text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString(LOCALE)}
                </span>
              </li>
            ))}
            {recentReviews.length === 0 && (
              <li className="text-sm text-muted-foreground">No reviews yet</li>
            )}
          </ul>
        </DashboardCard>

        <DashboardCard title="Team quick actions">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Link href="/team" className="rounded-md border border-card-hairline p-2 text-center hover:text-accent">
              Archetypes
            </Link>
            <Link href="/team" className="rounded-md border border-card-hairline p-2 text-center hover:text-accent">
              Team Builder
            </Link>
            <Link href="/team" className="rounded-md border border-card-hairline p-2 text-center hover:text-accent">
              Jungle Clears
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Prompts peek" cta={{ label: "Explore Prompts", href: "/prompts" }}>
          <div
            className="rounded-lg p-6 text-center text-sm"
            style={{ background: "var(--seg-active-grad)", color: "var(--neon-soft)" }}
          >
            Get inspired with curated prompts
          </div>
        </DashboardCard>
      </section>

      {/* Bottom links */}
      <nav className="flex justify-center gap-4 pt-4">
        <Link className="text-accent underline" href="/goals">
          Goals
        </Link>
        <Link className="text-accent underline" href="/planner">
          Planner
        </Link>
        <Link className="text-accent underline" href="/reviews">
          Reviews
        </Link>
        <Link className="text-accent underline" href="/team">
          Team
        </Link>
        <Link className="text-accent underline" href="/prompts">
          Prompts
        </Link>
      </nav>
    </main>
  );
}

