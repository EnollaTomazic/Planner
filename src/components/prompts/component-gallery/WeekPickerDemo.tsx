"use client";

import * as React from "react";
import { ArrowUpToLine, ChevronLeft, ChevronRight } from "lucide-react";

import { Hero, Button } from "@/components/ui";
import { WeekPickerShell } from "@/components/planner";
import { fromISODate } from "@/lib/date";
import { cn } from "@/lib/utils";

const dmy = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
});

const chipDisplayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "2-digit",
});

const chipAccessibleFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

type DemoDay = {
  iso: string;
  done: number;
  total: number;
};

const DEMO_DAYS: DemoDay[] = [
  { iso: "2024-04-22", done: 3, total: 5 },
  { iso: "2024-04-23", done: 2, total: 4 },
  { iso: "2024-04-24", done: 4, total: 4 },
  { iso: "2024-04-25", done: 1, total: 3 },
  { iso: "2024-04-26", done: 0, total: 4 },
  { iso: "2024-04-27", done: 1, total: 1 },
  { iso: "2024-04-28", done: 0, total: 0 },
];

const SELECTED_ISO = "2024-04-24";
const TODAY_ISO = "2024-04-26";

const formatChipDisplayLabel = (iso: string): string => {
  const dt = fromISODate(iso);
  if (!dt) return iso;
  return chipDisplayFormatter.format(dt);
};

const formatChipAccessibleLabel = (iso: string): string => {
  const dt = fromISODate(iso);
  if (!dt) return iso;
  return chipAccessibleFormatter.format(dt);
};

type DayChipMockProps = {
  iso: string;
  done: number;
  total: number;
  selected: boolean;
  today: boolean;
  tabIndex: number;
};

function DayChipMock({ iso, done, total, selected, today, tabIndex }: DayChipMockProps) {
  const displayLabel = React.useMemo(() => formatChipDisplayLabel(iso), [iso]);
  const accessibleLabel = React.useMemo(
    () => formatChipAccessibleLabel(iso),
    [iso],
  );
  const completionRatio = React.useMemo(() => {
    if (total <= 0) return 0;
    const ratio = done / total;
    if (!Number.isFinite(ratio)) return 0;
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;
    return ratio;
  }, [done, total]);
  const { tint: completionTint, text: completionTextClass } = React.useMemo(() => {
    if (total === 0) {
      return { tint: "bg-card", text: "text-muted-foreground" } as const;
    }
    if (completionRatio >= 2 / 3) {
      return { tint: "bg-success-soft", text: "text-foreground" } as const;
    }
    if (completionRatio >= 1 / 3) {
      return { tint: "bg-accent-3/20", text: "text-foreground" } as const;
    }
    return { tint: "bg-accent-3/30", text: "text-foreground" } as const;
  }, [completionRatio, total]);
  const instructionsId = React.useId();
  const countsId = React.useId();
  const instructionsText = selected
    ? "Press Enter again or double-click to jump."
    : "Press Enter to select.";
  const describedBy = `${countsId} ${instructionsId}`;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={`Select ${accessibleLabel}`}
      aria-describedby={describedBy}
      title={
        selected
          ? "Press Enter again or double-click to jump"
          : "Click or press Enter to focus"
      }
      tabIndex={tabIndex}
      className={cn(
        "chip relative flex-none w-[--chip-width] rounded-card r-card-lg border text-left px-[var(--space-3)] py-[var(--space-2)] transition snap-start",
        "border-card-hairline",
        completionTint,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:border-primary/60 active:bg-card/85",
        today && "chip--today",
        selected ? "border-dashed border-primary/75" : "hover:border-primary/40",
      )}
      data-today={today || undefined}
      data-active={selected || undefined}
    >
      <div
        className={cn(
          "chip__date",
          completionTextClass,
          today && completionTint === "bg-card" ? "text-accent-3" : undefined,
        )}
        data-text={displayLabel}
      >
        <span aria-hidden="true">{displayLabel}</span>
        <span className="sr-only" data-chip-label="full">
          {accessibleLabel}
        </span>
      </div>
      <div id={countsId} className="chip__counts text-foreground">
        <span className="tabular-nums">{done}</span>
        <span className="text-foreground/70"> / {total}</span>
      </div>
      <span id={instructionsId} className="sr-only" aria-live="polite" aria-atomic="true">
        {instructionsText}
      </span>
      <span aria-hidden className="chip__scan" />
      <span aria-hidden className="chip__edge" />
    </button>
  );
}

