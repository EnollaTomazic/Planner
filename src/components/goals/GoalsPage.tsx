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
import { useSearchParams } from "next/navigation";
import {
  Bomb,
  Flag,
  ListChecks,
  Timer as TimerIcon,
  Search,
  Sparkles,
  Gamepad2,
  GraduationCap,
  Plus,
} from "lucide-react";

import { type HeaderTab } from "@/components/ui/layout/Header";
import SectionCard from "@/components/ui/layout/SectionCard";
import { Snackbar, PageHeader, PageShell, Modal } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import Button from "@/components/ui/primitives/Button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/primitives/Card";
import GoalsTabs, { FilterKey } from "./GoalsTabs";
import GoalForm, { GoalFormHandle } from "./GoalForm";
import GoalsProgress from "./GoalsProgress";
import GoalList from "./GoalList";
import { GOALS_STICKY_TOP_CLASS } from "./constants";

import { usePersistentState } from "@/lib/db";
import type { Pillar } from "@/lib/types";
import { useGoals, ACTIVE_CAP } from "./useGoals";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/* Tabs */
import RemindersTab from "./RemindersTab";
import TimerTab from "./TimerTab";
import {
  RemindersProvider,
  useReminders,
  type Domain,
} from "./reminders/useReminders";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";

const isTabValue = (value: string | null): value is Tab =>
  value === "goals" || value === "reminders" || value === "timer";

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

const DOMAIN_ITEMS: Array<{
  key: Domain;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "Life", label: "Life", icon: <Sparkles className="mr-[var(--space-1)]" /> },
  { key: "League", label: "League", icon: <Gamepad2 className="mr-[var(--space-1)]" /> },
  { key: "Learn", label: "Learn", icon: <GraduationCap className="mr-[var(--space-1)]" /> },
];

const HERO_HEADINGS: Record<Tab, string> = {
  goals: "Goals overview",
  reminders: "Reminders",
  timer: "Focus timer",
};

const HERO_HEADING_IDS: Record<Tab, string> = {
  goals: "goals-hero-heading",
  reminders: "reminders-hero-heading",
  timer: "timer-hero-heading",
};

const HERO_SUBTITLE_IDS: Record<Tab, string> = {
  goals: "goals-hero-summary",
  reminders: "reminders-hero-summary",
  timer: "timer-hero-summary",
};

const HERO_REGION_ID = "goals-hero-region";
const GOALS_TABS_ID_BASE = "goals-tabs";
const getGoalsTabId = (key: Tab) => `${GOALS_TABS_ID_BASE}-${key}-tab`;
const getGoalsPanelId = (key: Tab) => `${GOALS_TABS_ID_BASE}-${key}-panel`;

/* ====================================================================== */

export default function GoalsPage() {
  return (
    <PlannerProvider>
      <RemindersProvider>
        <GoalsPageContent />
      </RemindersProvider>
    </PlannerProvider>
  );
}

function GoalsPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = usePersistentState<Tab>("goals.tab.v2", "goals");

  const [filter, setFilter] = usePersistentState<FilterKey>(
    "goals.filter.v1",
    "All",
  );
  const [shouldFocusGoalForm, setShouldFocusGoalForm] = React.useState(false);
  const [intentApplied, setIntentApplied] = React.useState(false);
  const {
    goals,
    err,
    lastDeleted,
    addGoal,
    toggleDone,
    removeGoal,
    updateGoal,
    undoRemove,
    clearGoals,
  } = useGoals();

  const {
    domain,
    setDomain,
    query,
    setQuery,
    filtered: reminderFiltered,
    addReminder,
  } = useReminders();

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

  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);
  const [clearedCount, setClearedCount] = React.useState(0);
  const nukeDialogId = React.useId();
  const nukeHeadingId = React.useId();
  const nukeDescriptionId = React.useId();
  const confirmButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!confirmClearOpen) return;
    confirmButtonRef.current?.focus({ preventScroll: true });
  }, [confirmClearOpen]);

  React.useEffect(() => {
    if (clearedCount === 0) return;
    const timer = window.setTimeout(() => setClearedCount(0), 5000);
    return () => window.clearTimeout(timer);
  }, [clearedCount]);

  const resetForm = React.useCallback(() => {
    setTitle("");
    setMetric("");
    setNotes("");
    setPillar("");
  }, []);

  const handleOpenNuke = React.useCallback(() => {
    setConfirmClearOpen(true);
  }, []);

  const handleCloseNuke = React.useCallback(() => {
    setConfirmClearOpen(false);
  }, []);

  const handleAddGoal = React.useCallback(() => {
    const ok = addGoal({ title, metric, notes, pillar });
    if (ok) {
      resetForm();
      titleInputRef.current?.focus({ preventScroll: true });
    }
  }, [addGoal, title, metric, notes, pillar, resetForm]);

  const startGoalCreation = React.useCallback(() => {
    setTab("goals");
    setShouldFocusGoalForm(true);
  }, [setTab]);

  const tabParam = searchParams?.get("tab") ?? null;
  React.useEffect(() => {
    if (!isTabValue(tabParam)) {
      return;
    }
    if (tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam, tab, setTab]);

  const handleTabChange = React.useCallback(
    (v: string) => setTab(v as Tab),
    [setTab],
  );

  const reminderCount = reminderFiltered.length;

  const handleDomainChange = React.useCallback(
    (key: Domain) => {
      setDomain(key);
    },
    [setDomain],
  );

  const handleReminderSearchChange = React.useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery],
  );

  const handleAddReminder = React.useCallback(() => {
    addReminder();
  }, [addReminder]);

  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!shouldFocusGoalForm) {
      return;
    }
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    formRef.current?.scrollIntoView({ behavior, block: "start" });
    titleInputRef.current?.focus({ preventScroll: true });
    setShouldFocusGoalForm(false);
  }, [shouldFocusGoalForm, reduceMotion]);

  const handleAddFirst = React.useCallback(() => {
    startGoalCreation();
  }, [startGoalCreation]);

  const handleUndo = React.useCallback(() => {
    undoRemove();
  }, [undoRemove]);

  const intentParam = searchParams?.get("intent") ?? null;
  React.useEffect(() => {
    if (intentParam === "create-goal") {
      if (!intentApplied) {
        startGoalCreation();
        setIntentApplied(true);
      }
      return;
    }
    if (intentApplied) {
      setIntentApplied(false);
    }
  }, [intentParam, intentApplied, startGoalCreation]);

  // stats
  const totalCount = goals.length;
  const doneCount = goals.filter((g) => g.done).length;
  const activeCount = totalCount - doneCount;
  const remaining = Math.max(0, ACTIVE_CAP - activeCount);
  const pctDone = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleConfirmNuke = React.useCallback(() => {
    if (totalCount > 0) {
      setClearedCount(totalCount);
    }
    clearGoals();
    setConfirmClearOpen(false);
  }, [clearGoals, totalCount]);

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
    const map: Record<Tab, React.RefObject<HTMLDivElement | null>> = {
      goals: goalsRef,
      reminders: remindersRef,
      timer: timerRef,
    };
    map[tab].current?.focus();
  }, [tab]);

  const summary: React.ReactNode =
    tab === "goals" ? (
      <ul className="m-0 list-none flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-1)] p-0 text-label text-muted-foreground">
        <li className="inline-flex items-center gap-[var(--space-1)]">
          <span className="font-semibold text-foreground">Cap</span>
          <span className="text-foreground">{ACTIVE_CAP} active</span>
        </li>
        <li className="inline-flex items-center gap-[var(--space-1)]">
          <span className="font-semibold text-accent-3">Remaining</span>
          <span className="text-accent-3">{remaining}</span>
        </li>
        <li className="inline-flex items-center gap-[var(--space-1)]">
          <span className="font-semibold text-success">Complete</span>
          <span className="text-success">{pctDone}%</span>
        </li>
        <li className="inline-flex items-center gap-[var(--space-1)]">
          <span className="inline-flex items-center gap-[var(--space-1)] rounded-full bg-primary-soft px-[var(--space-2)] text-label text-primary-foreground">
            <span className="font-semibold">Total</span>
            <span>{totalCount}</span>
          </span>
        </li>
      </ul>
    ) : tab === "reminders" ? (
      <>
        Keep <span className="font-semibold text-accent-3">nudges</span> handy with quick edit loops.
      </>
    ) : (
      <>
        <span className="inline-flex items-center rounded-full bg-primary-soft px-[var(--space-2)] font-semibold text-primary-foreground">
          Timebox
        </span>{" "}
        focus runs and reset between sets.
      </>
    );

  const heroHeadingId = HERO_HEADING_IDS[tab];
  const heroSubtitleId = HERO_SUBTITLE_IDS[tab];

  const heroHeading = (
    <span id={heroHeadingId}>{HERO_HEADINGS[tab]}</span>
  );

  const heroEyebrow = tab === "reminders" ? domain : "Guide";

  let heroSubtitle: React.ReactNode;
  if (tab === "goals") {
    heroSubtitle = (
      <span
        id={heroSubtitleId}
        className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-1)] text-muted-foreground"
      >
        <span className="inline-flex items-center gap-[var(--space-1)]">
          <span className="text-label font-semibold text-foreground">Cap</span>
          <span className="text-label text-foreground">{ACTIVE_CAP}</span>
        </span>
        <span className="inline-flex items-center gap-[var(--space-1)]">
          <span className="inline-flex items-center gap-[var(--space-1)] rounded-full bg-primary-soft px-[var(--space-2)] text-label text-primary-foreground">
            <span className="font-semibold">Active</span>
            <span>{activeCount}</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-[var(--space-1)]">
          <span className="text-label font-semibold text-accent-3">Remaining</span>
          <span className="text-label text-accent-3">{remaining}</span>
        </span>
        <span className="inline-flex items-center gap-[var(--space-1)]">
          <span className="text-label font-semibold text-success">Done</span>
          <span className="text-label text-success">
            {doneCount} ({pctDone}%)
          </span>
        </span>
      </span>
    );
  } else if (tab === "reminders") {
    heroSubtitle = (
      <span id={heroSubtitleId} className="text-muted-foreground">
        Stage <span className="font-semibold text-accent-3">nudges</span> with contexts and cadence.
      </span>
    );
  } else {
    heroSubtitle = (
      <span id={heroSubtitleId} className="text-muted-foreground">
        Dial in{" "}
        <span className="inline-flex items-center rounded-full bg-primary-soft px-[var(--space-2)] font-semibold text-primary-foreground">
          focus sprints
        </span>{" "}
        and steady breaks.
      </span>
    );
  }

  const heroAriaDescribedby =
    heroSubtitle != null ? heroSubtitleId : undefined;

  const heroDividerTint =
    tab === "reminders" ? (domain === "Life" ? "life" : "primary") : undefined;

  const reminderHeroSubTabs = React.useMemo(() => {
    if (tab !== "reminders") return undefined;
    return {
      items: DOMAIN_ITEMS,
      value: domain,
      onChange: handleDomainChange,
      align: "end" as const,
      size: "md" as const,
      ariaLabel: "Reminder domain",
      showBaseline: true,
    };
  }, [tab, domain, handleDomainChange]);

  const reminderHeroSearch = React.useMemo(() => {
    if (tab !== "reminders") return undefined;
    return {
      value: query,
      onValueChange: handleReminderSearchChange,
      placeholder: "Search title, text, tags…",
      debounceMs: 300,
      "aria-label": "Search reminders",
      right: (
        <div className="flex items-center gap-[var(--space-2)]">
          <span className="text-label font-medium tracking-[0.02em] opacity-75">
            {reminderCount}
          </span>
          <Search className="icon-sm opacity-80" />
        </div>
      ),
    };
  }, [tab, query, handleReminderSearchChange, reminderCount]);

  const reminderHeroActions = React.useMemo(() => {
    if (tab !== "reminders") return undefined;
    return (
      <Button
        variant="primary"
        size="md"
        className="whitespace-nowrap"
        onClick={handleAddReminder}
      >
        <Plus />
        <span>New Reminder</span>
      </Button>
    );
  }, [tab, handleAddReminder]);

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <PageHeader
          header={{
            id: "goals-header",
            eyebrow: "Goals",
            heading: "Today’s Goals",
            subtitle: summary,
            icon: <Flag className="opacity-80" />,
            sticky: false,
            barClassName:
              "flex-col items-start justify-start gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between sm:gap-[var(--space-4)]",
            tabs: {
              items: TABS,
              value: tab,
              onChange: handleTabChange,
              ariaLabel: "Goals header mode",
              idBase: GOALS_TABS_ID_BASE,
            },
          }}
          hero={{
            id: HERO_REGION_ID,
            role: "region",
            eyebrow: heroEyebrow,
            heading: heroHeading,
            subtitle: heroSubtitle,
            sticky: false,
            topClassName: GOALS_STICKY_TOP_CLASS,
            dividerTint: heroDividerTint,
            "aria-labelledby": heroHeadingId,
            "aria-describedby": heroAriaDescribedby,
          }}
          subTabs={reminderHeroSubTabs}
          search={reminderHeroSearch}
          actions={reminderHeroActions}
        />
      </PageShell>

      <PageShell
        as="section"
        aria-labelledby="goals-header"
        className="py-[var(--space-6)]"
      >
        <div className="grid gap-[var(--space-6)]">
          {/* ======= PANELS ======= */}
          <div
            role="tabpanel"
            id={getGoalsPanelId("goals")}
            aria-labelledby={getGoalsTabId("goals")}
            hidden={tab !== "goals"}
            tabIndex={tab === "goals" ? 0 : -1}
            ref={goalsRef}
          >
            {tab === "goals" && (
              <div className="grid gap-[var(--space-4)]">
              <div className="space-y-[var(--space-2)]">
                <SectionCard className="card-neo-soft">
                  <SectionCard.Header
                    sticky
                    topClassName={GOALS_STICKY_TOP_CLASS}
                    className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-4)]">
                      <h2 className="text-title font-semibold tracking-[-0.01em]">Your Goals</h2>
                      <GoalsProgress total={totalCount} pct={pctDone} />
                    </div>
                    <div className="flex w-full flex-col gap-[var(--space-2)] sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-[var(--space-3)]">
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        className="w-full shrink-0 sm:w-auto"
                        onClick={startGoalCreation}
                      >
                        <Plus aria-hidden="true" className="size-[var(--space-4)]" />
                        <span className="font-semibold tracking-[0.01em]">New goal</span>
                      </Button>
                      <GoalsTabs value={filter} onChange={setFilter} />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        tone="danger"
                        className="w-full shrink-0 sm:w-auto"
                        onClick={handleOpenNuke}
                        disabled={totalCount === 0}
                        aria-haspopup="dialog"
                        aria-controls={confirmClearOpen ? nukeDialogId : undefined}
                        title="Delete all goals"
                      >
                        <Bomb aria-hidden="true" className="size-[var(--space-4)]" />
                        <span className="font-semibold tracking-[0.01em]">Nuke all</span>
                      </Button>
                    </div>
                  </SectionCard.Header>
                  <SectionCard.Body>
                    {totalCount === 0 ? (
                      <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-6)] text-center">
                        <p className="text-ui font-medium text-muted-foreground">No goals yet.</p>
                        <Button onClick={handleAddFirst} size="sm" variant="primary">
                          Add a first goal
                        </Button>
                      </div>
                    ) : (
                      <GoalList
                        goals={filtered}
                        onToggleDone={toggleDone}
                        onRemove={removeGoal}
                        onUpdate={updateGoal}
                      />
                    )}
                  </SectionCard.Body>
                </SectionCard>
              </div>

              <div ref={formRef} id="goal-form">
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
                  role="status"
                  aria-live="assertive"
                  message={<>Deleted “{lastDeleted.title}”.</>}
                  actionLabel="Undo"
                  actionAriaLabel="Undo delete goal"
                  onAction={handleUndo}
                />
              )}
              {clearedCount > 0 && (
                <Snackbar
                  tone="danger"
                  message={
                    <>Removed {clearedCount} {clearedCount === 1 ? "goal" : "goals"}.</>
                  }
                />
              )}
            </div>
          )}
          </div>

          <div
            role="tabpanel"
            id={getGoalsPanelId("reminders")}
            aria-labelledby={getGoalsTabId("reminders")}
            hidden={tab !== "reminders"}
            tabIndex={tab === "reminders" ? 0 : -1}
            ref={remindersRef}
            className="grid gap-[var(--space-4)]"
          >
            {tab === "reminders" && <RemindersTab />}
          </div>

          <div
            role="tabpanel"
            id={getGoalsPanelId("timer")}
            aria-labelledby={getGoalsTabId("timer")}
            hidden={tab !== "timer"}
            tabIndex={tab === "timer" ? 0 : -1}
            ref={timerRef}
            className="grid gap-[var(--space-4)]"
          >
            {tab === "timer" && <TimerTab />}
          </div>
        </div>

        <Modal
          id={nukeDialogId}
          open={confirmClearOpen}
          onClose={handleCloseNuke}
          aria-labelledby={nukeHeadingId}
          aria-describedby={nukeDescriptionId}
          className="shadow-[var(--shadow-neo-soft)]"
        >
          <CardHeader className="space-y-[var(--space-2)]">
            <CardTitle id={nukeHeadingId}>Delete all goals?</CardTitle>
            <CardDescription id={nukeDescriptionId}>
              This action permanently removes every goal, including completed history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-[var(--space-3)]">
            <div className="rounded-card border border-danger/40 bg-danger/10 px-[var(--space-4)] py-[var(--space-3)] text-left shadow-elev-2">
              <p className="text-ui font-medium text-danger">
                You are about to nuke {totalCount} {totalCount === 1 ? "goal" : "goals"}.
              </p>
              <p className="text-label text-muted-foreground">
                There is no automatic undo. Export anything important before continuing.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-[var(--space-2)]">
            <Button
              ref={confirmButtonRef}
              type="button"
              size="sm"
              variant="primary"
              tone="danger"
              tactile
              onClick={handleConfirmNuke}
              className="shrink-0"
            >
              <Bomb aria-hidden="true" className="size-[var(--space-4)]" />
              <span className="font-semibold tracking-[0.01em]">Delete all goals</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCloseNuke}
              className="shrink-0"
            >
              Cancel
            </Button>
          </CardFooter>
        </Modal>

      </PageShell>
    </>
  );
}
