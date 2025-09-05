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
      <div className="scanlines rounded-2xl bg-card/60 p-5 ring-1 ring-border/30 font-mono">
        <h2 className="mb-4 text-lg font-semibold uppercase tracking-tight">Add Goal</h2>
        <div className="grid gap-2.5">
          <label className="grid gap-3">
            <span className="text-xs text-foreground/80">Title</span>
            <Input
              className="rounded-2xl border-border/30 bg-card/60 focus-visible:ring-2 focus-visible:ring-accent"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-required="true"
            />
          </label>

          <label className="grid gap-3">
            <span className="text-xs text-foreground/80">Metric (optional)</span>
            <Input
              className="rounded-2xl border-border/30 bg-card/60 tabular-nums focus-visible:ring-2 focus-visible:ring-accent"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
            />
          </label>

          <label className="grid gap-3">
            <span className="text-xs text-foreground/80">Notes (optional)</span>
            <Textarea
              className="h-24 rounded-2xl border-border/30 bg-card/60 focus-visible:ring-2 focus-visible:ring-accent"
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
          <p className="glitch-text text-xs text-foreground/65">
            {activeCount >= activeCap
              ? "Cap reached. Finish one to add more."
              : `${activeCap - activeCount} active slot${activeCap - activeCount === 1 ? "" : "s"} left`}
          </p>
          {err ? (
            <p
              role="status"
              aria-live="polite"
              className="glitch-text text-xs text-accent"
            >
              {err}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

