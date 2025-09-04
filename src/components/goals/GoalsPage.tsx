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
import {
  Flag,
  ListChecks,
  Timer as TimerIcon,
  Check,
  Trash2,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import Hero, { HeroTabs } from "@/components/ui/layout/Hero";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import Button from "@/components/ui/primitives/button";
import IconButton from "@/components/ui/primitives/IconButton";
import Progress from "@/components/ui/feedback/Progress";

import { useLocalDB, uid } from "@/lib/db";
import type { Goal } from "@/lib/types";

/* Tabs */
import RemindersTab from "./RemindersTab";
import TimerTab from "./TimerTab";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";
type FilterKey = "All" | "Active" | "Done";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode; hint?: string }> = [
  { key: "goals", label: "Goals", icon: <Flag className="mr-1" />, hint: "Cap 3 active" },
  { key: "reminders", label: "Reminders", icon: <ListChecks className="mr-1" />, hint: "Quick cues" },
  { key: "timer", label: "Timer", icon: <TimerIcon className="mr-1" />, hint: "Focus sprints" },
];

const FILTERS: FilterKey[] = ["All", "Active", "Done"];
const ACTIVE_CAP = 3;

/* ---------- Waitlist ---------- */
type WaitItem = { id: string; text: string; createdAt: number };
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
  function promoteWait(item: WaitItem) {
    setTitle(item.text);
    setWaitlist((prev) => prev.filter((w) => w.id !== item.id));
  }

  const heroSubtitle =
    tab === "goals"
      ? `Cap: ${ACTIVE_CAP} active · Remaining: ${remaining} · ${pctDone}% done · ${totalCount} total`
      : tab === "reminders"
      ? "Pin quick cues. Edit between queues."
      : "Pick a duration and focus.";

  return (
    <main className="grid gap-4">
      {/* ======= HERO ======= */}
      <Hero
        eyebrow="GOALS"
        heading="Today"
        subtitle={heroSubtitle}
        sticky
        right={
          <HeroTabs
            tabs={TABS}
            activeKey={tab}
            onChange={(k) => setTab(k)}
            ariaLabel="Today sections"
          />
        }
      />

      {/* -------------------------- GOALS TAB -------------------------- */}
      {tab === "goals" && (
        <>
          <SectionCard className="card-neo-soft">
            <SectionCard.Header sticky>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-base font-semibold">Your Goals</h2>

                {/* progress, stable width */}
                <div className="flex items-center gap-2 min-w-[120px]" aria-label="Progress">
                  <div className="w-28">
                    <Progress value={pctDone} />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{pctDone}%</span>
                </div>

                {/* right side filter chips */}
                <div
                  className="ml-auto flex items-center gap-4"
                  role="tablist"
                  aria-label="Filter"
                >
                  {FILTERS.map((f) => {
                    const active = filter === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={["btn-like-segmented", active && "is-active"]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard.Header>

            {/* Grid — fixed-ish card min height to reduce jumpiness */}
            <SectionCard.Body>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:1fr]">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No goals here. Add one simple, finishable thing.
                  </p>
                ) : (
                  filtered.map((g) => (
                    <article
                      key={g.id}
                      className={[
                        "relative rounded-2xl p-5",
                        "card-neo-soft transition",
                        "hover:shadow-[0_0_0_1px_hsl(var(--primary)/.25),0_12px_40px_rgba(0,0,0,.35)]",
                        "min-h-[152px] flex flex-col",
                      ].join(" ")}
                    >
                      {/* decorative rail */}
                      <span
                        aria-hidden
                        className="absolute inset-y-4 left-0 w-[2px] rounded-full bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-transparent opacity-60"
                      />

                      {/* header row */}
                      <header className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight pr-6 line-clamp-2">
                          {g.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title={g.done ? "Mark active" : "Mark done"}
                            aria-label={g.done ? "Mark active" : "Mark done"}
                            onClick={() => toggleDone(g.id)}
                            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                          >
                            {g.done ? (
                              <Check className="[&>path]:stroke-[2] size-5" />
                            ) : (
                              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                />
                              </svg>
                            )}
                          </button>
                          <IconButton
                            title="Delete"
                            aria-label="Delete goal"
                            onClick={() => removeGoal(g.id)}
                            circleSize="sm"
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </header>

                      {/* body */}
                      <div className="mt-3 text-sm text-muted-foreground space-y-2">
                        {g.metric ? (
                          <div className="tabular-nums">
                            <span className="opacity-70">Metric:</span> {g.metric}
                          </div>
                        ) : null}
                        {g.notes ? <p className="leading-relaxed">{g.notes}</p> : null}
                      </div>

                      {/* footer sticks to bottom */}
                      <footer className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className={[
                              "h-2 w-2 rounded-full",
                              g.done
                                ? "bg-[hsl(var(--accent))]"
                                : "bg-[hsl(var(--primary))]",
                            ].join(" ")}
                          />
                          <time className="tabular-nums" dateTime={new Date(g.createdAt).toISOString()}>
                            {new Date(g.createdAt).toLocaleDateString()}
                          </time>
                        </span>
                        <span className={g.done ? "text-[hsl(var(--accent))]" : ""}>
                          {g.done ? "Done" : "Active"}
                        </span>
                      </footer>
                    </article>
                  ))
                )}
              </div>
            </SectionCard.Body>
          </SectionCard>

          {/* Add Goal + Waiting List */}
          <SectionCard className="card-neo">
            <SectionCard.Header title={<span className="text-base font-semibold">Add Goal</span>} />
            <SectionCard.Body>
              <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
                {/* left: form */}
                <form
                  className="grid gap-3 max-w-xl"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addGoal();
                  }}
                >
                  <label className="grid gap-2">
                    <span className="text-xs text-muted-foreground">Title</span>
                    <Input
                      className="h-10 w-full"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Clear wave 3 faster…"
                      aria-required="true"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs text-muted-foreground">Metric (optional)</span>
                    <Input
                      className="h-10 w-full tabular-nums"
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                      placeholder="Win lane by 10 CS at 10"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs text-muted-foreground">Notes (optional)</span>
                    <Textarea
                      className="w-full min-h-[120px]"
                      rows={6}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Constraints, reminders, champion pool notes…"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-muted-foreground">
                      {activeCount >= ACTIVE_CAP ? (
                        <span className="text-[hsl(var(--accent))]">
                          Cap reached. Finish one to add more.
                        </span>
                      ) : (
                        <span>
                          {Math.max(0, ACTIVE_CAP - activeCount)} active slot
                          {ACTIVE_CAP - activeCount === 1 ? "" : "s"} left
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={activeCount >= ACTIVE_CAP || !title.trim()}
                      className="h-10"
                    >
                      Add Goal
                    </Button>
                  </div>

                  {err ? (
                    <p role="status" aria-live="polite" className="text-xs text-[hsl(var(--accent))]">
                      {err}
                    </p>
                  ) : null}
                </form>

                {/* right: waitlist (terminal style) */}
                <WaitlistPanel
                  items={waitlist}
                  onAdd={(t) => addWait(t)}
                  onRemove={(id) => removeWait(id)}
                  onPromote={(it) => promoteWait(it)}
                />
              </div>
            </SectionCard.Body>
          </SectionCard>

          {/* Undo snackbar */}
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

      {/* ----------------------- OTHER TABS ----------------------- */}
      {tab === "reminders" && <RemindersTab />}
      {tab === "timer" && <TimerTab />}

      <style jsx>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </main>
  );
}

/* ----------------------- Waitlist UI (terminal style) ----------------------- */

function WaitlistPanel({
  items,
  onAdd,
  onRemove,
  onPromote,
}: {
  items: WaitItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onPromote: (item: WaitItem) => void;
}) {
  const [val, setVal] = React.useState("");
  const feedRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when items change
  React.useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [items]);

  const count = items.length;

  return (
    <div className="waitlist-terminal">
      <div className="waitlist-terminal__header">
        <h3 className="font-semibold">Goal Waiting List</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {count} item{count === 1 ? "" : "s"}
        </span>
      </div>

      <div ref={feedRef} className="waitlist-terminal__feed">
        {items.length === 0 ? (
          <div className="waitlist-terminal__line text-sm"># no items — add one below</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="waitlist-terminal__line">
              <span className="waitlist-terminal__dot" aria-hidden />
              <p className="truncate text-sm">{it.text}</p>
              <div className="flex items-center gap-1 shrink-0">
                <IconButton
                  title="Promote to form"
                  aria-label="Promote to form"
                  onClick={() => onPromote(it)}
                  circleSize="sm"
                  iconSize="sm"
                >
                  <ArrowUpRight />
                </IconButton>
                <IconButton
                  title="Remove"
                  aria-label="Remove"
                  onClick={() => onRemove(it.id)}
                  circleSize="sm"
                  iconSize="sm"
                  variant="ring"
                >
                  <Trash2 />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = val.trim();
          if (!t) return;
          onAdd(t);
          setVal("");
        }}
        className="waitlist-terminal__input"
      >
        <Input
          value={val}
          onChange={(e) => setVal(e.currentTarget.value)}
          placeholder="> type and press Enter"
          className="flex-1 h-10 font-mono"
          aria-label="New waitlist item"
        />
        <span className="waitlist-terminal__caret" aria-hidden />
        <IconButton title="Add" aria-label="Add" type="submit" circleSize="md">
          <Plus />
        </IconButton>
      </form>
    </div>
  );
}
