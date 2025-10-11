// src/components/planner/WeekSummary.tsx
"use client";
import "./style.css";

import { SectionCard } from "@/components/ui/layout/SectionCard";
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

export function WeekSummary({
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

  const completionDescription = "Completed / Total items this week";

  const completionContent = (
    <>
      <span className="badge__icon">✅</span>
      <span className="tabular-nums">{doneAll}</span>/
      <span className="tabular-nums">{totalAll}</span>
    </>
  );

  const completionBadge = (
    <span
      className="badge badge--sm"
      role="status"
      aria-live="polite"
      title={completionDescription}
      aria-label={completionDescription}
    >
      {completionContent}
    </span>
  );

  const inlineHeader =
    variant === "inline" && showLabel ? (
      <div className="mb-[var(--space-2)] flex items-start justify-between gap-[var(--space-2)]">
        <div className="flex flex-col gap-[var(--space-2)] text-label tracking-[0.02em] text-muted-foreground">
          <span className="uppercase font-semibold">Week</span>
          {rangeLabel ? <span className="font-medium">{rangeLabel}</span> : null}
        </div>
        <span
          className="pill pill--medium font-semibold"
          role="status"
          aria-live="polite"
          aria-label={completionDescription}
          title={completionDescription}
        >
          {completionContent}
        </span>
      </div>
    ) : null;

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
      {inlineHeader}
      {tiles}
    </div>
  );

  if (variant === "inline") return content;

  return (
    <SectionCard className="card-neo">
      <SectionCard.Header
        className="items-start gap-[var(--space-3)]"
        titleAs="h6"
        titleClassName="flex flex-col gap-[var(--space-2)]"
        title={
          <>
            <span className="text-title font-semibold tracking-tight">Week Summary</span>
            {rangeLabel ? (
              <span className="text-label font-medium text-muted-foreground">
                {rangeLabel}
              </span>
            ) : null}
          </>
        }
        actions={completionBadge}
      />
      <SectionCard.Body>{content}</SectionCard.Body>
    </SectionCard>
  );
}

