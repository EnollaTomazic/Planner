"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import Button from "@/components/ui/primitives/Button";
import SectionCard from "@/components/ui/layout/SectionCard";

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

export interface GoalFormHandle {
  focus: (options?: FocusOptions) => void;
}
export default React.forwardRef<GoalFormHandle, GoalFormProps>(function GoalForm(
  {
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
  }: GoalFormProps,
  ref
) {
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => ({
    focus: (options?: FocusOptions) => titleRef.current?.focus(options),
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <SectionCard className="card-neo-soft">
        <SectionCard.Header
          className="flex items-center justify-between"
          title={<h2 className="text-lg font-semibold">Add Goal</h2>}
          actions={
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Add Goal
            </Button>
          }
        />
        <SectionCard.Body className="grid gap-6">
          <label className="grid gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Title</span>
            <Input
              ref={titleRef}
              tone="default"
              className="h-10 text-sm"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-required="true"
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Metric (optional)</span>
            <Input
              tone="default"
              className="h-10 text-sm tabular-nums"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Notes (optional)</span>
            <Textarea
              tone="default"
              className="min-h-24 text-sm"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>

          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {activeCount >= activeCap ? (
              <span className="text-[hsl(var(--accent))]">
                Cap reached. Finish one to add more.
              </span>
            ) : (
              <span>
                {activeCap - activeCount} active slot
                {activeCap - activeCount === 1 ? "" : "s"} left
              </span>
            )}
          </div>

          {err ? (
            <p role="status" aria-live="polite" className="text-xs text-[hsl(var(--accent))]">
              {err}
            </p>
          ) : null}
        </SectionCard.Body>
      </SectionCard>
    </form>
  );
});

