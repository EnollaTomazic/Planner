"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import Button from "@/components/ui/primitives/Button";
import SectionCard from "@/components/ui/layout/SectionCard";
import Label from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { GOAL_TEXTAREA_MIN_HEIGHT_CLASS } from "./constants";

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
  const id = React.useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [helpId, err ? errorId : null].filter(Boolean).join(" ");
  const trimmedTitle = title.trim();
  const isAtCap = activeCount >= activeCap;
  const canSubmit = Boolean(trimmedTitle) && !isAtCap;

  React.useImperativeHandle(ref, () => ({
    focus: (options?: FocusOptions) => titleRef.current?.focus(options),
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) {
          return;
        }
        onSubmit();
      }}
    >
      <SectionCard className="card-neo-soft">
        <SectionCard.Header
          className="flex items-center justify-between"
          title="Add Goal"
          titleClassName="text-title font-semibold tracking-[-0.01em]"
          actions={
            <Button type="submit" size="sm" disabled={!canSubmit}>
              Add Goal
            </Button>
          }
        />
        <SectionCard.Body className="grid gap-[var(--space-6)]">
          <Label htmlFor="goal-title" className="mb-0 grid gap-[var(--space-2)]">
            Title
            <Input
              ref={titleRef}
              id="goal-title"
              height="md"
              inputClassName="font-medium"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              aria-required="true"
              aria-describedby={describedBy || undefined}
            />
          </Label>

          <Label htmlFor="goal-metric" className="mb-0 grid gap-[var(--space-2)]">
            Metric (optional)
            <Input
              id="goal-metric"
              height="md"
              inputClassName="font-medium tabular-nums"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
              aria-describedby={describedBy || undefined}
            />
          </Label>

          <Label htmlFor="goal-notes" className="mb-0 grid gap-[var(--space-2)]">
            Notes (optional)
            <Textarea
              id="goal-notes"
              textareaClassName={cn(
                GOAL_TEXTAREA_MIN_HEIGHT_CLASS,
                "text-ui font-medium",
              )}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              aria-describedby={describedBy || undefined}
            />
          </Label>

          <div id={helpId} className="text-label font-medium tracking-[0.02em] text-muted-foreground">
            {isAtCap ? (
              <span className="text-danger">
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
            <p
              id={errorId}
              role="status"
              aria-live="polite"
              className="text-label font-medium tracking-[0.02em] text-danger"
            >
              {err}
            </p>
          ) : null}
        </SectionCard.Body>
      </SectionCard>
    </form>
  );
});

