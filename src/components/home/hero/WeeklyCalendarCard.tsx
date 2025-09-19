"use client";

import * as React from "react";
import { NeoCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useFocusDate, useWeek, useWeekData } from "@/components/planner";
import { formatWeekRangeLabel } from "@/lib/date";
import { formatCalendarDayParts } from "./useHeroPlanner";

export type WeeklyCalendarDay = {
  iso: string;
  weekday: string;
  dayNumber: string;
  done: number;
  total: number;
  isToday: boolean;
  isSelected: boolean;
};

export type WeeklyCalendarCardProps = {
  weekLabel: string;
  done: number;
  total: number;
  days: readonly WeeklyCalendarDay[];
  onSelectDay: (iso: string) => void;
  className?: string;
};

export function useWeeklyCalendarCard(): Omit<WeeklyCalendarCardProps, "className"> {
  const { iso, setIso } = useFocusDate();
  const { start, end, days, isToday } = useWeek(iso);
  const { per, weekDone, weekTotal } = useWeekData(days);

  const weekLabel = React.useMemo(
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  const calendarDays = React.useMemo<WeeklyCalendarDay[]>(() => {
    return per.map((day) => {
      const { weekday, dayNumber } = formatCalendarDayParts(day.iso);
      return {
        iso: day.iso,
        weekday,
        dayNumber,
        done: day.done,
        total: day.total,
        isToday: isToday(day.iso),
        isSelected: day.iso === iso,
      };
    });
  }, [iso, isToday, per]);

  const handleSelectDay = React.useCallback(
    (nextIso: string) => {
      setIso(nextIso);
    },
    [setIso],
  );

  return {
    weekLabel,
    done: weekDone,
    total: weekTotal,
    days: calendarDays,
    onSelectDay: handleSelectDay,
  } as const;
}

function WeeklyCalendarCard({
  weekLabel,
  done,
  total,
  days,
  onSelectDay,
  className,
}: WeeklyCalendarCardProps) {
  return (
    <div className={className}>
      <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
        <header className="space-y-[var(--space-1)]">
          <p className="text-label text-muted-foreground">Weekly calendar</p>
          <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
            {weekLabel}
          </h3>
          <p className="text-label text-muted-foreground">
            {total > 0 ? (
              <span className="tabular-nums text-card-foreground">
                {done}/{total}
              </span>
            ) : (
              "No tasks scheduled this week"
            )}
          </p>
        </header>
        <div className="flex overflow-x-auto rounded-card r-card-lg border border-border/60 p-[var(--space-2)]">
          <ul
            className="flex w-full min-w-0 gap-[var(--space-2)]"
            role="listbox"
            aria-label="Select focus day"
          >
            {days.map((day) => (
              <li
                key={day.iso}
                className="flex-1 min-w-[calc(var(--space-8)+var(--space-2))]"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={day.isSelected}
                  aria-current={day.isToday ? "date" : undefined}
                  onClick={() => onSelectDay(day.iso)}
                  className={cn(
                    "flex w-full flex-col items-start gap-[var(--space-1)] rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] text-left transition",
                    "border-card-hairline bg-card/70 hover:border-primary/40 hover:bg-card/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                    "active:bg-card/90",
                    day.isSelected && "border-primary/70 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "text-label text-muted-foreground",
                      day.isToday && "text-accent-3",
                    )}
                  >
                    {day.weekday}
                  </span>
                  <span className="text-ui font-semibold tabular-nums text-card-foreground">
                    {day.dayNumber}
                  </span>
                  <span className="text-label text-muted-foreground tabular-nums">
                    {day.done}/{day.total}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </NeoCard>
    </div>
  );
}

export default WeeklyCalendarCard;
