"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent as CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  InsetInput,
  InsetTextarea,
  Label,
} from "@/components/ui";
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
export const GoalForm = React.forwardRef<GoalFormHandle, GoalFormProps>(function GoalForm(
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
  ref,
) {
  const titleRef = React.useRef<HTMLInputElement>(null);
  const baseId = React.useId();
  const titleId = `${baseId}-title`;
  const metricId = `${baseId}-metric`;
  const notesId = `${baseId}-notes`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
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
      <Card depth="sunken" className="text-card-foreground">
        <CardHeader className="flex flex-col gap-[var(--space-2)]">
          <CardTitle className="tracking-[-0.01em]">Add Goal</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-[var(--space-6)]">
          <Label htmlFor={titleId} className="mb-0 grid gap-[var(--space-2)]">
            Title
            <InsetInput
              ref={titleRef}
              id={titleId}
              height="md"
              inputClassName="font-medium"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              aria-required="true"
              aria-describedby={describedBy || undefined}
              aria-invalid={err ? "true" : undefined}
            />
          </Label>

          <Label htmlFor={metricId} className="mb-0 grid gap-[var(--space-2)]">
            Metric (optional)
            <InsetInput
              id={metricId}
              height="md"
              inputClassName="font-medium tabular-nums"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
              aria-describedby={describedBy || undefined}
            />
          </Label>

          <Label htmlFor={notesId} className="mb-0 grid gap-[var(--space-2)]">
            Notes (optional)
            <InsetTextarea
              id={notesId}
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
        </CardBody>
        <CardFooter className="justify-end">
          <Button type="submit" size="sm" disabled={!canSubmit}>
            Add Goal
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
});
