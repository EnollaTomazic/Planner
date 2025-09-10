"use client";

import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { PillarBadge } from "@/components/ui";

interface GoalSlotProps {
  goal?: Goal | null;
  onToggleDone?: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
}

export default function GoalSlot({
  goal,
  onToggleDone,
  onEdit,
  onDelete,
}: GoalSlotProps) {
  function handleEdit() {
    if (!goal || !onEdit) return;
    const t = window.prompt("Edit goal title", goal.title);
    if (t !== null) {
      const clean = t.trim();
      if (clean) onEdit(goal.id, clean);
    }
  }

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-1 shadow-neoSoft">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-surface-2 font-mono text-center text-sm text-foreground",
          goal?.done && "bg-muted text-muted-foreground",
        )}
      >
        {goal ? (
          <>
            <div className="flex flex-col items-center">
              <span className={cn("block", goal?.done && "line-through")}>
                {goal.title}
              </span>
              {goal.pillar && (
                <PillarBadge
                  pillar={goal.pillar}
                  size="sm"
                  className="mt-1"
                  as="span"
                />
              )}
            </div>
            <button
              type="button"
              className={cn(
                "absolute bottom-1 right-1 flex rounded bg-surface p-[0.15rem] text-foreground",
                goal?.done && "text-success",
              )}
              aria-label={goal.done ? "Mark goal undone" : "Mark goal done"}
              aria-pressed={goal.done}
              onClick={() => onToggleDone?.(goal.id)}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute bottom-1 left-1 flex rounded bg-surface p-[0.15rem] text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Edit goal"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute bottom-1 left-7 flex rounded bg-surface p-[0.15rem] text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Delete goal"
              onClick={() => onDelete?.(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span className="text-muted-foreground">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
