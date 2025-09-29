"use client";

import * as React from "react";
import {
  Button,
  Cluster,
  IconButton,
  Skeleton,
  Switcher,
} from "@/components/ui";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import styles from "./CalendarLayoutPreview.module.css";

const HOURS: readonly string[] = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
];

type CalendarEventTone = "accent" | "primary" | "info";

type CalendarEvent = {
  id: string;
  title: string;
  rangeLabel: string;
  details: string;
  startSlot: number;
  span: number;
  tone: CalendarEventTone;
};

type CalendarDay = {
  id: string;
  iso: string;
  shortLabel: string;
  longLabel: string;
  summary: string;
  isToday?: boolean;
  isFocused?: boolean;
  events: readonly CalendarEvent[];
};

const CALENDAR_DAYS: readonly CalendarDay[] = [
  {
    id: "mon",
    iso: "2024-04-22",
    shortLabel: "Mon 22",
    longLabel: "Monday, April 22",
    summary: "Focus sprint",
    isFocused: true,
    events: [
      {
        id: "retro",
        title: "Retro sync",
        rangeLabel: "08:30 – 09:15",
        details: "Squad North",
        startSlot: 0,
        span: 1,
        tone: "accent",
      },
      {
        id: "reviews",
        title: "Highlight reviews",
        rangeLabel: "10:00 – 11:00",
        details: "2 owners",
        startSlot: 2,
        span: 2,
        tone: "primary",
      },
    ],
  },
  {
    id: "tue",
    iso: "2024-04-23",
    shortLabel: "Tue 23",
    longLabel: "Tuesday, April 23",
    summary: "Delivery ops",
    events: [
      {
        id: "standup",
        title: "Squad standup",
        rangeLabel: "09:00 – 09:20",
        details: "All hands",
        startSlot: 1,
        span: 1,
        tone: "accent",
      },
      {
        id: "planning",
        title: "Roadmap planning",
        rangeLabel: "11:00 – 12:00",
        details: "Sprint scope",
        startSlot: 3,
        span: 2,
        tone: "info",
      },
    ],
  },
  {
    id: "wed",
    iso: "2024-04-24",
    shortLabel: "Wed 24",
    longLabel: "Wednesday, April 24",
    summary: "Strategy review",
    events: [
      {
        id: "1-1",
        title: "1:1 Coaching",
        rangeLabel: "08:30 – 09:00",
        details: "With Riley",
        startSlot: 0,
        span: 1,
        tone: "primary",
      },
      {
        id: "workshop",
        title: "Workshop block",
        rangeLabel: "10:00 – 12:30",
        details: "Design systems",
        startSlot: 2,
        span: 3,
        tone: "accent",
      },
    ],
  },
  {
    id: "thu",
    iso: "2024-04-25",
    shortLabel: "Thu 25",
    longLabel: "Thursday, April 25",
    summary: "Delivery ops",
    events: [
      {
        id: "sync",
        title: "Partner sync",
        rangeLabel: "09:30 – 10:15",
        details: "Aurora Guild",
        startSlot: 1,
        span: 1,
        tone: "info",
      },
      {
        id: "writing",
        title: "Writing focus",
        rangeLabel: "11:00 – 12:00",
        details: "Focus mode",
        startSlot: 3,
        span: 1,
        tone: "primary",
      },
    ],
  },
  {
    id: "fri",
    iso: "2024-04-26",
    shortLabel: "Fri 26",
    longLabel: "Friday, April 26",
    summary: "Today",
    isToday: true,
    events: [
      {
        id: "office-hours",
        title: "Office hours",
        rangeLabel: "08:00 – 09:00",
        details: "Planner support",
        startSlot: 0,
        span: 2,
        tone: "accent",
      },
      {
        id: "demo",
        title: "Planner demo",
        rangeLabel: "12:00 – 13:00",
        details: "Feature share",
        startSlot: 4,
        span: 1,
        tone: "primary",
      },
    ],
  },
];

type CalendarPreviewStatus = "default" | "loading" | "error";

const SLOT_COUNT = HOURS.length;

const SLOT_COUNT_STYLE = {
  ["--slot-count" as string]: String(SLOT_COUNT),
} as React.CSSProperties;

