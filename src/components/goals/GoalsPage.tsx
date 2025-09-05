// src/components/goals/GoalsPage.tsx
"use client";

/**
 * GoalsPage — Lavender-Glitch, hydration-safe, accessible.
 * - Uses <Hero /> with right-aligned <HeroTabs />
 * - Tabs: Goals / Reminders / Timer
 * - Grid layout (no Split dependency)
 * - Cap: 3 active goals; remaining indicator
 * - Undo snackbar with 5s timer
 */

import "./style.css"; // scoped: .goals-cap, .goal-row, and terminal waitlist helpers

import * as React from "react";
import { Flag, ListChecks, Timer as TimerIcon, Trash2 } from "lucide-react";

import Hero from "@/components/ui/layout/Hero";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import {
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
} from "@/components/ui";
import GoalsTabs, { FilterKey } from "./GoalsTabs";
import GoalsProgress from "./GoalsProgress";
import GoalForm from "./GoalForm";
import GoalQueue, { WaitItem } from "./GoalQueue";

import { useLocalDB, uid } from "@/lib/db";
import type { Goal } from "@/lib/types";
import { LOCALE } from "@/lib/utils";

/* Tabs */
import RemindersTab from "./RemindersTab";
import TimerTab from "./TimerTab";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode; hint?: string }> = [
  { key: "goals", label: "Goals", icon: <Flag className="mr-1 h-4 w-4" />, hint: "Cap 3 active" },
  { key: "reminders", label: "Reminders", icon: <ListChecks className="mr-1 h-4 w-4" />, hint: "Quick cues" },
  { key: "timer", label: "Timer", icon: <TimerIcon className="mr-1 h-4 w-4" />, hint: "Focus sprints" },
];

const ACTIVE_CAP = 3;

/* ---------- Waitlist ---------- */
const WAITLIST_SEEDS: WaitItem[] = [
  { id: uid("wl"), text: "Fix wave-3 crash timing", createdAt: Date.now() - 86400000 },
  { id: uid("wl"), text: "Early ward @2:30 then shove", createdAt: Date.now() - 860000 },
  { id: uid("wl"), text: "Track jungle path till 3 camps", createdAt: Date.now() - 420000 },
];

/* ====================================================================== */

