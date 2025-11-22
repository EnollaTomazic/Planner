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
import {
  Hero,
  Snackbar,
  PageShell,
  Modal,
  ProgressRing,
  Label,
  Input,
  AIExplainTooltip,
} from "@/components/ui";
import { PlannerProvider, SmallAgnesNoxiImage } from "@/components/planner";
import { Button } from "@/components/ui/primitives/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/primitives/Card";
import { Field } from "@/components/ui/primitives/Field";
import { type TextareaProps } from "@/components/ui/primitives/Textarea";
import { useFieldIds } from "@/lib/useFieldIds";
import { cn } from "@/lib/utils";
import { FilterKey, SegmentFilterKey, GoalsTabs } from "./GoalsTabs";
import {
  type EntityFormSubmitResult,
  type EntityFormValues,
} from "@/components/forms/EntityForm";
import { GoalsProgress } from "./GoalsProgress";
import { GoalList } from "./GoalList";
import { GOALS_STICKY_TOP_CLASS } from "./constants";

import { usePersistentState, readLocal, removeLocal } from "@/lib/db";
import { useGoals, ACTIVE_CAP } from "./useGoals";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/* Tabs */
import { RemindersTab } from "./RemindersTab";
import { TimerTab } from "./TimerTab";
import { useReminders, type Domain } from "./reminders/useReminders";

/* ---------- Types & constants ---------- */
type Tab = "goals" | "reminders" | "timer";

type GoalsInsetFormHandle = {
  focus: (options?: FocusOptions) => void;
  reset: () => void;
};

type GoalsInsetFormProps = {
  isAtCap: boolean;
  remaining: number;
  errorMessage?: string | null;
  onSubmit?: (values: EntityFormValues) => EntityFormSubmitResult;
};

const isTabValue = (value: unknown): value is Tab =>
  value === "goals" || value === "reminders" || value === "timer";

const isSegmentFilterKey = (value: unknown): value is SegmentFilterKey =>
  value === "All" || value === "Active" || value === "Done";

const NEW_GOAL_FILTER: FilterKey = "New goal";

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
  goals: "Goals",
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
const GOALS_TAB_STORAGE_KEY = "goals.tab.v2";
const GOALS_TAB_SESSION_SCOPE_KEY = "goals.tab.session-scope.v1";

function buildSessionScopedTabKey(sessionId: string) {
  return `${GOALS_TAB_STORAGE_KEY}::${sessionId}`;
}

function createGoalsTabSessionId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ====================================================================== */

export function GoalsPage() {
  return (
    <PlannerProvider>
      <GoalsPageContent />
    </PlannerProvider>
  );
}

