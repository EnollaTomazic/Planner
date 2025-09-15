// src/components/planner/useDayNotes.ts
"use client";

import * as React from "react";
import { usePlannerStore } from "./usePlannerStore";

export function useDayNotes() {
  const { day, setNotes } = usePlannerStore();
  const [value, setValue] = React.useState<string>(() => day.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef((day.notes ?? "").trim());

  const trimmed = value.trim();
  const original = (day.notes ?? "").trim();
  const isDirty = trimmed !== original;

  const commit = React.useCallback(async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      setNotes(trimmed);
      lastSavedRef.current = trimmed;
    } finally {
      setSaving(false);
    }
  }, [isDirty, setNotes, trimmed]);

  React.useEffect(() => {
    const nextValue = day.notes ?? "";
    setValue(nextValue);
    lastSavedRef.current = nextValue.trim();
  }, [day.notes]);

  return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
}
