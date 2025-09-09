"use client";

import * as React from "react";
import Link from "next/link";
import { Button, SearchBar } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Task {
  title: string;
  due: string;
}

interface Goal {
  title: string;
  progress: number;
}

interface Review {
  title: string;
  date: string;
}

const TASKS: Task[] = [
  { title: "Review builds", due: "Today" },
  { title: "Watch VODs", due: "Tonight" },
  { title: "Plan scrim", due: "Fri" },
];

const GOALS: Goal[] = [
  { title: "Hit Gold", progress: 40 },
  { title: "Improve CS", progress: 65 },
  { title: "Master champ", progress: 80 },
];

const REVIEWS: Review[] = [
  { title: "Solo queue set", date: "Jul 1" },
  { title: "Week 9 review", date: "Jun 24" },
  { title: "Week 8 review", date: "Jun 17" },
];

export default function HomePage() {
  const [query, setQuery] = React.useState("");

  return (
    <main className="page-shell space-y-6 py-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-[-0.01em]">Welcome back</h1>
        <p className="text-base text-muted-foreground">
          Here&apos;s a snapshot of your planning.
        </p>
      </header>

      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="flex flex-wrap gap-4 md:col-span-6">
          <Link href="/planner">
            <Button variant="primary">Planner Today</Button>
          </Link>
          <Link href="/goals">
            <Button variant="primary">New Goal</Button>
          </Link>
          <Link href="/reviews">
            <Button variant="primary">New Review</Button>
          </Link>
        </div>
        <div className="md:col-span-6 md:justify-self-end">
          <SearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search..."
            className="w-full md:w-64"
          />
        </div>
        <div
          aria-hidden
          className="col-span-full h-1 rounded-full"
          style={{ background: "var(--edge-iris)" }}
        />
      </section>

      {/* Dashboard grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <DashboardCard
          title="Today"
          cta={
            <Link href="/planner">
              <Button size="sm">Open Planner</Button>
            </Link>
          }
          className="md:col-span-4"
        >
          <ul className="space-y-2">
            {TASKS.slice(0, 3).map((t) => (
              <li
                key={t.title}
                className="flex items-center justify-between rounded-xl border p-3 text-sm"
                style={{ borderColor: "var(--card-hairline)" }}
              >
                <span>{t.title}</span>
                <time className="text-muted-foreground">{t.due}</time>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Active goals"
          cta={
            <Link href="/goals">
              <Button size="sm">Manage Goals</Button>
            </Link>
          }
          className="md:col-span-4"
        >
          <ul className="space-y-2">
            {GOALS.slice(0, 3).map((g) => (
              <GoalRow key={g.title} goal={g} />
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Recent reviews"
          actions={
            <div className="flex gap-2">
              <Link href="/reviews">
                <Button size="sm">Open Reviews</Button>
              </Link>
              <Link href="/reviews/new">
                <Button size="sm">New</Button>
              </Link>
            </div>
          }
          className="md:col-span-4"
        >
          <ul className="space-y-2">
            {REVIEWS.slice(0, 3).map((r) => (
              <li
                key={r.title}
                className="flex items-center justify-between rounded-xl border p-3 text-sm"
                style={{ borderColor: "var(--card-hairline)" }}
              >
                <span>{r.title}</span>
                <time className="text-muted-foreground">{r.date}</time>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Team quick actions" className="md:col-span-6">
          <ul className="grid grid-cols-3 gap-2">
            <li>
              <Link
                href="/team/archetypes"
                className="block rounded-xl border p-3 text-center text-sm"
                style={{ borderColor: "var(--card-hairline)" }}
              >
                Archetypes
              </Link>
            </li>
            <li>
              <Link
                href="/team/builder"
                className="block rounded-xl border p-3 text-center text-sm"
                style={{ borderColor: "var(--card-hairline)" }}
              >
                Team Builder
              </Link>
            </li>
            <li>
              <Link
                href="/team/jungle"
                className="block rounded-xl border p-3 text-center text-sm"
                style={{ borderColor: "var(--card-hairline)" }}
              >
                Jungle Clears
              </Link>
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Prompts peek"
          cta={
            <Link href="/prompts">
              <Button size="sm">Explore Prompts</Button>
            </Link>
          }
          className="md:col-span-6"
        >
          <div
            className="rounded-xl p-6 text-sm"
            style={{
              background: "var(--seg-active-grad)",
              boxShadow: "0 0 0 1px var(--neon-soft)",
            }}
          >
            <p>Fresh ideas from the prompt library.</p>
          </div>
        </DashboardCard>
      </section>

      <FooterNav />
    </main>
  );
}

function DashboardCard({
  title,
  children,
  cta,
  actions,
  className,
}: {
  title: string;
  children: React.ReactNode;
  cta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "col-span-full space-y-4 rounded-2xl border bg-card p-6",
        className,
      )}
      style={{
        borderColor: "var(--card-hairline)",
        boxShadow: "var(--shadow)",
      }}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        {actions}
      </header>
      {children}
      {cta && <div className="pt-4">{cta}</div>}
    </section>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  return (
    <li
      className="space-y-2 rounded-xl border p-3"
      style={{ borderColor: "var(--card-hairline)" }}
    >
      <div className="flex items-center justify-between text-sm">
        <span>{goal.title}</span>
        <span className="text-muted-foreground">{goal.progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${goal.progress}%`,
            background: "var(--neon)",
          }}
        />
      </div>
    </li>
  );
}

function FooterNav() {
  return (
    <footer className="pt-6">
      <nav aria-label="Footer">
        <ul className="grid grid-cols-5 gap-4">
          <li>
            <Link
              href="/goals"
              className="block rounded-xl border bg-card p-3 text-center text-sm"
              style={{ borderColor: "var(--card-hairline)" }}
            >
              Goals
            </Link>
          </li>
          <li>
            <Link
              href="/planner"
              className="block rounded-xl border bg-card p-3 text-center text-sm"
              style={{ borderColor: "var(--card-hairline)" }}
            >
              Planner
            </Link>
          </li>
          <li>
            <Link
              href="/reviews"
              className="block rounded-xl border bg-card p-3 text-center text-sm"
              style={{ borderColor: "var(--card-hairline)" }}
            >
              Reviews
            </Link>
          </li>
          <li>
            <Link
              href="/team"
              className="block rounded-xl border bg-card p-3 text-center text-sm"
              style={{ borderColor: "var(--card-hairline)" }}
            >
              Team
            </Link>
          </li>
          <li>
            <Link
              href="/prompts"
              className="block rounded-xl border bg-card p-3 text-center text-sm"
              style={{ borderColor: "var(--card-hairline)" }}
            >
              Prompts
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
