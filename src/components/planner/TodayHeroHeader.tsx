"use client";

import { useMemo, useRef, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Calendar } from "lucide-react";

import { toISODate } from "@/lib/date";
import IconButton from "@/components/ui/primitives/IconButton";
import type { ISODate } from "./plannerTypes";

const HEADER_TITLE = "Today";

type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

type TodayHeroHeaderProps = {
  viewIso: ISODate;
  isToday: boolean;
  onChange: (nextIso: ISODate) => void;
};

export default function TodayHeroHeader({
  viewIso,
  isToday,
  onChange,
}: TodayHeroHeaderProps) {
  const fallbackIso = useMemo(() => toISODate(), []);
  const dateRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    const el = dateRef.current as DateInputWithPicker | null;
    if (el?.showPicker) {
      el.showPicker();
      return;
    }
    dateRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value as ISODate);
    },
    [onChange],
  );

  const title = isToday ? HEADER_TITLE : viewIso;
  const inputValue = viewIso || fallbackIso;

  return (
    <div className="mb-[var(--space-4)] flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-[var(--space-3)]">
        <h2 className="glitch text-title font-semibold tracking-[-0.01em]" data-text={title}>
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-[var(--space-2)]">
        <input
          ref={dateRef}
          type="date"
          value={inputValue}
          onChange={handleChange}
          aria-label="Change focused date"
          className="sr-only"
        />
        <IconButton
          aria-label="Open calendar"
          title={viewIso}
          onClick={openPicker}
          size="md"
          variant="quiet"
          iconSize="md"
        >
          <Calendar />
        </IconButton>
      </div>
    </div>
  );
}
