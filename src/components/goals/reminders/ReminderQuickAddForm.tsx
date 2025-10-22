"use client";

import * as React from "react";
import { Input } from "@/components/ui/primitives/Input";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Plus } from "lucide-react";
import { useReminders } from "./useReminders";
import styles from "./ReminderQuickAddForm.module.css";

export function ReminderQuickAddForm() {
  const {
    quickAdd,
    setQuickAdd,
    addReminder,
    group,
    groups,
    neonClass,
    quickAddError,
    clearQuickAddError,
    setQuickAddError,
  } = useReminders();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const errorId = quickAddError ? `${inputId}-error` : undefined;

  const groupLabel = React.useMemo(() => {
    return groups.find((item) => item.key === group)?.label ?? "Group";
  }, [groups, group]);

  const neonToneClass = React.useMemo(() => {
    return neonClass === "neon-life" ? styles.neonToneLife : styles.neonTonePrimary;
  }, [neonClass]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = quickAdd.trim();
      if (!trimmed) {
        setQuickAddError("Enter a reminder before adding.");
        return;
      }
      const added = addReminder(trimmed);
      if (added) {
        inputRef.current?.focus({ preventScroll: true });
      }
    },
    [addReminder, quickAdd, setQuickAddError],
  );

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (quickAddError) {
        clearQuickAddError();
      }
      setQuickAdd(event.currentTarget.value);
    },
    [clearQuickAddError, quickAddError, setQuickAdd],
  );

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="glitch rounded-card flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between sm:gap-[var(--space-4)]"
      >
        <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:gap-[var(--space-3)] sm:flex-1">
          <Input
            ref={inputRef}
            id={inputId}
            aria-label="Quick add reminder"
            placeholder={`Quick add to ${groupLabel}…`}
            value={quickAdd}
            onChange={handleChange}
            aria-describedby={errorId}
            className="w-full sm:flex-1"
          />
          <IconButton
            title="Add quick"
            aria-label="Add quick"
            type="submit"
            size="md"
            variant="default"
            className="sm:flex-none"
          >
            <Plus aria-hidden />
          </IconButton>
        </div>
        <div className={`${neonToneClass} hidden sm:flex sm:flex-1 sm:justify-end`}>
          <p
            className={`${styles.neonNote} neon-glow text-label font-medium tracking-[0.02em] italic`}
          >
            Stop procrastinating, do it now if you have time
          </p>
        </div>
      </form>
      {quickAddError ? (
        <p
          id={errorId}
          role="status"
          aria-live="polite"
          className="text-label font-medium tracking-[0.02em] text-danger"
        >
          {quickAddError}
        </p>
      ) : null}
    </>
  );
}

