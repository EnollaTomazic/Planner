// src/components/planner/WeekSummary.tsx
"use client";
import "./style.css";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import { useWeek } from "./useFocusDate";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";
import { cn, LOCALE } from "@/lib/utils";

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
  const { getDay } = usePlannerStore();

  const stats = React.useMemo(() => {
    return weekDays.map(d => {
      const rec = getDay(d);
      const total = rec.tasks.length;
      const done = rec.tasks.filter(t => t.done).length;
      return { iso: d, done, total };
    });
  }, [weekDays, getDay]);

  const totalAll = stats.reduce((a, s) => a + s.total, 0);
  const doneAll = stats.reduce((a, s) => a + s.done, 0);

  const rangeLabel =
    weekDays.length === 7 ? `${fmtDay(weekDays[0])} — ${fmtDay(weekDays[6])}` : "";

  const grid =
    variant === "inline"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3";

  const headingRow =
    variant === "inline" ? (
      showLabel ? (
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-[0.14em]">Week</span>
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
      <div className="mb-3 flex items-center gap-3">
        <div className="text-sm text-muted-foreground">{rangeLabel}</div>
        <span
          className="ml-auto badge badge--sm"
          role="status"
          aria-live="polite"
          title="Completed / Total tasks this week"
        >
          <span className="badge__icon">✅</span>
          <span className="tabular-nums">{doneAll}</span>/
          <span className="tabular-nums">{totalAll}</span>
        </span>
      </div>
    );

  const tiles = (
    <div className={grid} role="list" aria-label="Week days summary">
      {stats.map(s => {
        const today = isToday(s.iso);
        const empty = s.total === 0;
        return (
          <div
            key={s.iso}
            role="listitem"
            className={cn(
              "ws-tile group",
              variant === "inline" ? "p-2 rounded-lg" : "p-3 rounded-xl",
              today && "ws-tile--today",
              empty && "ws-tile--empty"
            )}
            data-today={today || undefined}
            tabIndex={0}
            aria-label={`${s.iso}: ${s.done} of ${s.total} done`}
          >
            <div className="ws-tile__date">{s.iso}</div>
            <div className={cn("ws-tile__counts", variant === "inline" ? "text-base" : "text-lg")}>
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

/* ───────────── utils ──────────── */
function fmtDay(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString(LOCALE, { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}