function buildSlotStyle(span: number): React.CSSProperties {
  return { gridRow: `span ${span}` };
}

function DayColumn({
  day,
  status,
}: {
  day: CalendarDay;
  status: CalendarPreviewStatus;
}) {
  const slots: React.ReactNode[] = [];
  const occupied = new Set<number>();

  for (let index = 0; index < SLOT_COUNT; index += 1) {
    if (occupied.has(index)) {
      continue;
    }

    const event = day.events.find((item) => item.startSlot === index);

    if (event) {
      for (let offset = 1; offset < event.span; offset += 1) {
        occupied.add(index + offset);
      }

      if (status === "loading") {
        slots.push(
          <Skeleton
            key={`${day.id}-skeleton-${event.id}`}
            ariaHidden
            className="h-full w-full"
            radius="lg"
            style={buildSlotStyle(event.span)}
          />,
        );
        continue;
      }

      slots.push(
        <article
          key={event.id}
          aria-label={`${event.title} · ${event.rangeLabel}`}
          className={cn(styles.eventCard, "focus-within:outline-none")}
          data-tone={event.tone === "accent" ? undefined : event.tone}
          style={buildSlotStyle(event.span)}
        >
          <h3 className={styles.eventCardTitle}>{event.title}</h3>
          <p className={styles.eventCardMeta}>{event.rangeLabel}</p>
          <p className="text-label tracking-[-0.01em] text-[color-mix(in_oklab,hsl(var(--text-on-accent))_78%,transparent)]">
            {event.details}
          </p>
        </article>,
      );
      continue;
    }

    if (status === "loading") {
      slots.push(
        <Skeleton
          key={`${day.id}-slot-${index}`}
          ariaHidden
          className="h-full w-full"
          radius="lg"
        />,
      );
      continue;
    }

    slots.push(
      <button
        key={`${day.id}-slot-${index}`}
        type="button"
        className={styles.slotButton}
        aria-disabled={status === "error"}
        data-state={day.isFocused && index === 2 ? "active" : undefined}
      >
        <span className="text-ui font-medium tracking-[-0.01em]">
          Drop task
        </span>
        <span className="text-label opacity-80">
          {HOURS[index]}
        </span>
      </button>,
    );
  }

  return (
    <article
      className={styles.dayColumn}
      aria-label={`Planned schedule for ${day.longLabel}`}
    >
      <header className={styles.dayHeader}>
        {status === "loading" ? (
          <>
            <Skeleton className="h-[var(--space-5)] w-1/2" radius="md" ariaHidden />
            <Skeleton className="h-[var(--space-4)] w-3/4" radius="md" ariaHidden />
          </>
        ) : (
          <>
            <Cluster
              as="div"
              gap="1"
              align="baseline"
              wrap={false}
              collapse="start"
              className="text-ui font-semibold tracking-[-0.01em]"
            >
              <span>{day.shortLabel}</span>
              {day.isToday ? (
                <span className="rounded-[var(--radius-full)] bg-[hsl(var(--accent)/0.22)] px-[var(--space-2)] py-[var(--spacing-0-5)] text-label font-medium text-[hsl(var(--text-on-accent))]">
                  Today
                </span>
              ) : null}
            </Cluster>
            <p className="text-label text-muted-foreground">{day.summary}</p>
          </>
        )}
      </header>
      <div className={styles.daySlots} style={SLOT_COUNT_STYLE}>
        {slots}
      </div>
    </article>
  );
}

function HeaderContent({ status }: { status: CalendarPreviewStatus }) {
  if (status === "loading") {
    return (
      <div className={styles.headerPrimary}>
        <div className="space-y-[var(--space-2)]">
          <Skeleton
            ariaHidden
            radius="md"
            className="h-[var(--space-6)] w-2/3"
          />
          <Skeleton ariaHidden radius="md" className="h-[var(--space-4)] w-1/2" />
        </div>
        <Skeleton ariaHidden radius="full" className="h-[var(--space-5)] w-[min(10rem,100%)]" />
      </div>
    );
  }

  return (
    <div className={styles.headerPrimary}>
      <div className="space-y-[var(--space-2)]">
        <h2 className="text-title font-semibold tracking-[-0.01em]">
          Week of April 22
        </h2>
        <p className="text-ui text-muted-foreground">
          12 of 20 tasks scheduled · 4 quick wins
        </p>
      </div>
      <span className={styles.headerMeta}>
        Focus mode keeps highlights at the top
      </span>
    </div>
  );
}

