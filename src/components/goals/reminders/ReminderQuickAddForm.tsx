"use client";

import * as React from "react";
import { Input } from "@/components/ui/primitives/Input";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
        className={cn(
          "card-neo-soft rounded-card r-card-lg border border-card-hairline-60 bg-surface shadow-depth-soft",
          styles.form,
        )}
      >
        <div className={cn(styles.fields)}>
          <Input
            ref={inputRef}
            id={inputId}
            aria-label="Quick add reminder"
            placeholder={`Quick add to ${groupLabel}…`}
            value={quickAdd}
            onChange={handleChange}
            aria-describedby={errorId}
            height="md"
            className="w-full shadow-depth-soft"
          />
          <IconButton
            title="Add quick"
            aria-label="Add quick"
            type="submit"
            size="md"
            variant="neo"
            className="shadow-depth-soft"
          >
            <Plus aria-hidden />
          </IconButton>
        </div>
        <div className={cn(neonToneClass, styles.noteWrap)}>
          <p className={`${styles.neonNote} neon-glow text-label font-medium tracking-[0.02em] italic`}>
            Drop a precise cue and clear it once the habit sticks.
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