export default function WeekPickerDemo() {
  const start = React.useMemo(() => fromISODate(DEMO_DAYS[0]?.iso ?? ""), []);
  const end = React.useMemo(() => fromISODate(DEMO_DAYS[DEMO_DAYS.length - 1]?.iso ?? ""), []);

  const heading = React.useMemo(() => {
    if (!start || !end) return "Week";
    return `${dmy.format(start)} — ${dmy.format(end)}`;
  }, [start, end]);

  const subtitle = React.useMemo(() => {
    const startIso = DEMO_DAYS[0]?.iso;
    const endIso = DEMO_DAYS[DEMO_DAYS.length - 1]?.iso;
    if (!startIso || !endIso) return "";
    return `${startIso} → ${endIso}`;
  }, []);

  const rangeLabel = React.useMemo(() => {
    if (!start || !end) return "";
    return `${dmy.format(start)} → ${dmy.format(end)}`;
  }, [start, end]);

  const { weekDone, weekTotal } = React.useMemo(() => {
    return DEMO_DAYS.reduce(
      (acc, day) => {
        acc.weekDone += day.done;
        acc.weekTotal += day.total;
        return acc;
      },
      { weekDone: 0, weekTotal: 0 },
    );
  }, []);

  return (
    <Hero
      heading={heading}
      subtitle={subtitle}
      actions={
        <Button
          variant="default"
          size="sm"
          aria-label="Jump to top"
          className="px-[var(--space-4)]"
        >
          <ArrowUpToLine />
          <span>Top</span>
        </Button>
      }
      rail
      sticky
      dividerTint="primary"
    >
      <WeekPickerShell>
        <WeekPickerShell.Controls slotId="planner-demo-controls">
          <div
            role="group"
            aria-label="Week navigation"
            className="flex flex-wrap items-center gap-[var(--space-2)]"
          >
            <Button variant="ghost" size="sm" aria-label="Go to previous week">
              <ChevronLeft />
              <span>Prev</span>
            </Button>
            <Button size="sm" aria-label="Jump to today" disabled>
              Today
            </Button>
            <Button variant="ghost" size="sm" aria-label="Go to next week">
              <span>Next</span>
              <ChevronRight />
            </Button>
          </div>
        </WeekPickerShell.Controls>
        <WeekPickerShell.Totals slotId="planner-demo-range">
          <span className="sr-only" aria-live="polite">
            Week range {rangeLabel}
          </span>
          <span className="inline-flex items-baseline gap-[var(--space-1)] text-ui text-muted-foreground">
            <span>Total tasks:</span>
            <span className="font-medium tabular-nums text-foreground">
              {weekDone} / {weekTotal}
            </span>
          </span>
        </WeekPickerShell.Totals>
        <WeekPickerShell.Chips slotId="planner-demo-days">
          <div
            role="listbox"
            aria-label={`Select a focus day between ${rangeLabel}`}
            className="flex flex-nowrap gap-[var(--space-3)] overflow-x-auto snap-x snap-mandatory lg:flex-wrap lg:gap-y-[var(--space-3)] lg:overflow-visible lg:[scroll-snap-type:none]"
          >
            {DEMO_DAYS.map((day, index) => (
              <DayChipMock
                key={day.iso}
                iso={day.iso}
                done={day.done}
                total={day.total}
                today={day.iso === TODAY_ISO}
                selected={day.iso === SELECTED_ISO}
                tabIndex={day.iso === SELECTED_ISO ? 0 : index === 0 ? 0 : -1}
              />
            ))}
          </div>
        </WeekPickerShell.Chips>
      </WeekPickerShell>
    </Hero>
  );
}
