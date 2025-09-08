// src/components/goals/GoalsPage.tsx
"use client";

/**
 * GoalsPage — Lavender-Glitch, hydration-safe, accessible.
 * - Uses <Header /> with right-aligned <HeaderTabs />
 * - Tabs: Goals / Reminders / Timer
 * - Grid layout (no Split dependency)
 * - Cap: 3 active goals; remaining indicator
 * - Undo snackbar with 5s timer
 */

import * as React from "react";
import { Flag, ListChecks, Timer as TimerIcon, Trash2 } from "lucide-react";

import Header from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import {
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  Snackbar,
} from "@/components/ui";
import GoalsTabs, { FilterKey } from "./GoalsTabs";
import GoalForm, { GoalFormHandle } from "./GoalForm";
import GoalsProgress from "./GoalsProgress";

import { usePersistentState, uid } from "@/lib/db";
import type { Goal, Pillar } from "@/lib/types";
import { shortDate } from "@/lib/date";

/* Tabs */
import RemindersTab from "./RemindersTab";
import TimerTab from "./TimerTab";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";

const TABS: Array<{
  key: Tab;
  label: string;
  icon: React.ReactNode;
  hint?: string;
}> = [
  {
    key: "goals",
    label: "Goals",
    icon: <Flag className="mr-1 h-4 w-4" />,
    hint: "Cap 3 active",
  },
  {
    key: "reminders",
    label: "Reminders",
    icon: <ListChecks className="mr-1 h-4 w-4" />,
    hint: "Quick cues",
  },
  {
    key: "timer",
    label: "Timer",
    icon: <TimerIcon className="mr-1 h-4 w-4" />,
    hint: "Focus sprints",
  },
];

const ACTIVE_CAP = 3;

/* ====================================================================== */

export default function GoalsPage() {
  const [tab, setTab] = usePersistentState<Tab>("goals.tab.v2", "goals");

  // stores
  const [goals, setGoals] = usePersistentState<Goal[]>("goals.v2", []);
  const [filter, setFilter] = usePersistentState<FilterKey>("goals.filter.v1", "All");

  // add form
  const [title, setTitle] = React.useState("");
  const [metric, setMetric] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pillar, setPillar] = React.useState<Pillar | "">("");
  const [err, setErr] = React.useState<string | null>(null);

  // undo
  const [lastDeleted, setLastDeleted] = React.useState<Goal | null>(null);
  const undoTimer = React.useRef<number | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);
  const titleInputRef = React.useRef<GoalFormHandle>(null);

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
    setPillar("");
  }

  function addGoal() {
    setErr(null);
    if (!title.trim()) return setErr("Title required.");
    const currentActive = goals.filter((g) => !g.done).length;
    if (currentActive >= ACTIVE_CAP)
      return setErr("Cap reached. Mark something done first.");

    const g: Goal = {
      id: uid("goal"),
      title: title.trim(),
      ...(pillar ? { pillar } : {}),
      metric: metric.trim() || undefined,
      notes: notes.trim() || undefined,
      done: false,
      createdAt: Date.now(),
    };
    setGoals((prev) => [g, ...prev]);
    resetForm();
    titleInputRef.current?.focus({ preventScroll: true });
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

  const summary =
    tab === "goals"
      ? `Cap: ${ACTIVE_CAP} active · Remaining: ${remaining} · ${pctDone}% done · ${totalCount} total`
      : tab === "reminders"
        ? "Pin quick cues. Edit between queues."
        : "Pick a duration and focus.";

  return (
    <main id="goals-main" role="main" className="page-shell py-6 space-y-6">
      {/* ======= HERO ======= */}
      <Header
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

      <Hero
        eyebrow="Stats"
        heading="Overview"
        subtitle={summary}
        sticky={false}
      />

      <section className="grid gap-6">
        <div
          role="tabpanel"
          id="goals-panel"
          aria-labelledby="goals-tab"
          hidden={tab !== "goals"}
        >
          {tab === "goals" && (
            <>
              {totalCount === 0 ? (
                <GoalsProgress
                  total={totalCount}
                  pct={pctDone}
                  onAddFirst={() =>
                    formRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              ) : (
                <SectionCard className="card-neo-soft">
                  <SectionCard.Header
                    sticky
                    topClassName="top-0"
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <h2 className="text-lg font-semibold">Your Goals</h2>
                      <GoalsProgress total={totalCount} pct={pctDone} />
                    </div>
                    <GoalsTabs value={filter} onChange={setFilter} />
                  </SectionCard.Header>
                  <SectionCard.Body>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:minmax(0,1fr)]">
                      {filtered.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          No goals here. Add one simple, finishable thing.
                        </p>
                      ) : (
                        filtered.map((g) => (
                          <article
                            key={g.id}
                            className={[
                              "relative rounded-2xl p-6",
                              "card-neo transition",
                              "hover:shadow-[0_0_0_1px_hsl(var(--primary)/.25),0_12px_40px_hsl(var(--shadow-color)/0.35)]",
                              "min-h-8 flex flex-col",
                            ].join(" ")}
                          >
                            <span
                              aria-hidden
                              className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-transparent opacity-60"
                            />
                            <header className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold leading-tight pr-6 line-clamp-2">
                                {g.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <CheckCircle
                                  aria-label={
                                    g.done ? "Mark active" : "Mark done"
                                  }
                                  checked={g.done}
                                  onChange={() => toggleDone(g.id)}
                                  size="lg"
                                />
                                <IconButton
                                  title="Delete"
                                  aria-label="Delete goal"
                                  onClick={() => removeGoal(g.id)}
                                  size="sm"
                                >
                                  <Trash2 />
                                </IconButton>
                              </div>
                            </header>
                            <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))] space-y-2">
                              {g.metric ? (
                                <div className="tabular-nums">
                                  <span className="opacity-70">Metric:</span>{" "}
                                  {g.metric}
                                </div>
                              ) : null}
                              {g.notes ? (
                                <p className="leading-relaxed">{g.notes}</p>
                              ) : null}
                            </div>
                            <footer className="mt-auto pt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                              <span className="inline-flex items-center gap-2">
                                <span
                                  aria-hidden
                                  className={[
                                    "h-2 w-2 rounded-full",
                                    g.done ? "" : "bg-[hsl(var(--primary))]",
                                  ].join(" ")}
                                  style={
                                    g.done
                                      ? { background: "var(--accent-overlay)" }
                                      : undefined
                                  }
                                />
                                <time
                                  className="tabular-nums"
                                  dateTime={new Date(g.createdAt).toISOString()}
                                >
                                  {shortDate.format(new Date(g.createdAt))}
                                </time>
                              </span>
                              <span
                                className={
                                  g.done ? "text-[hsl(var(--accent))]" : ""
                                }
                              >
                                {g.done ? "Done" : "Active"}
                              </span>
                            </footer>
                          </article>
                        ))
                      )}
                    </div>
                  </SectionCard.Body>
                </SectionCard>
              )}

              <div ref={formRef}>
                <GoalForm
                  ref={titleInputRef}
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
              </div>

              {lastDeleted && (
                <Snackbar
                  message={<>Deleted “{lastDeleted.title}”.</>}
                  actionLabel="Undo"
                  onAction={() => {
                    if (!lastDeleted) return;
                    setGoals((prev) => [lastDeleted, ...prev]);
                    setLastDeleted(null);
                  }}
                />
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

      {/* Use boolean styled-jsx attribute to satisfy typings */}
      <style jsx>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </main>
  );
}
