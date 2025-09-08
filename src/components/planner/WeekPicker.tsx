"use client";

/**
 * WeekPicker — Lavender-Glitch compliant, hydration-safe
 * - Single-click chip: set focus date (TodayHero updates)
 * - Double-click chip: smooth-scroll to that day card
 * - Selected chip shows “armed” state (dashed, tinted border)
 * - “Jump to top” button appears after a double-click jump; disappears when back at top
 */

import * as React from "react";
import Hero from "@/components/ui/layout/Hero";
import Button from "@/components/ui/primitives/Button";
import { useFocusDate } from "./useFocusDate";
import type { ISODate } from "./plannerStore";
import { useDay } from "./useDay";
import { cn } from "@/lib/utils";
import { CalendarDays, ArrowUpToLine } from "lucide-react";
import { fromISODate, toISODate, addDays, mondayStartOfWeek } from "@/lib/date";

/* ───────── date helpers ───────── */

const dmy = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" });

/* ───────── safe week stats (7 fixed calls) ───────── */

function useWeekStats(days: ISODate[]) {
  const d0 = useDay(days[0]);
  const d1 = useDay(days[1]);
  const d2 = useDay(days[2]);
  const d3 = useDay(days[3]);
  const d4 = useDay(days[4]);
  const d5 = useDay(days[5]);
  const d6 = useDay(days[6]);

  const buckets = [d0, d1, d2, d3, d4, d5, d6];

  const per = buckets.map((b, i) => {
    const projects = b.projects ?? [];
    const tasks = b.tasks ?? [];
    const pDone = projects.filter(p => p?.done).length;
    const tDone = tasks.filter(t => t?.done).length;
    const total = projects.length + tasks.length;
    return { iso: days[i], done: pDone + tDone, total };
  });

  const weekDone = per.reduce((a, b) => a + b.done, 0);
  const weekTotal = per.reduce((a, b) => a + b.total, 0);

  return { per, weekDone, weekTotal };
}

/* ───────── presentational chip (no hooks) ───────── */

function DayChip({
  iso,
  selected,
  today,
  done,
  total,
  onClick,
  onDoubleClick,
}: {
  iso: ISODate;
  selected: boolean;
  today: boolean;
  done: number;
  total: number;
  onClick: (iso: ISODate) => void;
  onDoubleClick: (iso: ISODate) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(iso)}
      onDoubleClick={() => onDoubleClick(iso)}
      aria-current={selected ? "date" : undefined}
      aria-label={`Select ${iso}. Completed ${done} of ${total}. ${selected ? "Double-click to jump." : ""}`}
      title={selected ? "Double-click to jump" : "Click to focus"}
      className={cn(
        "chip relative flex-none min-w-[min(160px,40%)] rounded-2xl border text-left px-3 py-2 transition snap-start",
        // default border is NOT white; use card hairline tint
        "border-[hsl(var(--card-hairline))] bg-[hsl(var(--card)/0.75)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        today && "chip--today",
        selected
          ? "border-dashed border-[hsl(var(--primary)/.75)]"
          : "hover:border-[hsl(var(--primary)/.4)]"
      )}
      data-today={today || undefined}
      data-active={selected || undefined}
    >
      <div
        className={cn(
          "chip__date",
          today ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"
        )}
        data-text={iso}
      >
        {iso}
      </div>
      <div className="chip__counts">
        <span className="tabular-nums text-[hsl(var(--foreground))]">{done}</span>
        <span className="text-[hsl(var(--muted-foreground))]"> / {total}</span>
      </div>
      {/* decorative layers */}
      <span aria-hidden className="chip__scan" />
      <span aria-hidden className="chip__edge" />
    </button>
  );
}

/* ───────── main ───────── */

export default function WeekPicker() {
  const { iso, setIso, today } = useFocusDate();

  const { heading, rangeLabel, isoStart, isoEnd, days } = React.useMemo(() => {
    const base = fromISODate(iso) ?? new Date();
    const s = mondayStartOfWeek(base);
    const e = addDays(s, 6);
    const list: ISODate[] = Array.from({ length: 7 }, (_, i) => toISODate(addDays(s, i)) as ISODate);
    return {
      heading: `${dmy.format(s)} — ${dmy.format(e)}`,
      rangeLabel: `${dmy.format(s)} → ${dmy.format(e)}`,
      isoStart: toISODate(s),
      isoEnd: toISODate(e),
      days: list,
    };
  }, [iso]);

  const { per, weekDone, weekTotal } = useWeekStats(days);

  // Show "Jump to top" button after a double-click jump; hide when back at top
  const [showTop, setShowTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const atTop = window.scrollY <= 4;
      setShowTop(prev => (atTop ? false : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Select (single-click) vs jump (double-click)
  const selectOnly = (d: ISODate) => setIso(d);
  const jumpToDay = (d: ISODate) => {
    setIso(d);
    const el = document.getElementById(`day-${d}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      el.focus({ preventScroll: true });
      setShowTop(true);
    }
  };

  const jumpToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // The scroll listener will auto-hide the button when we reach the top
    }
  };

  /* Top button goes in Hero.right when applicable */
  const right =
    showTop ? (
      <Button
        variant="primary"
        size="sm"
        aria-label="Jump to top"
        onClick={jumpToTop}
        title="Jump to top"
      >
        <ArrowUpToLine className="size-4" />
        <span>Top</span>
      </Button>
    ) : undefined;

  return (
    <Hero
      heading={
        <span className="hero2-title" data-text={heading}>
          {heading}
        </span>
      }
      subtitle={`${isoStart} → ${isoEnd}`}
      right={right}
      rail
      sticky
      dividerTint="primary"
      bottom={
        <div className="grid gap-3 flex-1">
          {/* Range + totals */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm",
                "bg-[hsl(var(--card)/0.72)] ring-1 ring-[hsl(var(--border)/0.55)] backdrop-blur"
              )}
              aria-label={`Week range ${rangeLabel}`}
            >
              <CalendarDays className="size-4 opacity-80" />
              <span className="opacity-90">{rangeLabel}</span>
            </span>

            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              <span className="opacity-70">Total tasks: </span>
              <span className="font-medium tabular-nums text-[hsl(var(--foreground))]">
                {weekDone} / {weekTotal}
              </span>
            </span>
          </div>

          {/* Day chips */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory lg:overflow-visible">
            {days.map((d, i) => (
              <DayChip
                key={d}
                iso={d}
                selected={d === iso}
                today={d === today}
                done={per[i]?.done ?? 0}
                total={per[i]?.total ?? 0}
                onClick={selectOnly}
                onDoubleClick={jumpToDay}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}
