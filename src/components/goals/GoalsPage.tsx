// src/components/goals/GoalsPage.tsx
"use client";

/**
 * GoalsPage — Lavender-Glitch, hydration-safe, accessible.
 * - Uses <Header tabs={…} /> with built-in segmented tabs
 * - Tabs: Goals / Reminders / Timer
 * - Grid layout (no Split dependency)
 * - Cap: 3 active goals; remaining indicator
 * - Undo snackbar with 5s timer
 */

import * as React from "react";
import { Flag, ListChecks, Timer as TimerIcon } from "lucide-react";

import Header, { type HeaderTab } from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import SectionCard from "@/components/ui/layout/SectionCard";
import { Snackbar } from "@/components/ui";
import GoalsTabs, { FilterKey } from "./GoalsTabs";
import GoalForm, { GoalFormHandle } from "./GoalForm";
import GoalsProgress from "./GoalsProgress";
import GoalList from "./GoalList";

import { usePersistentState } from "@/lib/db";
import type { Pillar } from "@/lib/types";
import { useGoals, ACTIVE_CAP } from "./useGoals";

/* Tabs */
import RemindersTab from "./RemindersTab";
import TimerTab from "./TimerTab";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";

const TABS: HeaderTab<Tab>[] = [
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

/* ====================================================================== */

export default function GoalsPage() {
  const [tab, setTab] = usePersistentState<Tab>("goals.tab.v2", "goals");

  const [filter, setFilter] = usePersistentState<FilterKey>(
    "goals.filter.v1",
    "All",
  );
  const {
    goals,
    err,
    lastDeleted,
    addGoal,
    toggleDone,
    removeGoal,
    updateGoal,
    undoRemove,
  } = useGoals();

  // add form
  const [title, setTitle] = React.useState("");
  const [metric, setMetric] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pillar, setPillar] = React.useState<Pillar | "">("");

  const formRef = React.useRef<HTMLDivElement | null>(null);
  const titleInputRef = React.useRef<GoalFormHandle>(null);
  const goalsRef = React.useRef<HTMLDivElement>(null);
  const remindersRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<HTMLDivElement>(null);

  const resetForm = React.useCallback(() => {
    setTitle("");
    setMetric("");
    setNotes("");
    setPillar("");
  }, []);

  const handleAddGoal = React.useCallback(() => {
    const ok = addGoal({ title, metric, notes, pillar });
    if (ok) {
      resetForm();
      titleInputRef.current?.focus({ preventScroll: true });
    }
  }, [addGoal, title, metric, notes, pillar, resetForm]);

  const handleTabChange = React.useCallback(
    (v: string) => setTab(v as Tab),
    [setTab],
  );

  const handleAddFirst = React.useCallback(() => {
    const behavior: ScrollBehavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? "auto"
      : "smooth";
    formRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleUndo = React.useCallback(() => {
    undoRemove();
  }, [undoRemove]);

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
  React.useEffect(() => {
    const map: Record<Tab, React.RefObject<HTMLDivElement>> = {
      goals: goalsRef,
      reminders: remindersRef,
      timer: timerRef,
    };
    map[tab].current?.focus();
  }, [tab]);

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
        tabs={{
          items: TABS,
          value: tab,
          onChange: handleTabChange,
          ariaLabel: "Goals header mode",
        }}
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
                  onAddFirst={handleAddFirst}
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
                  onSubmit={handleAddGoal}
                  activeCount={activeCount}
                  activeCap={ACTIVE_CAP}
                  err={err}
                />
              </div>

              {lastDeleted && (
                <Snackbar
                  message={<>Deleted “{lastDeleted.title}”.</>}
                  actionLabel="Undo"
                  onAction={handleUndo}
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
