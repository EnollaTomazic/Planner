// src/components/planner/useDayFocus.ts
"use client";

import { createDayTextFieldHook } from "./createDayTextFieldHook";
import { scheduleSavingReset } from "./scheduleSavingReset";
import { setFocus as applyFocus } from "./plannerCrud";

export const useDayFocus = createDayTextFieldHook({
  selectValue: (day) => day.focus,
  applyValue: applyFocus,
  scheduleSavingReset,
});
