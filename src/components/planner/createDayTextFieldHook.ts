// src/components/planner/createDayTextFieldHook.ts
"use client";

import * as React from "react";

import type { DayRecord, ISODate } from "./plannerTypes";
import { scheduleSavingReset as defaultScheduleSavingReset } from "./scheduleSavingReset";
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

export function createDayTextFieldHook({
  selectValue,
  applyValue,
  scheduleSavingReset = defaultScheduleSavingReset,
}: {
  selectValue: DayTextSelector;
  applyValue: DayTextMutator;
  scheduleSavingReset?: typeof defaultScheduleSavingReset;
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
    const mountedRef = React.useRef(true);
    const scheduleSavingResetRef = React.useRef(scheduleSavingReset);
    scheduleSavingResetRef.current = scheduleSavingReset;
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
        scheduleSavingResetRef.current(() => {
          if (mountedRef.current) {
            setSaving(false);
          }
        });
      }
    }, [applyForIso, isDirty, trimmed]);

    React.useEffect(() => {
      setValue(persistedValue);
      lastSavedRef.current = persistedValue.trim();
    }, [iso, persistedValue]);

    React.useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return { value, setValue, saving, isDirty, lastSavedRef, commit } as const;
  };
}
