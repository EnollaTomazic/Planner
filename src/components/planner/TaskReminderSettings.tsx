"use client";

import * as React from "react";
import NeoCard from "@/components/ui/primitives/NeoCard";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/primitives/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/toggles/Toggle";
import { AnimatedSelect } from "@/components/ui";
import { usePersistentState } from "@/lib/db";
import { usePlannerReminders } from "./plannerContext";
import type { DayTask, TaskReminder } from "./plannerTypes";

const LEAD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "0", label: "At start" },
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
];

const DEFAULT_TIME = "09:00";

type TaskReminderSettingsProps = {
  task?: DayTask;
  onChange: (partial: Partial<TaskReminder> | null) => void;
};

export default function TaskReminderSettings({
  task,
  onChange,
}: TaskReminderSettingsProps) {
  const { filtered, items } = usePlannerReminders();
  const [defaultReminderId, setDefaultReminderId] =
    usePersistentState<string | null>("planner:reminder-default-id.v1", null);
  const [defaultTime, setDefaultTime] = usePersistentState<string>(
    "planner:reminder-default-time.v1",
    DEFAULT_TIME,
  );
  const [defaultLeadMinutes, setDefaultLeadMinutes] = usePersistentState<number>(
    "planner:reminder-default-lead.v1",
    0,
  );

  const availableReminders = React.useMemo(() => {
    const source = filtered.length > 0 ? filtered : items;
    return source
      .slice()
      .sort((a, b) => {
        if (!!b.pinned === !!a.pinned) return a.title.localeCompare(b.title);
        return Number(b.pinned) - Number(a.pinned);
      })
      .map((reminder) => ({
        value: reminder.id,
        label: reminder.title,
      }));
  }, [filtered, items]);

  const activeReminder = task?.reminder;
  const isEnabled = Boolean(activeReminder?.enabled);
  const reminderId =
    activeReminder?.reminderId ??
    defaultReminderId ??
    availableReminders[0]?.value ??
    "";
  const reminderTime = activeReminder?.time ?? defaultTime ?? DEFAULT_TIME;
  const leadMinutes =
    activeReminder?.leadMinutes ?? defaultLeadMinutes ?? 0;

  const selectedTaskLabel = React.useMemo(() => {
    if (!task) return "No task selected";
    const trimmed = task.title.trim();
    return trimmed ? `Reminder for “${trimmed}”` : "Reminder for untitled task";
  }, [task]);

  const handleToggle = React.useCallback(
    (side: "Left" | "Right") => {
      if (!task) return;
      const enable = side === "Right";
      const fallbackId =
        activeReminder?.reminderId ??
        reminderId ??
        availableReminders[0]?.value ??
        "";
      const fallbackTime =
        activeReminder?.time ?? reminderTime ?? DEFAULT_TIME;
      const fallbackLead =
        activeReminder?.leadMinutes ?? leadMinutes ?? 0;

      if (!enable) {
        onChange({
          enabled: false,
          ...(fallbackId ? { reminderId: fallbackId } : {}),
          ...(fallbackTime ? { time: fallbackTime } : {}),
          leadMinutes: fallbackLead,
        });
        return;
      }

      onChange({
        enabled: true,
        ...(fallbackId ? { reminderId: fallbackId } : {}),
        ...(fallbackTime ? { time: fallbackTime } : {}),
        leadMinutes: fallbackLead,
      });
      if (fallbackId) setDefaultReminderId(fallbackId);
      if (fallbackTime) setDefaultTime(fallbackTime);
      setDefaultLeadMinutes(fallbackLead);
    },
    [
      task,
      activeReminder?.reminderId,
      activeReminder?.time,
      activeReminder?.leadMinutes,
      reminderId,
      reminderTime,
      leadMinutes,
      availableReminders,
      onChange,
      setDefaultReminderId,
      setDefaultTime,
      setDefaultLeadMinutes,
    ],
  );

  const handleReminderSelect = React.useCallback(
    (value: string) => {
      if (!task) return;
      onChange({ reminderId: value || undefined });
      if (value) setDefaultReminderId(value);
    },
    [onChange, setDefaultReminderId, task],
  );

  const handleTimeChange = React.useCallback(
    (value: string) => {
      if (!task) return;
      onChange({ time: value || undefined });
      if (value) setDefaultTime(value);
    },
    [onChange, setDefaultTime, task],
  );

  const handleLeadChange = React.useCallback(
    (value: string) => {
      if (!task) return;
      const minutes = Number.parseInt(value, 10);
      const normalized = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
      onChange({ leadMinutes: normalized });
      setDefaultLeadMinutes(normalized);
    },
    [onChange, setDefaultLeadMinutes, task],
  );

  const noReminders = availableReminders.length === 0;

  return (
    <NeoCard className="col-span-full card-pad space-y-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-1)]">
        <h3 className="text-title-sm font-semibold">Task reminders</h3>
        <p className="text-ui text-muted-foreground">{selectedTaskLabel}</p>
      </header>

      {!task ? (
        <p className="text-ui text-muted-foreground">
          Select a task to attach a reminder.
        </p>
      ) : noReminders ? (
        <p className="text-ui text-muted-foreground">
          Add reminders in Goals → Reminders to make them available here.
        </p>
      ) : (
        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-ui font-medium">
              Reminder state
            </span>
            <Toggle
              leftLabel="Off"
              rightLabel="On"
              value={isEnabled ? "Right" : "Left"}
              onChange={handleToggle}
              disabled={!task}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <Label htmlFor={`reminder-select-${task.id}`}>Reminder</Label>
            <AnimatedSelect
              id={`reminder-select-${task.id}`}
              items={availableReminders}
              value={reminderId}
              onChange={handleReminderSelect}
              placeholder="Choose reminder"
              ariaLabel="Select reminder template"
              disabled={!isEnabled}
              size="md"
            />
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <Label htmlFor={`reminder-time-${task.id}`}>Time</Label>
            <Input
              id={`reminder-time-${task.id}`}
              type="time"
              step={60}
              value={reminderTime}
              onChange={(event) => handleTimeChange(event.target.value)}
              disabled={!isEnabled}
            />
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <Label htmlFor={`reminder-lead-${task.id}`}>Lead time</Label>
            <Select
              variant="native"
              id={`reminder-lead-${task.id}`}
              items={LEAD_OPTIONS}
              value={String(leadMinutes)}
              onChange={handleLeadChange}
              disabled={!isEnabled}
            />
          </div>
        </div>
      )}
    </NeoCard>
  );
}
