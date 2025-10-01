// src/components/planner/WeekNotes.tsx
"use client";
import "./style.css";

/**
 * WeekNotes — day-scoped notes editor for the focused ISO date.
 * Historical name kept for compatibility, but UI copy reflects daily scope.
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Textarea from "@/components/ui/primitives/Textarea";
import { useDayNotes } from "./useDayNotes";
import type { ISODate } from "./plannerTypes";

type Props = { iso: ISODate };

export default function WeekNotes({ iso }: Props) {
  const { value, setValue, saving, isDirty, lastSavedRef, commit } =
    useDayNotes(iso);
  const headerId = React.useMemo(() => `notes-${iso}-header`, [iso]);

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header
        id={headerId}
        title="Day notes"
        titleAs="h6"
        titleClassName="text-title font-semibold tracking-tight"
      />
      <SectionCard.Body>
        <Textarea
          placeholder="Jot down anything related to this day…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          name={`notes-${iso}`}
          aria-labelledby={headerId}
          aria-label="Day notes"
          resize="resize-y"
          textareaClassName="min-h-[calc(var(--space-8)*3_-_var(--space-3))] leading-relaxed"
          onBlur={commit}
        />
        <div className="mt-[var(--space-2)] text-label text-muted-foreground" aria-live="polite">
          {saving
            ? "Saving…"
            : isDirty
              ? "Unsaved changes"
              : lastSavedRef.current
                ? "All changes saved"
                : "No notes yet"}
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}
