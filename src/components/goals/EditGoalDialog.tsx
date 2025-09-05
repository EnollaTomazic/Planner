"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import Button from "@/components/ui/primitives/button";
import type { Goal } from "@/lib/types";

interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onConfirm: (g: Goal) => void;
  onCancel: () => void;
}

export default function EditGoalDialog({
  goal,
  open,
  onConfirm,
  onCancel,
}: EditGoalDialogProps) {
  const [title, setTitle] = React.useState(goal.title);
  const [metric, setMetric] = React.useState(goal.metric || "");
  const [notes, setNotes] = React.useState(goal.notes || "");
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(goal.title);
      setMetric(goal.metric || "");
      setNotes(goal.notes || "");
      // Ensure focus after render
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open, goal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated: Goal = {
      ...goal,
      title: title.trim(),
      metric: metric.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onConfirm(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-goal-heading"
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onKeyDown={handleKeyDown}
    >
      <form
        onSubmit={handleSubmit}
        className="goal-card w-full max-w-sm rounded-xl bg-[hsl(var(--card))] p-4 shadow-neoSoft"
      >
        <h2
          id="edit-goal-heading"
          className="mb-4 text-lg font-semibold uppercase tracking-tight"
        >
          Edit Goal
        </h2>
        <div className="grid gap-4">
          <label htmlFor="edit-goal-title" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Title</span>
            <Input
              id="edit-goal-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-required="true"
            />
          </label>
          <label htmlFor="edit-goal-metric" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Metric (optional)</span>
            <Input
              id="edit-goal-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />
          </label>
          <label htmlFor="edit-goal-notes" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Notes (optional)</span>
            <Textarea
              id="edit-goal-notes"
              className="min-h-24"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" onClick={onCancel} aria-label="Cancel editing">
            Cancel
          </Button>
          <Button type="submit" aria-label="Save goal">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

