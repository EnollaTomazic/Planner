import type { CSSProperties, ElementType } from "react";

import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Flame,
  MapPin,
  Radio,
  Sparkles,
} from "lucide-react";

import { ProgressRingIcon } from "@/icons";
import {
  Badge,
  Button,
  Grid,
  type GridTemplate,
  NeoCard,
  PageShell,
  Skeleton,
  Stack,
  Switcher,
} from "@/components/ui";
import { PageHero } from "@/components/ui/layout/PageHero";

import styles from "./page.module.css";

type DashboardArea = "summary" | "switcher" | "tasks" | "calendar" | "cta";

type Stat = {
  readonly label: string;
  readonly value: string;
  readonly helper?: string;
};

type QuickPanel = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly meta: string;
  readonly icon: ElementType;
};

type Task = {
  readonly id: string;
  readonly title: string;
  readonly project: string;
  readonly time: string;
  readonly intensity: string;
};

type CalendarCell = {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly role: "header" | "day";
  readonly tone?: "focus" | "review" | "break";
  readonly isCurrent?: boolean;
};

const SWITCHER_MIN_ITEM_WIDTH = "calc(var(--space-8) * 4)";
const SWITCHER_THRESHOLD = "calc(var(--space-8) * 5 + var(--space-12) * 2)";

const MOBILE_TEMPLATE: GridTemplate<DashboardArea> = [
  ["summary"],
  ["switcher"],
  ["tasks"],
  ["calendar"],
  ["cta"],
];

const MOBILE_TEMPLATE_STRING = (
  ["summary", "switcher", "tasks", "calendar", "cta"] as const
)
  .map((area) => `"${area}"`)
  .join(" ");

type DashboardGridStyle = CSSProperties & {
  "--dashboard-grid"?: string;
};

const GRID_STYLE: DashboardGridStyle = {
  gridTemplateAreas: "var(--dashboard-grid)",
  "--dashboard-grid": MOBILE_TEMPLATE_STRING,
};

const SUMMARY_STATS: readonly Stat[] = [
  { label: "Focus streak", value: "12 days" },
  { label: "Games reviewed", value: "5", helper: "Last 24h" },
  { label: "Action items", value: "8", helper: "3 due today" },
  { label: "Coach pings", value: "2", helper: "New responses" },
];

const QUICK_PANELS: readonly QuickPanel[] = [
  {
    id: "scrim-block",
    title: "Scrim block",
    description: "Lock 15:00 – 18:00 for Nova’s macro breakdown and VOD review.",
    meta: "Time blocked",
    icon: Clock3,
  },
  {
    id: "lane-review",
    title: "Lane review",
    description: "Top lane swaps with mid at 12:30. Confirm champ pool adjustments.",
    meta: "Needs attention",
    icon: MapPin,
  },
  {
    id: "signal-boost",
    title: "Signal boost",
    description: "Share highlight reel with the roster before the nightly scrim.",
    meta: "Due tonight",
    icon: Sparkles,
  },
];

const TASKS: readonly Task[] = [
  {
    id: "task-align-macro",
    title: "Annotate macro decision tree",
    project: "Nova scrim 042",
    time: "09:45",
    intensity: "High focus",
  },
  {
    id: "task-review-mid",
    title: "Review mid lane rotations",
    project: "Nova coaching",
    time: "11:30",
    intensity: "Medium",
  },
  {
    id: "task-sync-coaches",
    title: "Sync with assistant coaches",
    project: "Staff huddle",
    time: "14:15",
    intensity: "Collab",
  },
];

