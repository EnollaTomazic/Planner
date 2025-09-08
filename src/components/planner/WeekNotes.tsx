// src/components/planner/WeekNotes.tsx
"use client";
import "./style.css";

/**
 * WeekNotes — uses the same day.notes as a longer textarea for the focused ISO date.
 * Yes, “WeekNotes” name is historical; this edits the current day to keep things simple.
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Textarea from "@/components/ui/primitives/Textarea";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";

type Props = { iso: ISODate };

export default function WeekNotes({ iso }: Props) {
  const { focus, setFocus, day, setNotes } = usePlannerStore();
  const [value, setValue] = React.useState(day.notes ?? "");
  const trimmed = value.trim();
  const original = (day.notes ?? "").trim();
  const isDirty = trimmed !== original;
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef(original);

  const commit = React.useCallback(async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      await Promise.resolve(setNotes(trimmed));
      lastSavedRef.current = trimmed;
    } finally {
      setSaving(false);
    }
  }, [isDirty, setNotes, trimmed]);

  React.useEffect(() => {
    if (focus !== iso) setFocus(iso);
  }, [focus, iso, setFocus]);

  React.useEffect(() => {
    setValue(day.notes ?? "");
  }, [day.notes]);

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header title="Notes" />
      <SectionCard.Body>
        <Textarea
          placeholder="Jot down anything related to this day…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          name={`notes-${iso}`}
          resize="resize-y"
          textareaClassName="min-h-[180px] leading-relaxed"
          onBlur={commit}
        />
        <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]" aria-live="polite">
          {saving
            ? "Saving changes…"
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
