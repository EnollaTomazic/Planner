// src/components/goals/RemindersTab.tsx
"use client";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Button from "@/components/ui/primitives/Button";
import Hero from "@/components/ui/layout/Hero";
import { Search, Sparkles, Gamepad2, GraduationCap, Plus } from "lucide-react";
import ReminderQuickAddForm from "./reminders/ReminderQuickAddForm";
import ReminderFilters from "./reminders/ReminderFilters";
import ReminderList from "./reminders/ReminderList";
import {
  RemindersProvider,
  useReminders,
  Domain,
} from "./reminders/useReminders";

const DOMAIN_ITEMS: Array<{
  key: Domain;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "Life", label: "Life", icon: <Sparkles className="mr-1" /> },
  { key: "League", label: "League", icon: <Gamepad2 className="mr-1" /> },
  { key: "Learn", label: "Learn", icon: <GraduationCap className="mr-1" /> },
];

export default function RemindersTab() {
  return (
    <RemindersProvider>
      <RemindersContent />
    </RemindersProvider>
  );
}

function RemindersContent() {
  const { domain, setDomain, query, setQuery, filtered, addReminder } = useReminders();

  return (
    <>
      <Hero
        frame={false}
        topClassName="top-[var(--header-stack)]"
        eyebrow={domain}
        heading="Reminders"
        subtitle="Tiny brain pings you’ll totally ignore until 23:59."
        dividerTint={domain === "Life" ? "life" : "primary"}
        subTabs={{
          items: DOMAIN_ITEMS,
          value: domain,
          onChange: (key: Domain) => setDomain(key),
          align: "end",
          size: "md",
          ariaLabel: "Reminder domain",
          showBaseline: true,
        }}
        search={{
          value: query,
          onValueChange: setQuery,
          placeholder: "Search title, text, tags…",
          debounceMs: 80,
          right: (
            <div className="flex items-center gap-2">
              <span className="text-label font-medium tracking-[0.02em] opacity-75">
                {filtered.length}
              </span>
              <Search className="opacity-80" size={16} />
            </div>
          ),
        }}
        actions={
          <Button
            variant="primary"
            size="md"
            className="px-4 whitespace-nowrap"
            onClick={() => addReminder()}
          >
            <Plus />
            <span>New Reminder</span>
          </Button>
        }
      />

      <SectionCard className="goal-card">
        <SectionCard.Body>
          <div className="grid gap-3">
            <ReminderQuickAddForm />
            <ReminderFilters />
            <ReminderList />
          </div>
        </SectionCard.Body>
      </SectionCard>
    </>
  );
}

