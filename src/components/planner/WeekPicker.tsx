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
import type { ISODate } from "./plannerTypes";
import { useWeekData } from "./useWeekData";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { ArrowUpToLine } from "lucide-react";
import { fromISODate, toISODate } from "@/lib/date";

/* ───────── date helpers ───────── */

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

const formatChipDisplayLabel = (value: ISODate): string => {
  const dt = fromISODate(value);
  if (!dt) return value;
  return chipDisplayFormatter.format(dt);
};

const formatChipAccessibleLabel = (value: ISODate): string => {
  const dt = fromISODate(value);
  if (!dt) return value;
  return chipAccessibleFormatter.format(dt);
};

/* ───────── presentational chip (no hooks) ───────── */

type DayChipNavDirection = "prev" | "next" | "first" | "last";

type DayChipProps = {
  iso: ISODate;
  selected: boolean;
  today: boolean;
  done: number;
  total: number;
  onClick: (iso: ISODate) => void;
  onDoubleClick: (iso: ISODate) => void;
  onNavigate: (direction: DayChipNavDirection) => void;
  onFocus: () => void;
  tabIndex: number;
};

const DayChip = React.forwardRef<HTMLButtonElement, DayChipProps>(function DayChip(
  {
    iso,
    selected,
    today,
    done,
    total,
    onClick,
    onDoubleClick,
    onNavigate,
    onFocus,
    tabIndex,
  },
  ref,
) {
  const displayLabel = React.useMemo(() => formatChipDisplayLabel(iso), [iso]);
  const accessibleLabel = React.useMemo(
    () => formatChipAccessibleLabel(iso),
    [iso],
  );
  const completionRatio = React.useMemo(() => {
    if (total <= 0) {
      return 0;
    }
    const ratio = done / total;
    if (!Number.isFinite(ratio)) {
      return 0;
    }
    if (ratio <= 0) {
      return 0;
    }
    if (ratio >= 1) {
      return 1;
    }
    return ratio;
  }, [done, total]);
  const { tint: completionTint, text: completionTextClass } = React.useMemo(() => {
    if (total === 0) {
      return { tint: "bg-card", text: "text-muted-foreground" };
    }
    if (completionRatio >= 2 / 3) {
      return { tint: "bg-success-soft", text: "text-foreground" };
    }
    if (completionRatio >= 1 / 3) {
      return { tint: "bg-accent-3/20", text: "text-foreground" };
    }
    return { tint: "bg-accent-3/30", text: "text-foreground" };
  }, [completionRatio, total]);
  const instructionsId = React.useId();
  const countsId = React.useId();
  const instructionsText = selected
    ? "Press Enter again or double-click to jump."
    : "Press Enter to select.";
  const describedBy = `${countsId} ${instructionsId}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" && selected) {
      event.preventDefault();
      event.stopPropagation();
      onDoubleClick(iso);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onNavigate("prev");
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onNavigate("next");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onNavigate("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onNavigate("last");
    }
  };

  return (
    <button
      type="button"
      role="option"
      ref={ref}
      onClick={() => onClick(iso)}
      onDoubleClick={() => onDoubleClick(iso)}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      tabIndex={tabIndex}
      aria-selected={selected}
      aria-label={`Select ${accessibleLabel}`}
      aria-describedby={describedBy}
      title={
        selected
          ? "Press Enter again or double-click to jump"
          : "Click or press Enter to focus"
      }
      className={cn(
        "chip relative flex-none w-[--chip-width] rounded-card r-card-lg border text-left px-[var(--space-3)] py-[var(--space-2)] transition snap-start",
        // default border is NOT white; use card hairline tint
        "border-card-hairline",
        completionTint,
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
      <span
        id={instructionsId}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {instructionsText}
      </span>
      {/* decorative layers */}
      <span aria-hidden className="chip__scan" />
      <span aria-hidden className="chip__edge" />
    </button>
  );
});

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

  const chipRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const findSelectedIndex = React.useCallback(() => {
    const selectedIndex = days.indexOf(iso);
    if (selectedIndex !== -1) {
      return selectedIndex;
    }
    return days.length > 0 ? 0 : -1;
  }, [days, iso]);

  const [focusIndex, setFocusIndex] = React.useState(() => {
    const initialIndex = findSelectedIndex();
    return initialIndex === -1 ? 0 : initialIndex;
  });

  React.useEffect(() => {
    const selectedIndex = findSelectedIndex();
    if (selectedIndex === -1) return;
    setFocusIndex((prev) => (prev === selectedIndex ? prev : selectedIndex));
  }, [findSelectedIndex]);

  React.useEffect(() => {
    chipRefs.current.length = days.length;
  }, [days.length]);

  const focusChip = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= days.length) return;
      const nextIso = days[index];
      if (!nextIso) return;
      if (nextIso !== iso) {
        setIso(nextIso);
      }
      setFocusIndex(index);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          chipRefs.current[index]?.focus({ preventScroll: true });
        });
      } else {
        chipRefs.current[index]?.focus({ preventScroll: true });
      }
    },
    [days, iso, setIso],
  );

  const handleNavigate = React.useCallback(
    (currentIndex: number, direction: DayChipNavDirection) => {
      if (days.length === 0) return;

      let nextIndex = currentIndex;
      switch (direction) {
        case "prev":
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case "next":
          nextIndex = Math.min(days.length - 1, currentIndex + 1);
          break;
        case "first":
          nextIndex = 0;
          break;
        case "last":
          nextIndex = days.length - 1;
          break;
      }

      if (nextIndex === currentIndex) return;

      focusChip(nextIndex);
    },
    [days, focusChip],
  );

  // Show "Jump to top" button after a double-click jump; hide when back at top
  const [showTop, setShowTop] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId: number | null = null;

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const atTop = window.scrollY <= 4;
        setShowTop((prev) => (atTop ? false : prev));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
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
      const focusTarget =
        document.getElementById("planner-header") ??
        document.getElementById("main-content");
      if (focusTarget instanceof HTMLElement) {
        window.requestAnimationFrame(() => {
          focusTarget.focus({ preventScroll: true });
        });
      }
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
      className="px-[var(--space-4)]"
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
      <div className="grid gap-[var(--space-3)] flex-1">
        {/* Totals */}
        <div className="flex items-center justify-end gap-[var(--space-3)]">
          <span className="sr-only" aria-live="polite">
            Week range {rangeLabel}
          </span>
          <span className="inline-flex items-baseline gap-[var(--space-1)] text-ui text-muted-foreground">
            <span>Total tasks:</span>
            <span className="font-medium tabular-nums text-foreground">
              {weekDone} / {weekTotal}
            </span>
          </span>
        </div>

        {/* Day chips */}
        <div
          role="listbox"
          aria-label={`Select a focus day between ${rangeLabel}`}
          className="flex gap-[var(--space-3)] overflow-x-auto snap-x snap-mandatory lg:overflow-visible"
        >
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
              onNavigate={(direction) => handleNavigate(i, direction)}
              onFocus={() => setFocusIndex(i)}
              tabIndex={focusIndex === i ? 0 : -1}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </Hero>
  );
}
