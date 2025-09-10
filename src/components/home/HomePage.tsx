"use client";

import * as React from "react";
import Link from "next/link";
import Button from "@/components/ui/primitives/Button";
import { SearchBar, Progress } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import { todayISO, type DayRecord, type ISODate } from "@/components/planner/plannerStore";
import type { Goal, Review } from "@/lib/types";
import { LOCALE, cn } from "@/lib/utils";
import { CircleSlash } from "lucide-react";

export default function HomePage() {
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const pathname = usePathname();
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
          <Button
            className="rounded-full shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris]"
            onClick={() => router.push("/planner")}
          >
            Planner Today
          </Button>
          <Button
            className="rounded-full shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris]"
            tone="accent"
            onClick={() => router.push("/goals")}
          >
            New Goal
          </Button>
          <Button
            className="rounded-full shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris]"
            tone="accent"
            onClick={() => router.push("/reviews")}
          >
            New Review
          </Button>
        </div>
        <div className="md:justify-self-end">
          <SearchBar
            role="search"
            value={query}
            onValueChange={setQuery}
            className="[&>div>div]:rounded-full [&>div>div]:shadow-neo-inset [&>div>div]:[--theme-ring:var(--edge-iris)]"
          />
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
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full p-1 shadow-neo-inset">
                  <CircleSlash className="size-3" />
                </span>
                No tasks
              </li>
            )}
          </ul>
        </DashboardCard>

        <DashboardCard title="Active goals" cta={{ label: "Manage Goals", href: "/goals" }}>
          <ul className="space-y-2">
            {activeGoals.map(g => (
              <li key={g.id}>
                <p className="text-sm">{g.title}</p>
                <div className="mt-1">
                  <Progress value={0} />
                </div>
              </li>
            ))}
            {activeGoals.length === 0 && (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full p-1 shadow-neo-inset">
                  <CircleSlash className="size-3" />
                </span>
                No active goals
              </li>
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
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full p-1 shadow-neo-inset">
                  <CircleSlash className="size-3" />
                </span>
                No reviews yet
              </li>
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
        {[
          { href: "/goals", label: "Goals" },
          { href: "/planner", label: "Planner" },
          { href: "/reviews", label: "Reviews" },
          { href: "/team", label: "Team" },
          { href: "/prompts", label: "Prompts" },
        ].map(link => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1 rounded-full text-sm shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris]",
                active &&
                  "[background:var(--seg-active-grad)] text-[var(--neon-soft)] shadow-neo shadow-[0_0_8px_hsl(var(--neon)/0.6)]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}

