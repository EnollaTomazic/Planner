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
import { Flag, ListChecks, Timer as TimerIcon } from "lucide-react";

import Header from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import SectionCard from "@/components/ui/layout/SectionCard";
import {
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  Snackbar,
} from "@/components/ui";
import GoalsTabs, { FilterKey } from "./GoalsTabs";
import GoalForm, { GoalFormHandle } from "./GoalForm";
import GoalsProgress from "./GoalsProgress";
import GoalList from "./GoalList";

import { usePersistentState } from "@/lib/db";
import type { Goal, Pillar } from "@/lib/types";

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
    icon: <Flag />,
    hint: "Cap 3 active",
  },
  {
    key: "reminders",
    label: "Reminders",
    icon: <ListChecks />,
    hint: "Quick cues",
  },
  {
    key: "timer",
    label: "Timer",
    icon: <TimerIcon />,
    hint: "Focus sprints",
  },
];

const ACTIVE_CAP = 3;

/* ====================================================================== */

export default function GoalsPage() {
  const [tab, setTab] = usePersistentState<Tab>("goals.tab.v2", "goals");

  // stores
  const [goals, setGoals] = usePersistentState<Goal[]>("goals.v2", []);
  const [filter, setFilter] = usePersistentState<FilterKey>(
    "goals.filter.v1",
    "All",
  );

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
  const goalsRef = React.useRef<HTMLDivElement>(null);
  const remindersRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<HTMLDivElement>(null);

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
      id: crypto.randomUUID(),
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

  React.useEffect(() => {
    const map: Record<Tab, React.RefObject<HTMLDivElement>> = {
      goals: goalsRef,
      reminders: remindersRef,
      timer: timerRef,
    };
    map[tab].current?.focus();
  }, [tab]);

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

  function updateGoal(
    id: string,
    updates: Pick<Goal, "title" | "metric" | "notes">,
  ) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    );
  }

  const summary =
    tab === "goals"
      ? `Cap: ${ACTIVE_CAP} active · Remaining: ${remaining} · ${pctDone}% done · ${totalCount} total`
      : tab === "reminders"
        ? "Pin quick cues. Edit between queues."
        : "Pick a duration and focus.";

  return (
    <main
      id="goals-main"
      aria-labelledby="goals-header"
      className="page-shell py-6 space-y-6"
    >
      {/* ======= HEADER ======= */}
      <Header
        id="goals-header"
        eyebrow="Goals"
        heading="Today’s Goals"
        subtitle={summary}
        icon={<Flag className="opacity-80" />}
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

      <section className="grid gap-6">
        <div
          role="tabpanel"
          id="goals-panel"
          aria-labelledby="goals-tab"
          hidden={tab !== "goals"}
          tabIndex={tab === "goals" ? 0 : -1}
          ref={goalsRef}
        >
          {tab === "goals" && (
            <div className="grid gap-4">
              <Hero
                eyebrow="Guide"
                heading="Overview"
                subtitle={`Cap ${ACTIVE_CAP}, ${remaining} remaining (${activeCount} active, ${doneCount} done)`}
                sticky={false}
                topClassName="top-0"
              />

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
                    <GoalList
                      goals={filtered}
                      onToggleDone={toggleDone}
                      onRemove={removeGoal}
                      onUpdate={updateGoal}
                    />
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
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id="reminders-panel"
          aria-labelledby="reminders-tab"
          hidden={tab !== "reminders"}
          tabIndex={tab === "reminders" ? 0 : -1}
          ref={remindersRef}
          className="grid gap-4"
        >
          {tab === "reminders" && <RemindersTab />}
        </div>

        <div
          role="tabpanel"
          id="timer-panel"
          aria-labelledby="timer-tab"
          hidden={tab !== "timer"}
          tabIndex={tab === "timer" ? 0 : -1}
          ref={timerRef}
          className="grid gap-4"
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
