"use client";

import * as React from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { PillarBadge, Input } from "@/components/ui";

interface GoalSlotProps {
  goal?: Goal | null;
  onToggleDone?: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
}

export default function GoalSlot({ goal, onToggleDone, onEdit, onDelete }: GoalSlotProps) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const editBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (editing) {
      setTitle(goal?.title ?? "");
      inputRef.current?.focus();
    }
  }, [editing, goal?.title]);

  function startEdit() {
    if (!goal) return;
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setTitle(goal?.title ?? "");
    editBtnRef.current?.focus();
  }

  function submitEdit() {
    if (!goal || !onEdit) return;
    const t = window.prompt("Edit goal title", goal.title);
    if (t !== null) {
      const clean = t.trim();
      if (clean) onEdit(goal.id, clean);
    }
  }

  return (
    <div
      className={
        "group relative rounded-lg border-4 border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1 shadow-neoSoft"
      }
    >
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-[hsl(var(--surface-2))] font-mono text-center text-sm text-[hsl(var(--foreground))]",
          goal?.done && "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
        )}
      >
        {goal ? (
<<<<<<<<< Temporary merge branch 1
          editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEdit();
              }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <label htmlFor={`goal-${goal.id}-edit`} className="sr-only">
                Edit goal title
              </label>
              <Input
                ref={inputRef}
                id={`goal-${goal.id}-edit`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Goal title"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                className="h-8 w-full rounded-sm bg-[hsl(var(--surface))] px-1 text-center"
              />
              <button
                type="submit"
                className="goal-tv__check"
                aria-label="Save title"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="goal-tv__delete"
                aria-label="Cancel edit"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span className="block">{goal.title}</span>
                {goal.pillar && (
                  <PillarBadge pillar={goal.pillar} size="sm" className="mt-1" as="span" />
                )}
              </div>
              <button
                type="button"
                className="goal-tv__check"
                aria-label={goal.done ? "Mark goal undone" : "Mark goal done"}
                aria-pressed={goal.done}
                onClick={() => onToggleDone?.(goal.id)}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                ref={editBtnRef}
                type="button"
                className="goal-tv__edit"
                aria-label="Edit goal"
                onClick={startEdit}
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
          )
=========
          <>
            <div className="flex flex-col items-center">
              <span className={cn("block", goal?.done && "line-through")}>{goal.title}</span>
              {goal.pillar && (
                <PillarBadge pillar={goal.pillar} size="sm" className="mt-1" as="span" />
              )}
            </div>
            <button
              type="button"
              className={cn(
                "absolute bottom-1 right-1 flex rounded bg-[hsl(var(--surface))] p-[0.15rem] text-[hsl(var(--foreground))]",
                goal?.done && "text-[hsl(var(--success))]",
              )}
              aria-label={goal.done ? "Mark goal undone" : "Mark goal done"}
              aria-pressed={goal.done}
              onClick={() => onToggleDone?.(goal.id)}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute bottom-1 left-1 flex rounded bg-[hsl(var(--surface))] p-[0.15rem] text-[hsl(var(--foreground))] opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Edit goal"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute bottom-1 left-7 flex rounded bg-[hsl(var(--surface))] p-[0.15rem] text-[hsl(var(--foreground))] opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Delete goal"
              onClick={() => onDelete?.(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
>>>>>>>>> Temporary merge branch 2
        ) : (
          <span className="text-[hsl(var(--muted-foreground))]">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
