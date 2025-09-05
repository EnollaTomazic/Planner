"use client";

import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { Goal } from "@/lib/types";

interface GoalSlotProps {
  goal?: Goal | null;
  onToggleDone?: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
}

export default function GoalSlot({ goal, onToggleDone, onEdit, onDelete }: GoalSlotProps) {
  function handleEdit() {
    if (!goal || !onEdit) return;
    const t = window.prompt("Edit goal title", goal.title);
    if (t !== null) {
      const clean = t.trim();
      if (clean) onEdit(goal.id, clean);
    }
  }

  return (
    <div className="goal-tv group shadow-neoSoft">
      <div className="goal-tv__screen">
        {goal ? (
          <>
            <span className="block">{goal.title}</span>
            <button
              type="button"
              className="goal-tv__check"
              aria-label="Mark goal done"
              onClick={() => onToggleDone?.(goal.id)}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="goal-tv__edit"
              aria-label="Edit goal"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="goal-tv__delete"
              aria-label="Delete goal"
              onClick={() => onDelete?.(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span className="goal-tv__empty">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