function GoalsPageContent() {
  const searchParams = useSearchParams();
  const [tabStorageKey, setTabStorageKey] = React.useState<string>(
    GOALS_TAB_STORAGE_KEY,
  );
  const [tab, setTab] = usePersistentState<Tab>(tabStorageKey, "goals", {
    decode: (value) => (isTabValue(value) ? value : null),
  });
  const hasMigratedTabKeyRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const scopeStorage = window.sessionStorage;
      let sessionId = scopeStorage.getItem(GOALS_TAB_SESSION_SCOPE_KEY);
      if (!sessionId || sessionId.trim().length === 0) {
        sessionId = createGoalsTabSessionId();
        scopeStorage.setItem(GOALS_TAB_SESSION_SCOPE_KEY, sessionId);
      }
      const scopedKey = buildSessionScopedTabKey(sessionId);
      setTabStorageKey((prev) => (prev === scopedKey ? prev : scopedKey));
    } catch {
      setTabStorageKey(GOALS_TAB_STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (hasMigratedTabKeyRef.current) return;
    if (tabStorageKey === GOALS_TAB_STORAGE_KEY) return;
    hasMigratedTabKeyRef.current = true;

    const existingScoped = readLocal<Tab>(tabStorageKey);
    if (existingScoped !== null && isTabValue(existingScoped)) {
      if (existingScoped !== tab) {
        setTab(existingScoped);
      }
    } else {
      const legacy = readLocal<Tab>(GOALS_TAB_STORAGE_KEY);
      if (legacy !== null && isTabValue(legacy) && legacy !== tab) {
        setTab(legacy);
      }
    }

    removeLocal(GOALS_TAB_STORAGE_KEY);
  }, [tabStorageKey, tab, setTab]);

  const [filter, setFilter] = usePersistentState<SegmentFilterKey>(
    "goals.filter.v1",
    "All",
    {
      decode: (value) => (isSegmentFilterKey(value) ? value : null),
    },
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

  const formRef = React.useRef<HTMLDivElement | null>(null);
  const goalFormRef = React.useRef<GoalsInsetFormHandle>(null);
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

  const handleOpenNuke = React.useCallback(() => {
    setConfirmClearOpen(true);
  }, []);

  const handleCloseNuke = React.useCallback(() => {
    setConfirmClearOpen(false);
  }, []);

  const handleAddGoal = React.useCallback(
    (values: EntityFormValues) => {
      const trimmedTitle = values.title?.trim() ?? "";
      if (!trimmedTitle) {
        return false;
      }

      const metric = values.metric?.trim() ?? "";
      const notes = values.notes?.trim() ?? "";

      const ok = addGoal({
        title: trimmedTitle,
        metric,
        notes,
        pillar: "",
      });

      if (ok) {
        goalFormRef.current?.focus({ preventScroll: true });
      }

      return ok;
    },
    [addGoal],
  );

  const startGoalCreation = React.useCallback(() => {
    setTab("goals");
    setShouldFocusGoalForm(true);
  }, [setTab]);

  const tabParam = searchParams?.get("tab") ?? null;
  React.useEffect(() => {
    if (tabParam === null) return;

    if (isTabValue(tabParam)) {
      if (tabParam !== tab) {
        setTab(tabParam);
      }
      return;
    }

    if (tab !== "goals") {
      setTab("goals");
    }
  }, [tabParam, tab, setTab]);

  const filterParam = searchParams?.get("filter") ?? null;
  React.useEffect(() => {
    if (filterParam === null) return;

    if (filterParam === NEW_GOAL_FILTER) {
      startGoalCreation();
      return;
    }

    if (isSegmentFilterKey(filterParam)) {
      if (filterParam !== filter) {
        setFilter(filterParam);
      }
      return;
    }

    if (filter !== "All") {
      setFilter("All");
    }
  }, [filterParam, filter, setFilter, startGoalCreation]);

  const handleTabChange = React.useCallback(
    (value: string) => {
      if (isTabValue(value)) {
        setTab(value);
        return;
      }
      setTab("goals");
    },
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
    goalFormRef.current?.focus({ preventScroll: true });
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
  const isAtCap = remaining === 0;
  const pctDone = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const activePctOfCap =
    ACTIVE_CAP > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((Math.min(activeCount, ACTIVE_CAP) / ACTIVE_CAP) * 100)),
        )
      : 0;
  const remainingPctOfCap =
    ACTIVE_CAP > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((Math.min(remaining, ACTIVE_CAP) / ACTIVE_CAP) * 100)),
        )
      : 0;
  const activeCapNumber = Number(ACTIVE_CAP);
  const activeSlotLabel = activeCapNumber === 1 ? "slot" : "slots";

  const goalMetrics = React.useMemo(
    () => [
      {
        key: "completed" as const,
        label: "Completed",
        percent: pctDone,
        percentLabel: `${pctDone}%`,
        valueLabel: doneCount.toString(),
        detail:
          totalCount === 0
            ? "of 0 goals"
            : `of ${totalCount} ${totalCount === 1 ? "goal" : "goals"}`,
        progressClassName: "text-success",
        trackClassName: "text-success/20",
        srText: `Completed ${doneCount} of ${totalCount} ${totalCount === 1 ? "goal" : "goals"}`,
      },
      {
        key: "active" as const,
        label: "Active",
        percent: activePctOfCap,
        percentLabel: `${activePctOfCap}%`,
        valueLabel: activeCount.toString(),
        detail: `of ${activeCapNumber} ${activeSlotLabel} used`,
        progressClassName: "text-primary",
        trackClassName: "text-primary/20",
        srText: `Active ${activeCount} of ${activeCapNumber} ${activeSlotLabel} used`,
      },
      {
        key: "remaining" as const,
        label: "Remaining",
        percent: remainingPctOfCap,
        percentLabel: `${remainingPctOfCap}%`,
        valueLabel: remaining.toString(),
        detail: `${remaining === 1 ? "slot" : "slots"} left`,
        progressClassName: "text-accent-3",
        trackClassName: "text-accent-3/25",
        srText: `${remaining} active ${remaining === 1 ? "slot" : "slots"} remaining`,
      },
    ],
    [
      activeCapNumber,
      activeCount,
      activePctOfCap,
      activeSlotLabel,
      doneCount,
      pctDone,
      remaining,
      remainingPctOfCap,
      totalCount,
    ],
  );

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
      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <div
          className="relative flex h-[var(--ring-diameter-l)] w-[var(--ring-diameter-l)] items-center justify-center"
          role="img"
          aria-label={`${pctDone}% of goals complete`}
        >
          <ProgressRing
            value={pctDone}
            className="text-foreground/15"
            progressClassName="text-success"
            trackClassName="text-success/20"
            aria-hidden
          />
          <span className="absolute text-title font-semibold tracking-[-0.01em] text-foreground">
            {pctDone}%
          </span>
        </div>
        <div className="flex flex-col gap-[var(--space-1)]">
          <p className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Progress
          </p>
          <p className="text-ui text-muted-foreground">
            <span className="font-semibold text-foreground">{doneCount}</span> completed
            {totalCount > 0 ? (
              <>
                {" "}
                of <span className="font-semibold text-foreground">{totalCount}</span>
              </>
            ) : null}
            {" · "}
            <span className="font-semibold text-foreground">{remaining}</span>{" "}
            {remaining === 1 ? "slot" : "slots"} left
          </p>
        </div>
      </div>
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
      <span id={heroSubtitleId} className="text-muted-foreground">
        Set and achieve your objectives.
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
      items: DOMAIN_ITEMS as HeaderTab<Tab | Domain>[],
      value: domain as Tab | Domain,
      onChange: (key: Tab | Domain) => handleDomainChange(key as Domain),
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

  const heroActions = React.useMemo(() => {
    if (tab === "reminders") {
      return (
        <Button
          variant="default"
          size="md"
          className="whitespace-nowrap"
          onClick={handleAddReminder}
        >
          <Plus />
          <span>New Reminder</span>
        </Button>
      );
    }

    if (tab === "goals") {
      return (
        <div className="flex w-full flex-col gap-[var(--space-2)] md:w-auto md:flex-row md:items-center md:justify-end md:gap-[var(--space-3)]">
          <Button
            type="button"
            size="sm"
            variant="default"
            className="w-full shrink-0 md:w-auto"
            onClick={startGoalCreation}
          >
            <Plus aria-hidden="true" className="size-[var(--space-4)]" />
            <span className="font-semibold tracking-[0.01em]">Add Goal</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full shrink-0 md:w-auto"
            onClick={handleOpenNuke}
            disabled={totalCount === 0}
            aria-haspopup="dialog"
            aria-controls={confirmClearOpen ? nukeDialogId : undefined}
            title="Delete all goals"
          >
            <Bomb aria-hidden="true" className="size-[var(--space-4)]" />
            <span className="font-semibold tracking-[0.01em]">Reset All Goals</span>
          </Button>
        </div>
      );
    }

    return undefined;
  }, [
    tab,
    handleAddReminder,
    handleOpenNuke,
    totalCount,
    confirmClearOpen,
    nukeDialogId,
    startGoalCreation,
  ]);

  return (
    <>
      <PageShell as="header" grid className="py-[var(--space-6)]">
        <Hero<Tab | Domain>
          id={HERO_REGION_ID}
          role="region"
          aria-labelledby={heroHeadingId}
          aria-describedby={heroAriaDescribedby}
          icon={<Flag className="opacity-80" />}
          eyebrow="Goals"
          title={heroHeading}
          subtitle={heroSubtitle}
          sticky={false}
          glitch={tab === "goals" ? "off" : "subtle"}
          topClassName={GOALS_STICKY_TOP_CLASS}
          dividerTint={heroDividerTint}
          tabs={{
            items: TABS,
            value: tab,
            onChange: handleTabChange,
            ariaLabel: "Goals header mode",
            idBase: GOALS_TABS_ID_BASE,
          }}
          subTabs={reminderHeroSubTabs}
          searchBar={reminderHeroSearch}
          actions={heroActions}
          illustration={<SmallAgnesNoxiImage />}
          illustrationAlt="Agnes and Noxi cheering on your goal progress"
          className="col-span-full md:col-span-12"
        >
          <div className="space-y-[var(--space-3)]">
            <span className="text-label font-semibold tracking-[0.02em] uppercase text-muted-foreground">
              {heroEyebrow}
            </span>
            {summary}
          </div>
        </Hero>
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        aria-labelledby={heroHeadingId}
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
                  <Card className="p-0">
                    <CardHeader
                      className={`sticky ${GOALS_STICKY_TOP_CLASS} z-[1] flex flex-col gap-[var(--space-3)] space-y-0 border-b border-card-hairline/60 bg-card/90 px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between`}
                    >
                      <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-4)]">
                        <h2 className="text-title font-semibold tracking-[-0.01em]">Your Goals</h2>
                        <GoalsProgress total={totalCount} pct={pctDone} />
                      </div>
                      <div className="flex w-full flex-col gap-[var(--space-2)] sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-[var(--space-3)]">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          className="w-full shrink-0 sm:w-auto"
                          onClick={startGoalCreation}
                        >
                          <Plus aria-hidden="true" className="size-[var(--space-4)]" />
                          <span className="font-semibold tracking-[0.01em]">New goal</span>
                        </Button>
                        <GoalsTabs
                          value={filter}
                          onChange={setFilter}
                          onNewGoal={startGoalCreation}
                          newGoalDisabled={isAtCap}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-4)]">
                      <dl className="grid gap-[var(--space-3)] sm:grid-cols-3">
                        {goalMetrics.map((metric) => (
                          <div
                            key={metric.key}
                            className="flex items-center gap-[var(--space-3)] rounded-card border border-card-hairline/60 bg-card/60 p-[var(--space-3)] shadow-neo-soft"
                          >
                            <div
                              className="relative flex h-[var(--ring-diameter-m)] w-[var(--ring-diameter-m)] items-center justify-center rounded-full bg-panel-tilt"
                              aria-hidden="true"
                            >
                              <ProgressRing
                                value={metric.percent}
                                className="text-foreground/30"
                                progressClassName={metric.progressClassName}
                                trackClassName={metric.trackClassName}
                                aria-hidden={true}
                              />
                              <span className="absolute text-label font-semibold tracking-[0.02em] tabular-nums">
                                {metric.percentLabel}
                              </span>
                            </div>
                            <div className="flex flex-col gap-[var(--space-1)]">
                              <dt className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                {metric.label}
                              </dt>
                              <dd className="text-title font-semibold tracking-[-0.01em] text-foreground">
                                <span className="sr-only">{metric.srText}</span>
                                <span aria-hidden>
                                  {metric.valueLabel}
                                  <span className="ml-[var(--space-1)] text-label font-medium text-muted-foreground">
                                    {metric.detail}
                                  </span>
                                </span>
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                      {totalCount === 0 ? (
                        <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-6)] text-center">
                          <p className="text-ui font-medium text-muted-foreground">No goals yet.</p>
                          <Button onClick={handleAddFirst} size="sm" variant="default">
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
                    </CardContent>
                  </Card>
                </div>

                <div ref={formRef} id="goal-form">
                  <GoalsInsetForm
                    ref={goalFormRef}
                    isAtCap={isAtCap}
                    remaining={remaining}
                    errorMessage={err}
                    onSubmit={handleAddGoal}
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
          className="shadow-[var(--depth-shadow-soft)]"
        >
          <CardHeader className="space-y-[var(--space-2)]">
            <CardTitle id={nukeHeadingId}>Delete all goals?</CardTitle>
            <CardDescription id={nukeDescriptionId}>
              This action permanently removes every goal, including completed history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-[var(--space-3)]">
            <div className="rounded-card border border-danger/40 bg-danger/10 px-[var(--space-4)] py-[var(--space-3)] text-left shadow-neo">
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
              variant="default"
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
              variant="quiet"
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

const createDefaultGoalFormValues = () => ({
  title: "",
  metric: "",
  notes: "",
});

const InsetTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function InsetTextarea(
    { className, textareaClassName, resize, id, name, "aria-label": ariaLabel, ...props },
    ref,
  ) {
    const { id: finalId, name: finalName, isInvalid } = useFieldIds(
      ariaLabel as string | undefined,
      id,
      name,
      {
        ariaInvalid: props["aria-invalid"],
        slugifyFallback: true,
      },
    );
    const loadingAttr = props["data-loading"];
    const loading =
      loadingAttr === "" ||
      loadingAttr === true ||
      loadingAttr === "true" ||
      loadingAttr === 1;

    return (
      <Field.Root
        variant="sunken"
        invalid={isInvalid}
        disabled={props.disabled}
        readOnly={props.readOnly}
        loading={loading}
        className={cn("items-start", className)}
      >
        <Field.Textarea
          ref={ref}
          id={finalId}
          name={finalName}
          aria-label={ariaLabel}
          className={cn(resize, textareaClassName)}
          {...props}
        />
      </Field.Root>
    );
  },
);

const GoalsInsetForm = React.forwardRef<GoalsInsetFormHandle, GoalsInsetFormProps>(
  ({ isAtCap, remaining, errorMessage, onSubmit }, ref) => {
    const [values, setValues] = React.useState(createDefaultGoalFormValues);
    const titleInputRef = React.useRef<HTMLInputElement | null>(null);

    const titleId = React.useId();
    const metricId = React.useId();
    const notesId = React.useId();
    const metricHelpId = React.useId();

    const resetValues = React.useCallback(() => {
      setValues(createDefaultGoalFormValues());
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        focus: (options) => {
          titleInputRef.current?.focus(options);
        },
        reset: () => {
          resetValues();
        },
      }),
      [resetValues],
    );

    const handleInputChange = React.useCallback(
      (field: "title" | "metric") =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = event.target;
          setValues((previous) => ({ ...previous, [field]: value }));
        },
      [],
    );

    const handleNotesChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        setValues((previous) => ({ ...previous, notes: value }));
      },
      [],
    );

    const handleSubmit = React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!onSubmit || isAtCap) {
          return;
        }

        const result = await onSubmit({
          title: values.title,
          metric: values.metric,
          notes: values.notes,
        });

        if (result !== false) {
          resetValues();
        }
      },
      [isAtCap, onSubmit, resetValues, values.metric, values.notes, values.title],
    );

    const handleCancel = React.useCallback(() => {
      resetValues();
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        active.blur();
      }
    }, [resetValues]);

    const remainingMessage = isAtCap
      ? "Cap reached. Finish one to add more."
      : `${remaining} active slot${remaining === 1 ? "" : "s"} left`;

    return (
      <form className="space-y-[var(--space-4)]" onSubmit={handleSubmit}>
        <Card className="shadow-[var(--depth-shadow-soft)]">
          <CardHeader className="space-y-[var(--space-2)]">
            <CardTitle>Add Goal</CardTitle>
            <CardDescription>
              Capture focused, finishable targets for your next session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <Label htmlFor={titleId}>Title</Label>
              <Input
                id={titleId}
                ref={titleInputRef}
                placeholder="Review lane states"
                value={values.title}
                onChange={handleInputChange("title")}
                required
                variant="sunken"
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <div className="flex items-center justify-between gap-[var(--space-2)]">
                <Label htmlFor={metricId} className="mb-0">
                  Metric (optional — enter the target value; for percentages, type the number like 75)
                </Label>
                <AIExplainTooltip
                  triggerLabel="How metrics help"
                  explanation="Metrics surface on each goal card so you can track progress against a specific target. Enter the value you want to hit, and for percentages, type only the number—for example, 75 instead of adding a percent sign. Leave it blank if a number doesn't help."
                  tone="neutral"
                />
              </div>
              <p id={metricHelpId} className="sr-only">
                Optional metric for tracking progress. Enter the target value only; for percentages, type the number such as 75 for seventy-five percent so the field stays free of extra symbols.
              </p>
              <Input
                id={metricId}
                type="text"
                inputMode="decimal"
                placeholder="75"
                value={values.metric}
                onChange={handleInputChange("metric")}
                aria-describedby={metricHelpId}
                variant="sunken"
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <Label htmlFor={notesId}>Notes (optional)</Label>
              <InsetTextarea
                id={notesId}
                placeholder="Add context, blockers, or reminders"
                value={values.notes}
                onChange={handleNotesChange}
                resize="resize-y"
                className="border border-card-hairline/70"
                textareaClassName="min-h-[var(--space-20)]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-label font-medium tracking-[0.02em] text-muted-foreground">
              {isAtCap ? (
                <span className="text-danger">{remainingMessage}</span>
              ) : (
                <span>{remainingMessage}</span>
              )}
            </p>
            <div className="flex items-center gap-[var(--space-2)]">
              <Button type="submit" size="sm" variant="default" disabled={isAtCap}>
                Add Goal
              </Button>
              <Button type="button" size="sm" variant="quiet" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>

        {errorMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="text-label font-medium tracking-[0.02em] text-danger"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>
    );
  },
);

GoalsInsetForm.displayName = "GoalsInsetForm";
