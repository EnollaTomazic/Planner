// src/components/planner/createDayTextFieldHook.ts
"use client";

import * as React from "react";

import type { DayRecord, ISODate } from "./plannerStore";
import { usePlannerStore } from "./usePlannerStore";

type DayTextSelector = (day: DayRecord) => string | undefined;
type DayTextMutator = (day: DayRecord, value: string) => DayRecord;

type UseDayTextField = (iso: ISODate) => {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  saving: boolean;
  isDirty: boolean;
  lastSavedRef: React.MutableRefObject<string>;
  commit: VoidFunction;
};

const scheduleSavingReset = (callback: VoidFunction) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  setTimeout(callback, 0);
};

export function createDayTextFieldHook({
  selectValue,
  applyValue,
}: {
  selectValue: DayTextSelector;
  applyValue: DayTextMutator;
}): UseDayTextField {
  return function useDayTextField(iso: ISODate) {
    const { getDay, upsertDay } = usePlannerStore();
    const day = getDay(iso);
    const persistedValue = selectValue(day) ?? "";

    const applyForIso = React.useCallback(
      (value: string) => {
        upsertDay(iso, (d) => applyValue(d, value));
      },
      [iso, upsertDay],
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
        applyForIso(trimmed);
        lastSavedRef.current = trimmed;
      } finally {
        scheduleSavingReset(() => {
          setSaving(false);
        });
      }
    }, [applyForIso, isDirty, trimmed]);

    React.useEffect(() => {
      setValue(persistedValue);
      lastSavedRef.current = persistedValue.trim();
    }, [iso, persistedValue]);

    return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
  };
}