const CALENDAR_CELLS: readonly CalendarCell[] = [
  { id: "header-s", label: "S", ariaLabel: "Sunday", role: "header" },
  { id: "header-m", label: "M", ariaLabel: "Monday", role: "header" },
  { id: "header-t", label: "T", ariaLabel: "Tuesday", role: "header" },
  { id: "header-w", label: "W", ariaLabel: "Wednesday", role: "header" },
  { id: "header-th", label: "T", ariaLabel: "Thursday", role: "header" },
  { id: "header-f", label: "F", ariaLabel: "Friday", role: "header" },
  { id: "header-sa", label: "S", ariaLabel: "Saturday", role: "header" },
  { id: "day-3", label: "3", ariaLabel: "Sunday the 3rd", role: "day", tone: "break" },
  { id: "day-4", label: "4", ariaLabel: "Monday the 4th", role: "day", tone: "focus" },
  { id: "day-5", label: "5", ariaLabel: "Tuesday the 5th", role: "day", tone: "review" },
  { id: "day-6", label: "6", ariaLabel: "Wednesday the 6th", role: "day" },
  {
    id: "day-7",
    label: "7",
    ariaLabel: "Thursday the 7th — team review",
    role: "day",
    tone: "focus",
  },
  { id: "day-8", label: "8", ariaLabel: "Friday the 8th", role: "day" },
  { id: "day-9", label: "9", ariaLabel: "Saturday the 9th", role: "day", tone: "break" },
  { id: "day-10", label: "10", ariaLabel: "Sunday the 10th", role: "day" },
  { id: "day-11", label: "11", ariaLabel: "Monday the 11th", role: "day", tone: "review" },
  {
    id: "day-12",
    label: "12",
    ariaLabel: "Tuesday the 12th — scrim focus window",
    role: "day",
    tone: "focus",
    isCurrent: true,
  },
  { id: "day-13", label: "13", ariaLabel: "Wednesday the 13th", role: "day" },
  { id: "day-14", label: "14", ariaLabel: "Thursday the 14th", role: "day" },
  { id: "day-15", label: "15", ariaLabel: "Friday the 15th", role: "day", tone: "review" },
  { id: "day-16", label: "16", ariaLabel: "Saturday the 16th", role: "day", tone: "break" },
  { id: "day-17", label: "17", ariaLabel: "Sunday the 17th", role: "day" },
  { id: "day-18", label: "18", ariaLabel: "Monday the 18th", role: "day", tone: "focus" },
  { id: "day-19", label: "19", ariaLabel: "Tuesday the 19th", role: "day" },
  { id: "day-20", label: "20", ariaLabel: "Wednesday the 20th", role: "day" },
  { id: "day-21", label: "21", ariaLabel: "Thursday the 21st", role: "day", tone: "review" },
  { id: "day-22", label: "22", ariaLabel: "Friday the 22nd", role: "day" },
  { id: "day-23", label: "23", ariaLabel: "Saturday the 23rd", role: "day", tone: "break" },
  { id: "day-24", label: "24", ariaLabel: "Sunday the 24th", role: "day" },
  { id: "day-25", label: "25", ariaLabel: "Monday the 25th", role: "day" },
  { id: "day-26", label: "26", ariaLabel: "Tuesday the 26th", role: "day", tone: "focus" },
  { id: "day-27", label: "27", ariaLabel: "Wednesday the 27th", role: "day" },
  { id: "day-28", label: "28", ariaLabel: "Thursday the 28th", role: "day" },
  { id: "day-29", label: "29", ariaLabel: "Friday the 29th", role: "day", tone: "review" },
  { id: "day-30", label: "30", ariaLabel: "Saturday the 30th", role: "day" },
  { id: "day-31", label: "31", ariaLabel: "Sunday the 31st", role: "day", tone: "break" },
];

const TASK_SKELETON_COUNT = 3;
const CALENDAR_SKELETON_COUNT = 2;

export const metadata: Metadata = {
  title: "Dashboard layout preview",
  description:
    "Demonstrates the adaptive dashboard composition that anchors planner previews across screen sizes and container breakpoints.",
};

