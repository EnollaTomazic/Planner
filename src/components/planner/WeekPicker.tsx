"use client";

/**
 * WeekPicker — Lavender-Glitch compliant, hydration-safe
 * - Single-click chip: set focus date (TodayHero updates)
 * - Double-click chip: smooth-scroll to that day card
 * - Selected chip shows “armed” state (dashed, tinted border)
 * - “Jump to top” button appears after a double-click jump; disappears when back at top
 */

import * as React from "react";
import Button from "@/components/ui/primitives/button";
import { useFocusDate, useDay, type ISODate } from "./usePlanner";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, ArrowUpToLine } from "lucide-react";

/* ───────── date helpers ───────── */

function isoToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}
function mondayStart(d: Date) {
  const shift = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  const s = new Date(d);
  s.setDate(d.getDate() - shift);
  s.setHours(0, 0, 0, 0);
  return s;
}
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
        "relative w-full rounded-2xl border px-3 py-2 text-left",
        "border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.6)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        today && "ring-1 ring-[hsl(var(--ring)/0.6)]",
        selected && "border-dashed border-[hsl(var(--primary))]"
      )}
      data-today={today || undefined}
      data-active={selected || undefined}
    >
      <div
        className={cn(
          "text-xs",
          today ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"
        )}
      >
        {iso}
      </div>
      <div className="mt-1 text-sm">
        <span className="tabular-nums text-[hsl(var(--foreground))]">{done}</span>
        <span className="text-[hsl(var(--muted-foreground))]"> / {total}</span>
      </div>
    </button>
  );
}

/* ───────── main ───────── */

export default function WeekPicker() {
  const { iso, setIso, today } = useFocusDate();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { start, end, heading, rangeLabel, isoStart, isoEnd, days } = React.useMemo(() => {
    const base = isoToDate(iso);
    const s = mondayStart(base);
    const e = addDays(s, 6);
    const list: ISODate[] = Array.from({ length: 7 }, (_, i) => toISO(addDays(s, i)) as ISODate);
    return {
      start: s,
      end: e,
      heading: `${dmy.format(s)} — ${dmy.format(e)}`,
      rangeLabel: `${dmy.format(s)} → ${dmy.format(e)}`,
      isoStart: toISO(s),
      isoEnd: toISO(e),
      days: list,
    };
  }, [iso]);

  const prevWeek = () => setIso(toISO(addDays(start, -7)));
  const nextWeek = () => setIso(toISO(addDays(start, 7)));
  const jumpToday = () => setIso(today);

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
      setShowTop(true);
    }
  };

  const jumpToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // The scroll listener will auto-hide the button when we reach the top
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{heading}</h1>
          <p className="text-sm text-muted-foreground">
            {isoStart} — {isoEnd}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={prevWeek} leftIcon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
          <Button size="sm" variant="ghost" onClick={jumpToday}>Today</Button>
          <Button size="sm" variant="ghost" onClick={nextWeek} rightIcon={<ChevronRight className="h-4 w-4" />}>Next</Button>
          {showTop && (
            <Button size="sm" variant="ghost" onClick={jumpToTop} leftIcon={<ArrowUpToLine className="h-4 w-4" />}>Top</Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {rangeLabel}
        </span>
        <span>
          {weekDone} / {weekTotal}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-7">
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
    </section>
  );
}
