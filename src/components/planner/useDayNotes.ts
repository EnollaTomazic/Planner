// src/components/planner/useDayNotes.ts
"use client";

import * as React from "react";
import { usePlannerStore } from "./usePlannerStore";

export function useDayNotes() {
  const { day, setNotes } = usePlannerStore();
  const [value, setValue] = React.useState<string>(() => day.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef((day.notes ?? "").trim());

  const trimmed = React.useMemo(() => value.trim(), [value]);
  const isDirty = trimmed !== lastSavedRef.current;

  const commit = React.useCallback(() => {
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
