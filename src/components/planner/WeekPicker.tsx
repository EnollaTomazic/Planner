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
import { useFocusDate, useWeek } from "./useFocusDate";
import type { ISODate } from "./plannerStore";
import { useWeekData } from "./useWeekData";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { CalendarDays, ArrowUpToLine } from "lucide-react";
import { toISODate } from "@/lib/date";

/* ───────── date helpers ───────── */

const dmy = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
});

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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" && selected) {
      event.preventDefault();
      event.stopPropagation();
      onDoubleClick(iso);
    }
  };

  return (
    <button
      type="button"
      role="option"
      onClick={() => onClick(iso)}
      onDoubleClick={() => onDoubleClick(iso)}
      onKeyDown={handleKeyDown}
      aria-selected={selected}
      aria-label={`Select ${iso}. Completed ${done} of ${total}. ${
        selected
          ? "Press Enter again or double-click to jump."
          : "Press Enter to select."
      }`}
      title={
        selected
          ? "Press Enter again or double-click to jump"
          : "Click or press Enter to focus"
      }
      className={cn(
        "chip relative flex-none w-[--chip-width] rounded-card r-card-lg border text-left px-3 py-2 transition snap-start",
        // default border is NOT white; use card hairline tint
        "border-card-hairline bg-card/75",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:border-primary/60 active:bg-card/85",
        today && "chip--today",
        selected
          ? "border-dashed border-primary/75"
          : "hover:border-primary/40",
      )}
      data-today={today || undefined}
      data-active={selected || undefined}
    >
      <div
        className={cn(
          "chip__date",
          today ? "text-accent" : "text-muted-foreground",
        )}
        data-text={iso}
      >
        {iso}
      </div>
      <div className="chip__counts">
        <span className="tabular-nums text-foreground">{done}</span>
        <span className="text-muted-foreground"> / {total}</span>
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
  const { start, end, days } = useWeek(iso);
  const heading = `${dmy.format(start)} — ${dmy.format(end)}`;
  const rangeLabel = `${dmy.format(start)} → ${dmy.format(end)}`;
  const isoStart = toISODate(start);
  const isoEnd = toISODate(end);

  const { per, weekDone, weekTotal } = useWeekData(days);
  const reduceMotion = usePrefersReducedMotion();

  // Show "Jump to top" button after a double-click jump; hide when back at top
  const [showTop, setShowTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const atTop = window.scrollY <= 4;
      setShowTop((prev) => (atTop ? false : prev));
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
      const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
      el.scrollIntoView({
        behavior,
        block: "start",
        inline: "nearest",
      });
      el.focus({ preventScroll: true });
      setShowTop(true);
    }
  };

  const jumpToTop = () => {
    if (typeof window !== "undefined") {
      const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior });
      // The scroll listener will auto-hide the button when we reach the top
    }
  };

  /* Top button goes in Hero actions when applicable */
  const topAction = showTop ? (
    <Button
      variant="primary"
      size="sm"
      aria-label="Jump to top"
      onClick={jumpToTop}
      title="Jump to top"
      className="px-4"
    >
      <ArrowUpToLine />
      <span>Top</span>
    </Button>
  ) : undefined;

  return (
    <Hero
      heading={heading}
      subtitle={`${isoStart} → ${isoEnd}`}
      actions={topAction}
      rail
      sticky
      dividerTint="primary"
    >
      <div className="grid gap-3 flex-1">
        {/* Range + totals */}
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-card r-card-lg px-3 py-2 text-ui",
              "bg-card/72 ring-1 ring-border/55 backdrop-blur",
            )}
            aria-label={`Week range ${rangeLabel}`}
          >
            <CalendarDays className="size-4 opacity-80" />
            <span className="opacity-90">{rangeLabel}</span>
          </span>

          <span className="text-ui text-muted-foreground">
            <span className="opacity-70">Total tasks: </span>
            <span className="font-medium tabular-nums text-foreground">
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
    </Hero>
  );
}
