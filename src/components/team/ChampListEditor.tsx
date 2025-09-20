"use client";

import "./style.css";

import * as React from "react";
import { sanitizeList } from "@/lib/sanitizeList";
import { cn } from "@/lib/utils";

export type ChampListEditorProps = {
  list?: string[];
  onChange: (next: string[]) => void;
  editing: boolean;
  /**
   * When provided, renders a fallback pill when the list is empty in view mode.
   * Use `undefined` (default) to hide the component when no champs are present.
   */
  emptyLabel?: React.ReactNode;
  viewClassName?: string;
  editClassName?: string;
  pillClassName?: string;
  editPillClassName?: string;
  inputClassName?: string;
};

const VIEW_CONTAINER = "champ-badges mt-[var(--space-1)]";
const EDIT_CONTAINER =
  "champ-badges mt-[var(--space-1)] flex flex-wrap gap-[var(--space-2)]";
const PILL_BASE =
  "champ-badge glitch-pill border-border bg-card text-foreground text-label font-medium tracking-[0.02em]";
const INPUT_BASE =
  "bg-transparent border-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-24";

export default function ChampListEditor({
  list,
  onChange,
  editing,
  emptyLabel,
  viewClassName,
  editClassName,
  pillClassName,
  editPillClassName,
  inputClassName,
}: ChampListEditorProps) {
  const normalized = React.useMemo(
    () => sanitizeList(list ?? []).map((item) => item.trim()),
    [list],
  );
  const workingList = normalized.length ? normalized : [""];

  function normalizeList(next: string[]) {
    return sanitizeList(next).map((item) => item.trim());
  }

  function commit(next: string[]) {
    const normalizedNext = normalizeList(next);
    onChange(normalizedNext.length ? normalizedNext : []);
  }

  function commitWithoutBlanks(next: string[]) {
    const normalizedNext = normalizeList(next);
    const cleaned = normalizedNext.filter((item) => item.length > 0);
    onChange(cleaned.length ? cleaned : []);
  }

  function setAt(index: number, value: string) {
    const next = [...workingList];
    next[index] = value;
    commitWithoutBlanks(next);
  }

  function insertAfter(index: number) {
    const next = [...workingList];
    next.splice(index + 1, 0, "");
    commit(next);
  }

  function removeAt(index: number) {
    const next = [...workingList];
    next.splice(index, 1);
    commit(next);
  }

  if (!editing) {
    if (normalized.length === 0) {
      if (emptyLabel === undefined) return null;
      return (
        <div className={cn(VIEW_CONTAINER, viewClassName)}>
          <span
            className={cn(PILL_BASE, pillClassName)}
            aria-disabled="true"
          >
            <i className="dot" />
            {emptyLabel}
          </span>
        </div>
      );
    }

    return (
      <div className={cn(VIEW_CONTAINER, viewClassName)}>
        {normalized.map((champ, index) => (
          <span key={index} className={cn(PILL_BASE, pillClassName)}>
            <i className="dot" />
            {champ}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(EDIT_CONTAINER, editClassName)}>
      {workingList.map((champ, index) => (
        <span
          key={index}
          className={cn(PILL_BASE, editPillClassName ?? pillClassName)}
        >
          <i className="dot" />
          <input
            type="text"
            dir="ltr"
            value={champ}
            onChange={(event) => setAt(index, event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                insertAfter(index);
              }
              if (event.key === "Backspace" && !event.currentTarget.value) {
                event.preventDefault();
                removeAt(index);
              }
            }}
            aria-label="Champion name"
            autoComplete="off"
            className={cn(INPUT_BASE, inputClassName)}
          />
        </span>
      ))}
    </div>
  );
}