export default function DashboardLayoutPreviewPage() {
  const pageTitleId = "dashboard-preview-heading";
  const summaryHeadingId = "dashboard-summary-heading";
  const switcherHeadingId = "dashboard-switcher-heading";
  const tasksHeadingId = "dashboard-tasks-heading";
  const calendarHeadingId = "dashboard-calendar-heading";
  const ctaHeadingId = "dashboard-cta-heading";

  return (
    <>
      <PageShell as="header" grid className="py-[var(--space-7)]">
        <PageHero
          id={pageTitleId}
          accent="supportive"
          frame={false}
          glitch="off"
          eyebrow={<span className="normal-case">Planner previews</span>}
          title="Dashboard layout preview"
        >
          <div className="space-y-[var(--space-3)]">
            <span className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-card-hairline bg-muted/18 px-[var(--space-3)] py-[var(--space-1)] text-label text-muted-foreground">
              <Radio aria-hidden="true" className="size-[var(--space-4)]" />
              Adaptive grid
            </span>
            <p className="max-w-prose text-body text-muted-foreground">
              The dashboard frame balances focus, scheduling, and upgrades using the new layout primitives. Container queries
              drive the responsive flow from mobile through desktop without sacrificing neumorphic depth or accessibility.
            </p>
          </div>
        </PageHero>
      </PageShell>

      <PageShell
        as="main"
        className="py-[var(--space-7)]"
        aria-labelledby={pageTitleId}
      >
        <Grid
          className={styles.layout}
          template={MOBILE_TEMPLATE}
          areas={{
            summary: (
              <NeoCard asChild className={styles.summaryCard}>
                <section
                  role="region"
                  aria-labelledby={summaryHeadingId}
                >
                  <header className={styles.summaryPrimary}>
                    <div className={styles.avatarGroup}>
                      <span className={styles.avatarHalo} aria-hidden="true">
                      <span className={styles.avatarInitials}>JP</span>
                    </span>
                    <div className={styles.summaryText}>
                      <p className="text-label text-muted-foreground">Squad lead</p>
                      <h2
                        id={summaryHeadingId}
                        className="text-title font-semibold tracking-[-0.01em] text-card-foreground"
                      >
                        Jasmine Park
                      </h2>
                      <p className="text-ui text-muted-foreground">
                        Coaching Nova through their post-scrim review. Highlights auto-share with the roster once summaries lock.
                      </p>
                    </div>
                  </div>
                  <div className={styles.summaryProgress} aria-label="Daily progress">
                    <span className={styles.progressRing} aria-hidden="true">
                      <ProgressRingIcon pct={72} size="m" />
                    </span>
                    <div className="text-right">
                      <p className="text-label text-muted-foreground">Daily progress</p>
                      <p className="text-title font-semibold tracking-[-0.01em] text-card-foreground">72%</p>
                      <p className="text-label text-muted-foreground">Focus target: 80%</p>
                    </div>
                  </div>
                </header>

                <div className={styles.summaryMeta}>
                  <span className={styles.modeChip} role="status" aria-live="polite">
                    Focus mode
                  </span>
                  <dl className={styles.summaryStats}>
                    {SUMMARY_STATS.map((stat) => (
                      <div key={stat.label} className={styles.summaryStat}>
                        <dt className="text-label text-muted-foreground">{stat.label}</dt>
                        <dd className="text-title font-semibold tracking-[-0.01em] text-card-foreground">
                          {stat.value}
                        </dd>
                        {stat.helper ? (
                          <dd className="text-label text-muted-foreground">{stat.helper}</dd>
                        ) : null}
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
              </NeoCard>
            ),
            switcher: (
              <section
                aria-labelledby={switcherHeadingId}
                className={styles.switcherSection}
              >
                <Stack gap="4">
                  <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                    <div>
                      <p className="text-label text-muted-foreground">Quick signals</p>
                      <h2
                        id={switcherHeadingId}
                        className="text-title font-semibold tracking-[-0.01em] text-foreground"
                      >
                        Team radar
                      </h2>
                    </div>
                    <Badge size="xs" tone="neutral" aria-label="Updates in sync">
                      Synced 2m ago
                    </Badge>
                  </div>
                  <Switcher
                    className={styles.switcher}
                    minItemWidth={SWITCHER_MIN_ITEM_WIDTH}
                    threshold={SWITCHER_THRESHOLD}
                  >
                    {QUICK_PANELS.map((panel) => {
                      const Icon = panel.icon;
                      return (
                        <NeoCard key={panel.id} asChild className={styles.switcherCard}>
                          <article aria-labelledby={`${panel.id}-title`}>
                            <header className="flex items-start justify-between gap-[var(--space-3)]">
                              <span className="inline-flex items-center gap-[var(--space-2)] text-title font-semibold tracking-[-0.01em]">
                                <Icon aria-hidden="true" className="size-[var(--space-5)]" />
                                <span id={`${panel.id}-title`} className="text-card-foreground">
                                  {panel.title}
                                </span>
                              </span>
                              <span className="rounded-full border border-card-hairline bg-muted/18 px-[var(--space-3)] py-[var(--space-1)] text-label text-muted-foreground">
                                {panel.meta}
                              </span>
                            </header>
                            <p className="text-ui text-muted-foreground">{panel.description}</p>
                            <div className="flex items-center gap-[var(--space-2)] text-label text-muted-foreground">
                              <CalendarDays aria-hidden="true" className="size-[var(--space-4)]" />
                              Upcoming review window locked
                            </div>
                          </article>
                        </NeoCard>
                      );
                    })}
                  </Switcher>
                </Stack>
              </section>
            ),
            tasks: (
              <NeoCard asChild className={styles.tasksCard}>
                <section
                  role="region"
                  aria-labelledby={tasksHeadingId}
                >
                  <Stack gap="4">
                    <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                      <div>
                        <p className="text-label text-muted-foreground">Today’s focus</p>
                        <h2
                          id={tasksHeadingId}
                          className="text-title font-semibold tracking-[-0.01em] text-card-foreground"
                        >
                          Action queue
                        </h2>
                      </div>
                      <Badge size="xs" tone="neutral">
                        Auto-sync on
                      </Badge>
                    </div>
                    <div className={styles.taskList} role="list" aria-live="polite">
                      {TASKS.map((task) => (
                        <article key={task.id} role="listitem" className={styles.taskItem}>
                          <header className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                            <p className="text-ui font-medium text-card-foreground">{task.title}</p>
                            <span className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-card-hairline bg-muted/14 px-[var(--space-3)] py-[var(--space-1)] text-label text-muted-foreground">
                              <Clock3 aria-hidden="true" className="size-[var(--space-4)]" />
                              {task.time}
                            </span>
                          </header>
                          <div className={styles.taskMeta}>
                            <span className="text-label text-muted-foreground">{task.project}</span>
                            <span className="text-label text-muted-foreground">
                              <Flame aria-hidden="true" className="size-[var(--space-4)]" />
                              {task.intensity}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div
                      className={styles.skeletonList}
                      role="status"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <span className="sr-only">Loading additional tasks</span>
                      {Array.from({ length: TASK_SKELETON_COUNT }).map((_, index) => (
                        <Skeleton
                          key={`task-skeleton-${index}`}
                          radius="card"
                          className="h-[var(--space-8)]"
                        />
                      ))}
                    </div>
                  </Stack>
              </section>
              </NeoCard>
            ),
            calendar: (
              <NeoCard asChild className={styles.calendarCard}>
                <section
                  role="region"
                  aria-labelledby={calendarHeadingId}
                >
                  <Stack gap="4">
                    <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
                      <div>
                        <p className="text-label text-muted-foreground">Week of March 10</p>
                        <h2
                          id={calendarHeadingId}
                          className="text-title font-semibold tracking-[-0.01em] text-card-foreground"
                        >
                          Mini calendar
                        </h2>
                      </div>
                      <Badge size="xs" tone="accent">
                        Sync with planner
                      </Badge>
                    </div>
                    <div
                      className={styles.calendarGrid}
                      role="grid"
                      aria-labelledby={calendarHeadingId}
                    >
                      {CALENDAR_CELLS.map((cell) => (
                        <span
                          key={cell.id}
                          role={cell.role === "header" ? "columnheader" : "gridcell"}
                          aria-label={cell.ariaLabel}
                          data-role={cell.role}
                          data-current={cell.isCurrent ? "true" : undefined}
                          className={styles.calendarDay}
                          data-tone={cell.tone}
                        >
                          {cell.label}
                        </span>
                      ))}
                    </div>
                    <div className={styles.calendarLegend}>
                      <span className={styles.legendItem}>
                        <span className={styles.legendSwatch} data-tone="focus" aria-hidden="true" /> Focus block
                      </span>
                      <span className={styles.legendItem}>
                        <span className={styles.legendSwatch} data-tone="review" aria-hidden="true" /> Review session
                      </span>
                      <span className={styles.legendItem}>
                        <span className={styles.legendSwatch} data-tone="break" aria-hidden="true" /> Recovery
                      </span>
                    </div>
                    <div
                      className={styles.calendarSkeleton}
                      role="status"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <span className="sr-only">Loading calendar insights</span>
                      {Array.from({ length: CALENDAR_SKELETON_COUNT }).map((_, index) => (
                        <Skeleton
                          key={`calendar-skeleton-${index}`}
                          radius="card"
                          className="h-[var(--space-7)]"
                        />
                      ))}
                    </div>
                  </Stack>
              </section>
              </NeoCard>
            ),
            cta: (
              <NeoCard asChild className={styles.ctaCard}>
                <aside
                  id="upgrade"
                  role="complementary"
                  aria-labelledby={ctaHeadingId}
                >
                  <Stack gap="4">
                    <div className="space-y-[var(--space-1)]">
                      <p className="text-label text-muted-foreground">Upgrade</p>
                      <h2
                        id={ctaHeadingId}
                        className="text-title font-semibold tracking-[-0.01em] text-card-foreground"
                      >
                        Unlock team playback & overlays
                      </h2>
                    </div>
                    <p className="text-body text-muted-foreground">
                      Invite your staff, auto-share annotations across scrim blocks, and surface heatmaps directly in reviews.
                      Planner keeps focus frames sticky while respecting reduced motion.
                    </p>
                    <div className={styles.ctaActions}>
                      <Button size="md" variant="default" tone="accent" asChild>
                        <Link href="#upgrade" aria-label="Upgrade to Planner Pro">
                          Start trial
                        </Link>
                      </Button>
                      <Button size="md" variant="quiet" tone="accent" asChild>
                        <Link href="#compare" aria-label="Compare plans">
                          Compare plans
                        </Link>
                      </Button>
                    </div>
                    <p className="text-label text-muted-foreground">Team invites remaining: 3</p>
                  </Stack>
              </aside>
              </NeoCard>
            ),
          }}
          style={GRID_STYLE}
          columns="var(--dashboard-columns)"
          gap="5"
          rowGap="6"
        />
        <section
          id="compare"
          aria-hidden="true"
          className="sr-only"
        />
      </PageShell>
    </>
  );
}
