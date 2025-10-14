"use client";

import * as React from "react";
import { NeoCard } from "@/components/ui/primitives/NeoCard";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/primitives/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/toggles/Toggle";
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

const VALID_LEAD_MINUTES = new Set(
  LEAD_OPTIONS.map((option) => Number.parseInt(option.value, 10)),
);

const DEFAULT_TIME = "09:00";

type TaskReminderSettingsProps = {
  task?: DayTask;
  onChange: (partial: Partial<TaskReminder> | null) => void;
};

export function TaskReminderSettings({
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

  const taskId = task?.id;
  const activeReminder = task?.reminder;
  const isEnabled = Boolean(activeReminder?.enabled);
  const advancedDisclosureButtonId = React.useId();
  const advancedDisclosurePanelId = React.useId();
  const previousAdvancedState = React.useRef<boolean>(true);
  const previousIsEnabled = React.useRef<boolean>(isEnabled);
  const suppressNextCloseSync = React.useRef<boolean>(false);
  const previousTaskId = React.useRef<DayTask["id"] | undefined>(taskId);
  const [areAdvancedOptionsOpen, setAreAdvancedOptionsOpen] = React.useState<boolean>(
    isEnabled,
  );
  const reminderId =
    activeReminder?.reminderId ??
    defaultReminderId ??
    availableReminders[0]?.value ??
    "";
  const reminderTime = activeReminder?.time ?? defaultTime ?? DEFAULT_TIME;
  const leadMinutesRaw =
    activeReminder?.leadMinutes ?? defaultLeadMinutes ?? 0;
  const leadMinutes = React.useMemo(() => {
    if (VALID_LEAD_MINUTES.has(leadMinutesRaw)) {
      return leadMinutesRaw;
    }
    return 0;
  }, [leadMinutesRaw]);

  const selectedTaskLabel = React.useMemo(() => {
    if (!task) return "No task selected";
    const trimmed = task.title.trim();
    return trimmed ? `Reminder for “${trimmed}”` : "Reminder for untitled task";
  }, [task]);

  React.useEffect(() => {
    if (previousTaskId.current === taskId) return;
    previousTaskId.current = taskId;
    previousAdvancedState.current = true;
    setAreAdvancedOptionsOpen(isEnabled);
    previousIsEnabled.current = isEnabled;
  }, [isEnabled, taskId]);

  React.useEffect(() => {
    if (!isEnabled) {
      if (suppressNextCloseSync.current) {
        suppressNextCloseSync.current = false;
        previousIsEnabled.current = isEnabled;
        return;
      }

      if (previousIsEnabled.current) {
        setAreAdvancedOptionsOpen((previous) => {
          previousAdvancedState.current = previous;
          return false;
        });
      } else {
        setAreAdvancedOptionsOpen(false);
      }
      previousIsEnabled.current = isEnabled;
      return;
    }

    const nextOpen = previousAdvancedState.current ?? true;
    previousAdvancedState.current = nextOpen;
    setAreAdvancedOptionsOpen(nextOpen);
    previousIsEnabled.current = isEnabled;
  }, [isEnabled]);

  React.useEffect(() => {
    if (!task || !isEnabled) return;
    if (availableReminders.length === 0) return;
    if (
      reminderId &&
      availableReminders.some((reminder) => reminder.value === reminderId)
    ) {
      return;
    }

    const fallback = availableReminders[0]?.value;
    if (!fallback) return;

    onChange({ reminderId: fallback });
    setDefaultReminderId(fallback);
  }, [
    availableReminders,
    isEnabled,
    onChange,
    reminderId,
    setDefaultReminderId,
    task,
  ]);

  React.useEffect(() => {
    if (!task || !isEnabled) return;
    if (VALID_LEAD_MINUTES.has(leadMinutesRaw)) return;

    const fallbackLead = 0;
    onChange({ leadMinutes: fallbackLead });
    setDefaultLeadMinutes(fallbackLead);
  }, [isEnabled, leadMinutesRaw, onChange, setDefaultLeadMinutes, task]);

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
        previousAdvancedState.current = areAdvancedOptionsOpen;
        suppressNextCloseSync.current = true;
        setAreAdvancedOptionsOpen(false);
        onChange({
          enabled: false,
          ...(fallbackId ? { reminderId: fallbackId } : {}),
          ...(fallbackTime ? { time: fallbackTime } : {}),
          leadMinutes: fallbackLead,
        });
        return;
      }

      const nextOpen = previousAdvancedState.current ?? true;
      previousAdvancedState.current = nextOpen;
      setAreAdvancedOptionsOpen(nextOpen);
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
      areAdvancedOptionsOpen,
    ],
  );

  const handleAdvancedDisclosureToggle = React.useCallback(() => {
    if (!isEnabled) return;
    setAreAdvancedOptionsOpen((previous) => {
      const next = !previous;
      previousAdvancedState.current = next;
      return next;
    });
  }, [isEnabled]);

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
      const normalized =
        Number.isFinite(minutes) && VALID_LEAD_MINUTES.has(minutes)
          ? minutes
          : 0;
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
            <p className="text-caption text-muted-foreground">
              Enable reminders to adjust templates, send time, and lead time.
            </p>
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <button
              type="button"
              id={advancedDisclosureButtonId}
              className="inline-flex w-full items-center justify-between rounded-[var(--control-radius)] border border-border bg-card px-[var(--space-3)] py-[var(--space-2)] text-left text-ui font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              aria-controls={advancedDisclosurePanelId}
              aria-expanded={isEnabled && areAdvancedOptionsOpen}
              aria-disabled={!isEnabled}
              onClick={handleAdvancedDisclosureToggle}
              disabled={!isEnabled}
            >
              <span>Reminder options</span>
              <span className="text-caption text-muted-foreground">
                {areAdvancedOptionsOpen ? "Hide" : "Show"}
              </span>
            </button>

            <div
              id={advancedDisclosurePanelId}
              role="region"
              aria-labelledby={advancedDisclosureButtonId}
              hidden={!isEnabled || !areAdvancedOptionsOpen}
              className="grid gap-[var(--space-3)] md:grid-cols-2"
            >
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
          </div>
        </div>
      )}
    </NeoCard>
  );
}
