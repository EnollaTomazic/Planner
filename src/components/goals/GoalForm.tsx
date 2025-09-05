"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import Button from "@/components/ui/primitives/button";

interface GoalFormProps {
  title: string;
  metric: string;
  notes: string;
  onTitleChange: (v: string) => void;
  onMetricChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  activeCount: number;
  activeCap: number;
  err?: string | null;
}

export default function GoalForm({
  title,
  metric,
  notes,
  onTitleChange,
  onMetricChange,
  onNotesChange,
  onSubmit,
  activeCount,
  activeCap,
  err,
}: GoalFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-2xl p-5 ring-1 ring-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)]">
        <h2 className="mb-4 text-lg font-semibold">Add Goal</h2>
        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-[hsl(var(--foreground)/0.85)]">Title</span>
            <Input
              tone="default"
              className="h-12 rounded-2xl border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] text-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-required="true"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-[hsl(var(--foreground)/0.85)]">Metric (optional)</span>
            <Input
              tone="default"
              className="h-10 rounded-2xl border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] text-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)] tabular-nums"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-[hsl(var(--foreground)/0.85)]">Notes (optional)</span>
            <Textarea
              tone="default"
              className="h-24 rounded-2xl border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] text-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </label>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="h-12"
              disabled={!title.trim()}
              aria-label="Add Goal"
            >
              Add Goal
            </Button>
          </div>
          <p className="text-xs text-[hsl(var(--foreground)/0.65)]">
            {activeCount >= activeCap
              ? "Cap reached. Finish one to add more."
              : `${activeCap - activeCount} active slot${activeCap - activeCount === 1 ? "" : "s"} left`}
          </p>
          {err ? (
            <p
              role="status"
              aria-live="polite"
              className="text-xs text-[hsl(var(--accent))]"
            >
              {err}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

