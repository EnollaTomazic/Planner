"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, SearchBar } from "@/components/ui";

// TODO: replace with data hooks
const tasks = [
  { id: "t1", title: "Review scrim notes", due: "2025-05-01" },
  { id: "t2", title: "Update draft", due: "2025-05-02" },
  { id: "t3", title: "Watch VOD", due: "2025-05-03" },
];

const goals = [
  { id: "g1", title: "Reach Platinum", progress: 40 },
  { id: "g2", title: "Improve CS", progress: 65 },
  { id: "g3", title: "Learn new champ", progress: 20 },
];

const reviews = [
  { id: "r1", title: "Week 1", date: "2025-04-20" },
  { id: "r2", title: "Week 2", date: "2025-04-13" },
  { id: "r3", title: "Week 3", date: "2025-04-06" },
];

export function HomePage() {
  return (
    <main className="page-shell space-y-6 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Welcome back</h1>
        <p className="text-base text-muted-foreground">Here&apos;s a quick look at your day.</p>
      </header>

      <Hero />

      <Dashboard />

      <FooterNav />
    </main>
  );
}

function Hero() {
  const router = useRouter();
  return (
    <section className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-8 flex flex-wrap gap-4">
        <Button onClick={() => router.push("/planner")}>Planner Today</Button>
        <Button variant="ghost" onClick={() => router.push("/goals")}>New Goal</Button>
        <Button variant="ghost" onClick={() => router.push("/reviews")}>New Review</Button>
      </div>
      <div className="col-span-12 md:col-span-4">
        <SearchBar value="" onValueChange={() => {}} placeholder="Search" />
      </div>
      <div
        aria-hidden
        className="col-span-12 h-1 rounded-full"
        style={{ background: "var(--edge-iris)" }}
      />
    </section>
  );
}

function Dashboard() {
  const router = useRouter();
  return (
    <section className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <DashboardCard
          title="Today"
          action={
            <Button size="sm" onClick={() => router.push("/planner")}>Open Planner</Button>
          }
        >
          <ul aria-label="Today's tasks" className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-[var(--card-hairline)] p-3"
              >
                <span className="text-sm font-medium">{t.title}</span>
                <time
                  dateTime={t.due}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(t.due).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <DashboardCard
          title="Active goals"
          action={
            <Button size="sm" onClick={() => router.push("/goals")}>Manage Goals</Button>
          }
        >
          <ul aria-label="Active goals" className="space-y-2">
            {goals.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </ul>
        </DashboardCard>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <DashboardCard
          title="Recent reviews"
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push("/reviews")}>Open Reviews</Button>
              <Button size="sm" variant="ghost" onClick={() => router.push("/reviews/new")}>New</Button>
            </div>
          }
        >
          <ul aria-label="Recent reviews" className="space-y-2">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-[var(--card-hairline)] p-3"
              >
                <span className="text-sm font-medium">{r.title}</span>
                <time
                  dateTime={r.date}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(r.date).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <DashboardCard title="Team quick actions">
          <ul className="grid grid-cols-3 gap-4" aria-label="Team quick actions">
            <li>
              <Link
                href="/team/archetypes"
                className="block rounded-xl border border-[var(--card-hairline)] p-4 text-center text-sm font-medium"
              >
                Archetypes
              </Link>
            </li>
            <li>
              <Link
                href="/team/builder"
                className="block rounded-xl border border-[var(--card-hairline)] p-4 text-center text-sm font-medium"
              >
                Team Builder
              </Link>
            </li>
            <li>
              <Link
                href="/team/clears"
                className="block rounded-xl border border-[var(--card-hairline)] p-4 text-center text-sm font-medium"
              >
                Jungle Clears
              </Link>
            </li>
          </ul>
        </DashboardCard>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <DashboardCard
          title="Prompts peek"
          action={
            <Button size="sm" onClick={() => router.push("/prompts")}>Explore Prompts</Button>
          }
          decorative
        >
          <div className="h-24 w-full rounded-xl" />
        </DashboardCard>
      </div>
    </section>
  );
}

function GoalRow({ goal }: { goal: { id: string; title: string; progress: number } }) {
  return (
    <li className="rounded-xl border border-[var(--card-hairline)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{goal.title}</span>
        <span className="text-sm">{goal.progress}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ background: "var(--neon)", width: `${goal.progress}%` }}
        />
      </div>
    </li>
  );
}

function DashboardCard({
  title,
  action,
  children,
  decorative,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  decorative?: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-[var(--card-hairline)] bg-card p-5 shadow-neoSoft"
      style={decorative ? { background: "var(--seg-active-grad)", boxShadow: "0 0 0 1px var(--neon-soft)" } : undefined}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function FooterNav() {
  const links = [
    { href: "/goals", label: "Goals" },
    { href: "/planner", label: "Planner" },
    { href: "/reviews", label: "Reviews" },
    { href: "/team", label: "Team" },
    { href: "/prompts", label: "Prompts" },
  ];
  return (
    <nav aria-label="Footer navigation" className="pt-6">
      <ul className="grid grid-cols-5 gap-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-xl border border-[var(--card-hairline)] bg-card py-2 text-center text-sm font-medium"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default HomePage;
