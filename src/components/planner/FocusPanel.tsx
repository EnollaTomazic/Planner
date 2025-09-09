// src/components/planner/FocusPanel.tsx
"use client";

/**
 * FocusPanel — “focus of the day” bound to day.notes (scoped by iso).
 * - Hydration-safe: local state initializes from day.notes, then syncs via effect
 * - No setState loops: setFocus only fires if focus !== iso
 * - UX: Save disabled when unchanged; auto-saves on blur
 */

import "./style.css";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/Input";
import Button from "@/components/ui/primitives/Button";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";

type Props = { iso: ISODate };

export default function FocusPanel({ iso }: Props) {
  const { focus, setFocus, day, setNotes } = usePlannerStore();

  // Initialize from current day.notes; safe because usePersistentState returns initial on first render.
  const [value, setValue] = React.useState<string>(day.notes ?? "");

  // Keep global focus aligned with the visible iso without causing loops.
  React.useEffect(() => {
    if (focus !== iso) setFocus(iso);
  }, [focus, iso, setFocus]);

  // When the underlying day notes change (due to iso switch or cross-tab sync), refresh local state.
  React.useEffect(() => {
    setValue(day.notes ?? "");
  }, [day.notes]);

  // Derived flags
  const trimmed = value.trim();
  const original = (day.notes ?? "").trim();
  const isDirty = trimmed !== original;
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef(original);

  const commit = React.useCallback(async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      // Persist to local DB via planner hook
      await Promise.resolve(setNotes(trimmed));
      lastSavedRef.current = trimmed;
    } finally {
      setSaving(false);
    }
  }, [isDirty, setNotes, trimmed]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void commit();
  };

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header title="Daily Focus" />
      <SectionCard.Body>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            placeholder="What’s the one thing today?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}                   // Auto-save on blur
            name={`focus-${iso}`}
            autoComplete="off"
            className="flex-1"
            aria-label="Daily focus"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!isDirty || saving}
            aria-disabled={!isDirty || saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </form>

        {/* Subtle status text without yelling at the user */}
        <div className="mt-2 text-xs text-muted-foreground" aria-live="polite">
          {saving
            ? "Saving changes…"
            : isDirty
            ? "Unsaved changes"
            : lastSavedRef.current
            ? "All changes saved"
            : "No focus set yet"}
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}
