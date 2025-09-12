"use client";

import * as React from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { PillarBadge } from "@/components/ui";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";

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
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const editButtonRef = React.useRef<HTMLButtonElement>(null);
  const wasEditing = React.useRef(false);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    } else if (wasEditing.current) {
      editButtonRef.current?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  function startEdit() {
    if (!goal) return;
    setDraft(goal.title);
    setEditing(true);
  }

  function saveEdit() {
    if (!goal || !onEdit) return;
    const clean = draft.trim();
    if (clean) onEdit(goal.id, clean);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <div className="group relative rounded-card r-card-lg border border-border bg-surface p-1 shadow-neoSoft">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center rounded-card r-card-lg bg-surface-2 font-mono text-center text-sm text-foreground",
          goal?.done && "bg-muted text-muted-foreground",
        )}
      >
        {goal ? (
          editing ? (
            <div className="flex w-full flex-col items-center">
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Goal title"
                height="sm"
              />
              <div className="mt-1 flex space-x-1">
                <IconButton
                  size="sm"
                  tone="accent"
                  onClick={saveEdit}
                  aria-label="Save goal title"
                >
                  <Check className="h-4 w-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  tone="danger"
                  onClick={cancelEdit}
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          ) : (
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
                  "absolute bottom-1 right-1 flex rounded-md bg-surface p-[var(--spacing-1)] text-foreground transition-colors hover:bg-surface-2 active:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:pointer-events-none",
                  goal?.done && "text-success",
                )}
                aria-label={goal.done ? "Mark goal undone" : "Mark goal done"}
                aria-pressed={goal.done}
                onClick={() => onToggleDone?.(goal.id)}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                ref={editButtonRef}
                type="button"
                className="absolute bottom-1 left-1 flex rounded-md bg-surface p-[var(--spacing-1)] text-foreground opacity-0 transition-opacity transition-colors group-hover:opacity-100 hover:bg-surface-2 active:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Edit goal"
                onClick={startEdit}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="absolute bottom-1 left-7 flex rounded-md bg-surface p-[var(--spacing-1)] text-foreground opacity-0 transition-opacity transition-colors group-hover:opacity-100 hover:bg-surface-2 active:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Delete goal"
                onClick={() => onDelete?.(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )
        ) : (
          <span className="text-muted-foreground">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
