// src/components/planner/useDayNotes.ts
"use client";

import { createDayTextFieldHook } from "./createDayTextFieldHook";
import { scheduleSavingReset } from "./scheduleSavingReset";
import { setNotes as applyNotes } from "./plannerCrud";

export const useDayNotes = createDayTextFieldHook({
  selectValue: (day) => day.notes,
  applyValue: applyNotes,
  scheduleSavingReset,
});
