"use client";

import "./style.css";

import * as React from "react";
import { Badge } from "@/components/ui/primitives/Badge";
import { uid } from "@/lib/db";
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

const VIEW_CONTAINER =
  "champ-badges mt-[var(--space-2)] flex flex-wrap gap-[var(--space-2)]";
const EDIT_CONTAINER =
  "champ-badges mt-[var(--space-2)] flex flex-wrap gap-[var(--space-2)]";
const PILL_CLASSNAME =
  "flex items-center gap-[var(--space-2)] rounded-full border border-transparent px-[var(--space-3)] py-[var(--space-1)] text-label font-medium tracking-[0.02em] shadow-none [--badge-surface:hsl(var(--card)/0.3)] [--badge-shadow-rest:var(--depth-shadow-subtle)]";
const INPUT_BASE =
  "bg-transparent border-none text-label font-medium tracking-[0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background min-w-[6rem]";
const AVATAR_BASE =
  "flex size-[var(--space-5)] shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[0.65rem] font-semibold uppercase text-muted-foreground";

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed
    .replace(/['`’]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) {
    const letters = Array.from(parts[0]);
    return letters.slice(0, 2).join("").toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function ChampListEditor({
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
  const editingKeysRef = React.useRef<string[]>([]);
  const normalized = React.useMemo(
    () => sanitizeList(list ?? []).map((item) => item.trim()),
    [list],
  );
  const workingList = normalized.length ? normalized : [""];

  function ensureEditingKeys(nextLength: number) {
    const current = editingKeysRef.current;
    if (current.length < nextLength) {
      for (let index = current.length; index < nextLength; index += 1) {
        current.push(uid("champ-slot-"));
      }
    } else if (current.length > nextLength) {
      current.splice(nextLength);
    }
    return current;
  }

  const editingKeys = ensureEditingKeys(workingList.length);

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
    if (value.trim().length === 0) {
      removeAt(index);
      return;
    }

    const next = [...workingList];
    next[index] = value;
    commitWithoutBlanks(next);
  }

  function insertAfter(index: number) {
    const next = [...workingList];
    next.splice(index + 1, 0, "");
    editingKeysRef.current.splice(index + 1, 0, uid("champ-slot-"));
    commit(next);
  }

  function removeAt(index: number) {
    const next = [...workingList];
    next.splice(index, 1);
    editingKeysRef.current.splice(index, 1);
    commit(next);
  }

  if (!editing) {
    if (normalized.length === 0) {
      if (emptyLabel === undefined) return null;
      return (
        <div className={cn(VIEW_CONTAINER, viewClassName)}>
          <Badge
            size="sm"
            disabled
            className={cn(PILL_CLASSNAME, pillClassName)}
          >
            <span className={AVATAR_BASE} aria-hidden>
              ∅
            </span>
            <span>{emptyLabel}</span>
          </Badge>
        </div>
      );
    }

    return (
      <div className={cn(VIEW_CONTAINER, viewClassName)}>
        {normalized.map((champ, index) => (
          <Badge
            key={editingKeys[index]}
            size="sm"
            className={cn(PILL_CLASSNAME, pillClassName)}
          >
            <span className={AVATAR_BASE} aria-hidden>
              {getInitials(champ)}
            </span>
            <span className="max-w-[12rem] truncate text-pretty">{champ}</span>
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(EDIT_CONTAINER, editClassName)}>
      {workingList.map((champ, index) => (
        <Badge
          key={editingKeys[index]}
          size="sm"
          className={cn(PILL_CLASSNAME, editPillClassName ?? pillClassName)}
        >
          <span className={AVATAR_BASE} aria-hidden>
            {champ.trim() ? getInitials(champ) : "?"}
          </span>
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
        </Badge>
      ))}
    </div>
  );
}