export default function GoalsPage() {
  const [tab, setTab] = useLocalDB<Tab>("goals.tab.v2", "goals");

  // stores
  const [goals, setGoals] = useLocalDB<Goal[]>("goals.v2", []);
  const [filter, setFilter] = useLocalDB<FilterKey>("goals.filter.v1", "All");
  const [waitlist, setWaitlist] = useLocalDB<WaitItem[]>("goals.waitlist.v1", WAITLIST_SEEDS);

  // add form
  const [title, setTitle] = React.useState("");
  const [metric, setMetric] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  // undo
  const [lastDeleted, setLastDeleted] = React.useState<Goal | null>(null);
  const undoTimer = React.useRef<number | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);

  // stats
  const totalCount = goals.length;
  const doneCount = goals.filter((g) => g.done).length;
  const activeCount = totalCount - doneCount;
  const remaining = Math.max(0, ACTIVE_CAP - activeCount);
  const pctDone = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  // derive list
  const sorted = React.useMemo(() => {
    const rows = [...goals];
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  }, [goals]);

  const filtered = React.useMemo(() => {
    if (filter === "Active") return sorted.filter((g) => !g.done);
    if (filter === "Done") return sorted.filter((g) => g.done);
    return sorted;
  }, [sorted, filter]);

  function resetForm() {
    setTitle("");
    setMetric("");
    setNotes("");
  }

  function addGoal() {
    setErr(null);
    if (!title.trim()) return setErr("Title required.");
    const currentActive = goals.filter((g) => !g.done).length;
    if (currentActive >= ACTIVE_CAP) return setErr("Cap reached. Mark something done first.");

    const g: Goal = {
      id: uid("goal"),
      title: title.trim(),
      pillar: "",
      metric: metric.trim() || undefined,
      notes: notes.trim() || undefined,
      done: false,
      createdAt: Date.now(),
    };
    setGoals((prev) => [g, ...prev]);
    resetForm();
  }

  function toggleDone(id: string) {
    setErr(null);
    setGoals((prev) => {
      const next = prev.map((g) => ({ ...g }));
      const i = next.findIndex((g) => g.id === id);
      if (i === -1) return prev;

      const willActivate = next[i].done; // switching done -> active
      if (willActivate) {
        const activeNow = next.filter((g) => !g.done).length;
        if (activeNow >= ACTIVE_CAP) {
          setErr("Cap is 3 active. Complete or delete another first.");
          return prev;
        }
      }
      next[i].done = !next[i].done;
      return next;
    });
  }

  function removeGoal(id: string) {
    setErr(null);
    const g = goals.find((x) => x.id === id) || null;
    setGoals((prev) => prev.filter((x) => x.id !== id));
    setLastDeleted(g);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setLastDeleted(null), 5000);
  }

  // waitlist ops
  function addWait(text: string) {
    const t = text.trim();
    if (!t) return;
    setWaitlist((prev) => [{ id: uid("wl"), text: t, createdAt: Date.now() }, ...prev]);
  }
  function removeWait(id: string) {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
  }

  const summary =
    tab === "goals"
      ? `Cap: ${ACTIVE_CAP} active · Remaining: ${remaining} · ${pctDone}% done · ${totalCount} total`
      : tab === "reminders"
      ? "Pin quick cues. Edit between queues."
      : "Pick a duration and focus.";

  return (
    <main className="page-shell grid gap-4 py-6">
      {/* ======= HERO ======= */}
      <Hero
        eyebrow="Goals"
        heading={
          <>
            <span className="sm:mr-2">Today</span>
            <span className="block text-xs text-[hsl(var(--muted-foreground))] sm:inline">
              {summary}
            </span>
          </>
        }
        sticky
        barClassName="flex-col items-start justify-start gap-2 sm:flex-row sm:items-center sm:justify-between"
        right={
          <GlitchSegmentedGroup
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            ariaLabel="Goals header mode"
          >
            {TABS.map((t) => (
              <GlitchSegmentedButton key={t.key} value={t.key} icon={t.icon}>
                {t.label}
              </GlitchSegmentedButton>
            ))}
          </GlitchSegmentedGroup>
        }
      />

      <section className="grid gap-4">
        <div
          role="tabpanel"
          id="goals-panel"
          aria-labelledby="goals-tab"
          hidden={tab !== "goals"}
        >
          {tab === "goals" && (
            <>
              <div className="mx-auto mt-6 mb-6 max-w-screen-2xl">
                {totalCount === 0 ? (
                  <GoalsProgress
                    total={totalCount}
                    pct={pctDone}
                    onAddFirst={() =>
                      formRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                  />
                ) : null}
                <div className="grid gap-y-6 md:grid-cols-2 md:gap-x-6">
                  <section>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h2 className="text-lg font-semibold">Your Goals</h2>
                        <GoalsProgress total={totalCount} pct={pctDone} />
                      </div>
                      <GoalsTabs value={filter} onChange={setFilter} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--foreground)/0.65)]">
                          No goals here. Add one simple, finishable thing.
                        </p>
                      ) : (
                        filtered.map((g) => (
                          <article
                            key={g.id}
                            className="group rounded-2xl p-4 ring-1 ring-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] transition hover:-translate-y-[1px] hover:shadow-md focus-within:ring-2 focus-within:ring-[hsl(var(--accent)/0.6)]"
                          >
                            <header className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold leading-tight line-clamp-2">{g.title}</h3>
                                <time
                                  className="mt-1 block text-xs text-[hsl(var(--foreground)/0.65)]"
                                  dateTime={new Date(g.createdAt).toISOString()}
                                >
                                  {new Date(g.createdAt).toLocaleDateString(LOCALE)}
                                </time>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle
                                  aria-label={g.done ? "Mark active" : "Mark done"}
                                  checked={g.done}
                                  onChange={() => toggleDone(g.id)}
                                  size="lg"
                                  className="focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
                                />
                                <IconButton
                                  title="Delete"
                                  aria-label="Delete goal"
                                  onClick={() => removeGoal(g.id)}
                                  circleSize="sm"
                                  className="focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
                                >
                                  <Trash2 />
                                </IconButton>
                              </div>
                            </header>
                            <div className="mt-4 space-y-2 text-sm text-[hsl(var(--foreground)/0.65)]">
                              {g.metric ? (
                                <div className="tabular-nums">
                                  <span className="opacity-70">Metric:</span> {g.metric}
                                </div>
                              ) : null}
                              {g.notes ? <p className="leading-relaxed line-clamp-2">{g.notes}</p> : null}
                            </div>
                            <footer className="mt-4 flex justify-end text-xs">
                              <span className={g.done ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground)/0.65)]"}>
                                {g.done ? "Done" : "Active"}
                              </span>
                            </footer>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                  <section className="md:sticky md:top-16" ref={formRef}>
                    <GoalForm
                      title={title}
                      metric={metric}
                      notes={notes}
                      onTitleChange={setTitle}
                      onMetricChange={setMetric}
                      onNotesChange={setNotes}
                      onSubmit={addGoal}
                      activeCount={activeCount}
                      activeCap={ACTIVE_CAP}
                      err={err}
                    />
                  </section>
                  <section className="md:col-span-2">
                    <GoalQueue items={waitlist} onAdd={addWait} onRemove={removeWait} />
                  </section>
                </div>
              </div>

              {lastDeleted && (
                <div className="mx-auto w-fit rounded-full px-4 py-2 text-sm bg-[hsl(var(--card))] border border-[hsl(var(--card-hairline))] shadow-sm">
                  Deleted “{lastDeleted.title}”.{" "}
                  <button
                    type="button"
                    className="underline underline-offset-2"
                    onClick={() => {
                      if (!lastDeleted) return;
                      setGoals((prev) => [lastDeleted, ...prev]);
                      setLastDeleted(null);
                    }}
                  >
                    Undo
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div
          role="tabpanel"
          id="reminders-panel"
          aria-labelledby="reminders-tab"
          hidden={tab !== "reminders"}
        >
          {tab === "reminders" && <RemindersTab />}
        </div>

        <div
          role="tabpanel"
          id="timer-panel"
          aria-labelledby="timer-tab"
          hidden={tab !== "timer"}
        >
          {tab === "timer" && <TimerTab />}
        </div>
      </section>

      <style jsx>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </main>
  );
}

