"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Plus } from "lucide-react";
import { useReminders } from "./useReminders";
import styles from "./ReminderQuickAddForm.module.css";

export default function ReminderQuickAddForm() {
  const { quickAdd, setQuickAdd, addReminder, group, groups, neonClass } = useReminders();

  const groupLabel = React.useMemo(() => {
    return groups.find((item) => item.key === group)?.label ?? "Group";
  }, [groups, group]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (quickAdd.trim()) addReminder(quickAdd);
    },
    [addReminder, quickAdd],
  );

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-card flex items-center gap-[var(--space-2)] sm:gap-[var(--space-6)] glitch"
      >
        <Input
          aria-label="Quick add reminder"
          placeholder={`Quick add to ${groupLabel}…`}
          value={quickAdd}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setQuickAdd(event.currentTarget.value)
          }
          className="flex-1"
        />
        <IconButton
          title="Add quick"
          aria-label="Add quick"
          type="submit"
          size="md"
          variant="primary"
        >
          <Plus aria-hidden />
        </IconButton>
        <div className={`${neonClass} hidden sm:block`}>
          <p
            className={`${styles.neonNote} neon-glow text-label font-medium tracking-[0.02em] italic`}
          >
            Stop procrastinating, do it now if you have time
          </p>
        </div>
      </form>
    </>
  );
}

