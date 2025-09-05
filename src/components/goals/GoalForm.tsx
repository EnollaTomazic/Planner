"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import Button from "@/components/ui/primitives/button";
import type { Pillar } from "@/lib/types";

const PILLARS: Pillar[] = ["Wave", "Trading", "Vision", "Tempo", "Positioning", "Comms"];

interface GoalFormProps {
  title: string;
  pillar: Pillar | "";
  metric: string;
  notes: string;
  onTitleChange: (v: string) => void;
  onPillarChange: (v: Pillar | "") => void;
  onMetricChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  activeCount: number;
  activeCap: number;
  err?: string | null;
}

export default function GoalForm({
  title,
  pillar,
  metric,
  notes,
  onTitleChange,
  onPillarChange,
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
      <div className="goal-card p-4 shadow-neoSoft">
        <h2 className="mb-4 text-lg font-semibold uppercase tracking-tight">Add Goal</h2>
        <div className="grid gap-4">
          <label htmlFor="goal-title" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Title</span>
            <Input
              id="goal-title"
              className="h-12 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-required="true"
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>

          <label htmlFor="goal-pillar" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Pillar (optional)</span>
            <select
              id="goal-pillar"
              className="h-10 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              value={pillar}
              onChange={(e) => onPillarChange(e.target.value as Pillar | "")}
              aria-describedby="goal-form-help goal-form-error"
            >
              <option value="">None</option>
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="goal-metric" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Metric (optional)</span>
            <Input
              id="goal-metric"
              className="h-10 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] tabular-nums focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              value={metric}
              onChange={(e) => onMetricChange(e.target.value)}
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>

          <label htmlFor="goal-notes" className="grid gap-2">
            <span className="text-xs text-[hsl(var(--fg-muted))]">Notes (optional)</span>
            <Textarea
              id="goal-notes"
              className="min-h-24 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              aria-describedby="goal-form-help goal-form-error"
            />
          </label>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p id="goal-form-help" className="glitch-text text-xs text-[hsl(var(--fg-muted))]">
            {activeCount >= activeCap
              ? "Cap reached. Finish one to add more."
              : `${activeCap - activeCount} active slot${activeCap - activeCount === 1 ? "" : "s"} left`}
          </p>
          <Button
            type="submit"
            size="lg"
            pill={false}
            className="h-12 rounded-2xl"
            disabled={!title.trim()}
            aria-label="Add Goal"
          >
            Add Goal
          </Button>
        </div>
        {err ? (
          <p
            id="goal-form-error"
            role="status"
            aria-live="polite"
            className="glitch-text mt-2 text-xs text-[hsl(var(--accent))]"
          >
            {err}
          </p>
        ) : null}
      </div>
    </form>
  );
}

