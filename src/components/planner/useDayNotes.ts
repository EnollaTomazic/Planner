// src/components/planner/useDayNotes.ts
"use client";

import * as React from "react";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";

const scheduleSavingReset = (callback: VoidFunction) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  setTimeout(callback, 0);
};

type DayTextField = "notes" | "focus";

function useDayTextField(iso: ISODate, field: DayTextField) {
  const { getDay, upsertDay } = usePlannerStore();
  const day = getDay(iso);
  const persistedValue = (day[field] ?? "") as string;

  const setValueForIso = React.useCallback(
    (next: string) => {
      upsertDay(iso, (d) => ({ ...d, [field]: next }));
    },
    [field, iso, upsertDay],
  );

  const [value, setValue] = React.useState<string>(() => persistedValue);
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef(persistedValue.trim());

  const trimmed = React.useMemo(() => value.trim(), [value]);
  const isDirty = trimmed !== lastSavedRef.current;

  const commit = React.useCallback(() => {
    if (!isDirty) return;
    setSaving(true);
    try {
      setValueForIso(trimmed);
      lastSavedRef.current = trimmed;
    } finally {
      scheduleSavingReset(() => {
        setSaving(false);
      });
    }
  }, [isDirty, setValueForIso, trimmed]);

  React.useEffect(() => {
    setValue(persistedValue);
    lastSavedRef.current = persistedValue.trim();
  }, [iso, persistedValue]);

  return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
}

export function useDayNotes(iso: ISODate) {
  return useDayTextField(iso, "notes");
}

export function useDayFocus(iso: ISODate) {
  return useDayTextField(iso, "focus");
}
