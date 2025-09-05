"use client";

import * as React from "react";
import { Check, Pencil } from "lucide-react";
import type { Goal } from "@/lib/types";
import EditGoalDialog from "./EditGoalDialog";

interface GoalSlotProps {
  goal?: Goal | null;
  onToggleDone?: (id: string) => void;
  onEdit?: (g: Goal) => void;
}

export default function GoalSlot({ goal, onToggleDone, onEdit }: GoalSlotProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const editBtnRef = React.useRef<HTMLButtonElement>(null);

  function handleEdit() {
    if (!goal) return;
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    editBtnRef.current?.focus();
  }

  function handleConfirm(updated: Goal) {
    onEdit?.(updated);
    setIsEditing(false);
    editBtnRef.current?.focus();
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
              ref={editBtnRef}
            >
              <Pencil className="h-4 w-4" />
            </button>
            {goal && (
              <EditGoalDialog
                goal={goal}
                open={isEditing}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            )}
          </>
        ) : (
          <span className="goal-tv__empty">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
