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

const VIEW_CONTAINER = "champ-badges mt-1";
const EDIT_CONTAINER = "champ-badges mt-1 flex flex-wrap gap-2";
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
  const sanitized = React.useMemo(() => sanitizeList(list ?? []), [list]);
  const workingList = sanitized.length ? sanitized : [""];

  function commit(next: string[]) {
    onChange(sanitizeList(next));
  }

  function commitWithoutBlanks(next: string[]) {
    const cleaned = sanitizeList(next).filter((item) => item.trim().length);
    onChange(cleaned);
  }

  function setAt(index: number, value: string) {
    const next = [...workingList];
    next[index] = value;
    commitWithoutBlanks(next);
  }

  function insertAfter(index: number) {
    const next = [...workingList];
    next.splice(index + 1, 0, "");
    const sanitizedNext = sanitizeList(next);
    commit(sanitizedNext.length ? sanitizedNext : [""]);
  }

  function removeAt(index: number) {
    const next = [...workingList];
    next.splice(index, 1);
    commit(sanitizeList(next));
  }

  if (!editing) {
    if (sanitized.length === 0) {
      if (emptyLabel === undefined) return null;
      return (
        <div className={cn(VIEW_CONTAINER, viewClassName)}>
          <span
            className={cn(PILL_BASE, pillClassName)}
            aria-disabled
          >
            <i className="dot" />
            {emptyLabel}
          </span>
        </div>
      );
    }

    return (
      <div className={cn(VIEW_CONTAINER, viewClassName)}>
        {sanitized.map((champ, index) => (
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
