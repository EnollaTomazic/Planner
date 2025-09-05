"use client";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
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
      <SectionCard className="glitch-terminal">
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
          <label className="grid gap-1">
            <span className="text-xs text-white/60">Title</span>
            <Input
              tone="default"
              className="glitch-terminal__input h-9 text-sm focus:ring-2 focus:ring-purple-400/60"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-required="true"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-white/60">Metric (optional)</span>
            <Input
              tone="default"
              className="glitch-terminal__input h-9 text-sm focus:ring-2 focus:ring-purple-400/60 tabular-nums"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-white/60">Notes (optional)</span>
            <Textarea
              tone="default"
              className="glitch-terminal__input min-h-[96px] text-sm focus:ring-2 focus:ring-purple-400/60"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </label>

          <div className="glitch-terminal__output text-xs text-white/60">
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
            <p role="status" aria-live="polite" className="glitch-terminal__output text-xs text-[hsl(var(--accent))]">
              {err}
            </p>
          ) : null}
        </SectionCard.Body>
      </SectionCard>
    </form>
  );
}