function HeaderControls({ status }: { status: CalendarPreviewStatus }) {
  if (status === "loading") {
    return (
      <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
        <Skeleton
          ariaHidden
          radius="lg"
          className="h-[var(--space-6)] w-[min(12rem,100%)]"
        />
        <Skeleton
          ariaHidden
          radius="lg"
          className="h-[var(--space-6)] w-[var(--space-12)]"
        />
      </div>
    );
  }

  return (
    <Cluster
      as="div"
      gap="2"
      align="center"
      justify="flex-end"
      wrap={false}
      collapse="stack"
      collapseBelow="32rem"
    >
      <span className="rounded-[var(--radius-lg)] border border-[hsl(var(--card-hairline)/0.55)] bg-[hsl(var(--surface-2)/0.6)] px-[var(--space-3)] py-[var(--space-1)] text-label text-muted-foreground">
        Auto-sync is on
      </span>
      <Cluster gap="1" wrap={false} align="center">
        <IconButton
          aria-label="Go to previous week"
          variant="ghost"
          tone="primary"
          size="sm"
        >
          <ChevronLeft />
        </IconButton>
        <Button variant="secondary" size="sm">
          Today
        </Button>
        <IconButton
          aria-label="Go to next week"
          variant="ghost"
          tone="primary"
          size="sm"
        >
          <ChevronRight />
        </IconButton>
      </Cluster>
    </Cluster>
  );
}

function CalendarPreview({
  status = "default",
}: {
  status?: CalendarPreviewStatus;
}) {
  return (
    <section
      aria-label="Planner calendar preview"
      aria-busy={status === "loading"}
      className={cn(styles.root, "data-[status=error]:bg-[hsl(var(--surface)/0.85)]")}
      data-status={status === "error" ? "error" : undefined}
    >
      <Switcher
        as="header"
        gap="4"
        threshold="var(--preview-cq-sm)"
        align="stretch"
      >
        <HeaderContent status={status} />
        <HeaderControls status={status} />
      </Switcher>
      <div className={styles.body}>
        <div
          className={styles.hoursRail}
          style={SLOT_COUNT_STYLE}
          aria-hidden={status === "loading"}
        >
          {HOURS.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
        <Switcher
          className={styles.daySwitcher}
          threshold="var(--preview-cq-md)"
          minItemWidth="13rem"
          gap="4"
          align="stretch"
        >
          {CALENDAR_DAYS.map((day) => (
            <DayColumn key={day.id} day={day} status={status} />
          ))}
        </Switcher>
      </div>
      {status === "error" ? (
        <div
          role="status"
          aria-live="polite"
          className={styles.errorBanner}
        >
          <div className="flex flex-col gap-[var(--space-1)]">
            <p className="text-ui font-semibold tracking-[-0.01em]">
              Calendar sync unavailable
            </p>
            <p className="text-label opacity-80">
              Check your connection or retry the Planner sync to restore events.
            </p>
          </div>
          <Button
            variant="primary"
            tone="accent"
            size="sm"
            className="shadow-[var(--shadow-control)] hover:shadow-[var(--shadow-control-hover)]"
          >
            Retry sync
          </Button>
        </div>
      ) : null}
      <Button
        className={cn(
          styles.fab,
          "flex items-center gap-[var(--space-2)] rounded-[var(--radius-full)] shadow-[var(--shadow-control)] hover:shadow-[var(--shadow-control-hover)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none",
        )}
        variant="primary"
        size="lg"
        tone="accent"
      >
        <CalendarPlus className="size-5" aria-hidden />
        <span className="text-ui font-semibold tracking-[-0.01em]">
          Quick create
        </span>
      </Button>
    </section>
  );
}

export default CalendarPreview;

export function CalendarPreviewLoading() {
  return <CalendarPreview status="loading" />;
}

export function CalendarPreviewError() {
  return <CalendarPreview status="error" />;
}
