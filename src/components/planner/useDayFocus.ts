// src/components/planner/useDayFocus.ts
"use client";

import * as React from "react";

import { setFocus as applyFocus } from "./plannerCrud";
import { usePlannerStore } from "./usePlannerStore";
import type { ISODate } from "./plannerStore";

const scheduleSavingReset = (callback: VoidFunction) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  setTimeout(callback, 0);
};

export function useDayFocus(iso: ISODate) {
  const { getDay, upsertDay } = usePlannerStore();
  const day = getDay(iso);
  const persistedFocus = day.focus ?? "";

  const setFocusForIso = React.useCallback(
    (focusValue: string) => {
      upsertDay(iso, (d) => applyFocus(d, focusValue));
    },
    [iso, upsertDay],
  );

  const [value, setValue] = React.useState<string>(() => persistedFocus);
  const [saving, setSaving] = React.useState(false);
  const lastSavedRef = React.useRef(persistedFocus.trim());

  const trimmed = React.useMemo(() => value.trim(), [value]);
  const isDirty = trimmed !== lastSavedRef.current;

  const commit = React.useCallback(() => {
    if (!isDirty) return;
    setSaving(true);
    try {
      setFocusForIso(trimmed);
      lastSavedRef.current = trimmed;
    } finally {
      scheduleSavingReset(() => {
        setSaving(false);
      });
    }
  }, [isDirty, setFocusForIso, trimmed]);

  React.useEffect(() => {
    setValue(persistedFocus);
    lastSavedRef.current = persistedFocus.trim();
  }, [iso, persistedFocus]);

  return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
}
