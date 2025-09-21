// src/components/planner/WeekSummary.tsx
"use client";
import "./style.css";

import SectionCard from "@/components/ui/layout/SectionCard";
import { useWeek } from "./useFocusDate";
import { useWeekData } from "./useWeekData";
import type { ISODate } from "./plannerTypes";
import { cn } from "@/lib/utils";
import { formatWeekDay } from "@/lib/date";

/**
 * WeekSummary
 * - variant="card"   → standalone SectionCard (default)
 * - variant="inline" → compact block to embed inside other cards (no wrapper)
 *
 * Visual:
 * - Header shows range + compact total
 * - 7 tiles on xl, compress below
 * - Today = inner ring + left rail
 * - Calm zeros, tabular numbers
 *
 * Extras:
 * - bleed: when true, applies Hero-compatible full-bleed so totals reach the edge
 */

type Props = {
  iso: ISODate;
  variant?: "card" | "inline";
  className?: string;
  showLabel?: boolean;
  /** Make content span to container edges (use inside Hero.bottom). */
  bleed?: boolean;
};

export default function WeekSummary({
  iso,
  variant = "card",
  className,
  showLabel = true,
  bleed = false,
}: Props) {
  const { days: weekDays, isToday } = useWeek(iso);
  const { per: stats, weekDone: doneAll, weekTotal: totalAll } = useWeekData(weekDays);

  const rangeLabel =
    weekDays.length === 7
      ? `${formatWeekDay(weekDays[0])} — ${formatWeekDay(weekDays[6])}`
      : "";

  const grid =
    variant === "inline"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-[var(--space-2)]"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-[var(--space-3)]";

  const headingRow =
    variant === "inline" ? (
      showLabel ? (
        <div className="mb-[var(--space-2)] flex items-center justify-between gap-[var(--space-2)] text-label font-medium tracking-[0.02em] text-muted-foreground">
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="uppercase tracking-[0.02em]">Week</span>
            <span aria-hidden>•</span>
            <span>{rangeLabel}</span>
          </div>
          <span className="pill pill--medium font-semibold">
            <span className="tabular-nums">{doneAll}</span>/
            <span className="tabular-nums">{totalAll}</span>
          </span>
        </div>
      ) : null
    ) : (
      <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-3)]">
        <div className="text-ui font-medium text-muted-foreground">{rangeLabel}</div>
        <span
          className="ml-auto badge badge--sm"
          role="status"
          aria-live="polite"
          title="Completed / Total items this week"
        >
          <span className="badge__icon">✅</span>
          <span className="tabular-nums">{doneAll}</span>/
          <span className="tabular-nums">{totalAll}</span>
        </span>
      </div>
    );

  const tiles = (
    <div className={grid} role="list" aria-label="Week days summary">
      {stats.map((s) => {
        const today = isToday(s.iso);
        const empty = s.total === 0;
        const friendlyDay = formatWeekDay(s.iso);
        const countsLabel = `${s.done} of ${s.total} done`;
        return (
          <div
            key={s.iso}
            role="listitem"
            className={cn(
              "ws-tile group",
              variant === "inline"
                ? "p-[var(--space-2)] rounded-card r-card-lg"
                : "p-[var(--space-3)] rounded-card r-card-lg",
              today && "ws-tile--today",
              empty && "ws-tile--empty",
            )}
            data-today={today || undefined}
            aria-label={`${friendlyDay}: ${countsLabel}`}
          >
            <div className="ws-tile__date">{friendlyDay}</div>
            <div
              className={cn(
                "ws-tile__counts",
                variant === "inline" ? "text-body" : "text-title",
              )}
            >
              <span className="tabular-nums">{s.done}</span>
              <span className="opacity-60"> / </span>
              <span className="tabular-nums">{s.total}</span>
            </div>
            {today ? <span aria-hidden className="ws-rail" /> : null}
          </div>
        );
      })}
    </div>
  );

  const content = (
    <div className={cn(className, bleed && "ws-bleed")}>
      {headingRow}
      {tiles}
    </div>
  );

  if (variant === "inline") return content;

  return (
    <SectionCard className="card-neo">
      <SectionCard.Header title="Week Summary" />
      <SectionCard.Body>{content}</SectionCard.Body>
    </SectionCard>
  );
}

