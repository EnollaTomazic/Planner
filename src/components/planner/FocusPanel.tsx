// src/components/planner/FocusPanel.tsx
"use client";

/**
 * FocusPanel — “focus of the day” bound to day.focus (scoped by iso).
 * - Hydration-safe: local state initializes from day.focus, then syncs via effect
 * - No setState loops: setter only fires when the trimmed focus changes
 * - UX: Save disabled when unchanged; auto-saves on blur
 */

import "./style.css";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/Input";
import Button from "@/components/ui/primitives/Button";
import { useDayFocus } from "./useDayFocus";
import type { ISODate } from "./plannerTypes";

type Props = { iso: ISODate };

export default function FocusPanel({ iso }: Props) {
  const { value, setValue, saving, isDirty, lastSavedRef, commit } =
    useDayFocus(iso);
  const headerId = React.useMemo(() => `focus-${iso}-header`, [iso]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void commit();
  };

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header id={headerId} title="Daily Focus" />
      <SectionCard.Body>
        <form onSubmit={onSubmit} className="flex items-center gap-[var(--space-2)]">
          <Input
            placeholder="What’s the one thing today?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}                   // Auto-save on blur
            name={`focus-${iso}`}
            autoComplete="off"
            className="flex-1"
            aria-labelledby={headerId}
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
        <div className="mt-[var(--space-2)] text-label text-muted-foreground" aria-live="polite">
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
