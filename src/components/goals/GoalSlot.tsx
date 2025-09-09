"use client";

import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { PillarBadge, Input, Button } from "@/components/ui";

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
  const inputId = React.useId();

  React.useEffect(() => {
    if (editing) {
      setTitle(goal?.title || "");
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    editBtnRef.current?.focus();
    return undefined;
  }, [editing, goal?.title]);

  function startEditing() {
    if (!goal || !onEdit) return;
    setEditing(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal || !onEdit) return;
    const clean = title.trim();
    if (clean) onEdit(goal.id, clean);
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  }

  return (
    <div className="group relative rounded-lg border-4 border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1 shadow-neoSoft">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-[hsl(var(--surface-2))] font-mono text-center text-sm text-[hsl(var(--foreground))]",
          goal?.done && "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
        )}
      >
        {goal ? (
          editing ? (
            <form
              onSubmit={handleSubmit}
              onKeyDown={onKeyDown}
              className="absolute inset-0 flex items-center justify-center gap-1 bg-[hsl(var(--surface-2))]"
            >
              <label htmlFor={inputId} className="sr-only">
                Goal title
              </label>
              <Input
                ref={inputRef}
                id={inputId}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-24"
              />
              <Button size="sm" type="submit">
                Save
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            </form>
          ) : (
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
                ref={editBtnRef}
                type="button"
                className="absolute bottom-1 left-1 flex rounded bg-[hsl(var(--surface))] p-[0.15rem] text-[hsl(var(--foreground))] opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Edit goal"
                onClick={startEditing}
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
          )
        ) : (
          <span className="text-[hsl(var(--muted-foreground))]">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}

