// src/components/goals/RemindersTab.tsx
"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui/layout/SectionCard";
import { ReminderFilters } from "./reminders/ReminderFilters";
import { ReminderList } from "./reminders/ReminderList";
import { ReminderQuickAddForm } from "./reminders/ReminderQuickAddForm";

export function RemindersTab() {
  return (
    <SectionCard>
      <SectionCard.Body>
        <div className="grid gap-[var(--space-3)]">
          <ReminderQuickAddForm />
          <ReminderFilters />
          <ReminderList />
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}
