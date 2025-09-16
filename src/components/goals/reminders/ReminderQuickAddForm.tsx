"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Plus } from "lucide-react";
import { useReminders } from "./useReminders";

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
        className="rounded-card flex items-center gap-2 sm:gap-6 glitch"
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
          variant="solid"
        >
          <Plus size={16} aria-hidden />
        </IconButton>
        <div className={`${neonClass} hidden sm:block`}>
          <p className="neon-note neon-glow text-label font-medium tracking-[0.02em] italic">
            Stop procrastinating, do it now if you have time
          </p>
        </div>
      </form>

      <style jsx>{`
        .neon-primary {
          --neon: var(--primary);
        }
        .neon-life {
          --neon: var(--accent);
        }

        .neon-note {
          margin-top: calc(var(--space-1) * -1.5);
          padding-left: calc(var(--space-1) / 2);
          animation: neon-flicker 4s infinite;
        }

        @keyframes neon-flicker {
          0%,
          17%,
          22%,
          26%,
          52%,
          100% {
            opacity: 1;
          }
          18% {
            opacity: 0.72;
          }
          24% {
            opacity: 0.55;
          }
          54% {
            opacity: 0.78;
          }
          70% {
            opacity: 0.62;
          }
          74% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .neon-note {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

