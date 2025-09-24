"use client";

import * as React from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useAutoFocus from "@/lib/useAutoFocus";
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

  useAutoFocus({ ref: inputRef, when: editing });

  React.useEffect(() => {
    if (!editing && wasEditing.current) {
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
    <div className="group relative rounded-card r-card-lg border border-border bg-surface p-[var(--space-1)] shadow-neoSoft">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center rounded-card r-card-lg bg-surface-2 font-mono text-center text-ui font-medium text-foreground",
          goal?.done && "bg-muted text-muted-foreground",
        )}
      >
        {goal ? (
          editing ? (
            <div className="flex w-full flex-col items-center gap-[var(--space-1)]">
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Goal title"
                height="sm"
              />
              <div className="flex items-center gap-[var(--space-1)]">
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
              <div className="flex flex-col items-center gap-[var(--space-1)]">
                <span className={cn("block", goal?.done && "line-through")}>
                  {goal.title}
                </span>
                {goal.pillar && (
                  <PillarBadge
                    pillar={goal.pillar}
                    size="sm"
                    as="span"
                  />
                )}
              </div>
              <IconButton
                size="sm"
                iconSize="xs"
                tone={goal.done ? "accent" : "primary"}
                variant="ghost"
                className="absolute bottom-[var(--space-1)] right-[var(--space-1)]"
                aria-label={goal.done ? "Mark goal undone" : "Mark goal done"}
                aria-pressed={goal.done}
                onClick={() => onToggleDone?.(goal.id)}
              >
                <Check className="h-4 w-4" />
              </IconButton>
              <div
                className="pointer-events-none absolute bottom-[var(--space-1)] left-[var(--space-1)] flex items-center gap-[var(--space-1)] opacity-0 transition-opacity duration-quick ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              >
                <IconButton
                  ref={editButtonRef}
                  size="sm"
                  iconSize="xs"
                  variant="ghost"
                  aria-label="Edit goal"
                  title="Edit goal"
                  onClick={startEdit}
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  iconSize="xs"
                  tone="danger"
                  variant="ghost"
                  aria-label="Delete goal"
                  title="Delete goal"
                  onClick={() => onDelete?.(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </>
          )
        ) : (
          <span className="text-label font-medium tracking-[0.02em] text-muted-foreground">NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}
