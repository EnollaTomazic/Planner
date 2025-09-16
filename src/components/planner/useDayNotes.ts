// src/components/planner/useDayNotes.ts
"use client";

import * as React from "react";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";

export function useDayNotes(iso: ISODate) {
  const { getDay, upsertDay } = usePlannerStore();
  const day = getDay(iso);
  const persistedNotes = day.notes ?? "";

  const setNotesForIso = React.useCallback(
    (notes: string) => {
      upsertDay(iso, (d) => ({ ...d, notes }));
    },
    [iso, upsertDay],
  );

  const [value, setValue] = React.useState<string>(() => persistedNotes);
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef(persistedNotes.trim());

  const trimmed = React.useMemo(() => value.trim(), [value]);
  const isDirty = trimmed !== lastSavedRef.current;

  const commit = React.useCallback(() => {
    if (!isDirty) return;
    setSaving(true);
    try {
      setNotesForIso(trimmed);
      lastSavedRef.current = trimmed;
    } finally {
      setSaving(false);
    }
  }, [isDirty, setNotesForIso, trimmed]);

  React.useEffect(() => {
    setValue(persistedNotes);
    lastSavedRef.current = persistedNotes.trim();
  }, [iso, persistedNotes]);

  return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
}
