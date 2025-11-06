"use client";

import * as React from "react";

import { GenericList } from "@/components/lists/GenericList";
import { IconButton, Input, Textarea, CheckCircle } from "@/components/ui";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/date";
import type { Goal } from "@/lib/types";

const ICON_SM = "size-[var(--icon-size-sm)]";

interface GoalListProps {
  goals: Goal[];
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Pick<Goal, "title" | "metric" | "notes">,
  ) => boolean;
}

export function GoalList({
  goals,
  onToggleDone,
  onRemove,
  onUpdate,
}: GoalListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({
    title: "",
    metric: "",
    notes: "",
  });

  const startEdit = React.useCallback((goal: Goal) => {
    setEditingId(goal.id);
    setDraft({
      title: goal.title,
      metric: goal.metric ?? "",
      notes: goal.notes ?? "",
    });
  }, []);

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
  }, []);

  const saveEdit = React.useCallback(
    (id: string) => {
      const updated = onUpdate(id, {
        title: draft.title,
        metric: draft.metric || undefined,
        notes: draft.notes || undefined,
      });
      if (updated) {
        setEditingId(null);
      }
    },
    [draft.metric, draft.notes, draft.title, onUpdate],
  );

  const updateDraft = React.useCallback(
    (key: "title" | "metric" | "notes", value: string) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <GenericList
      items={goals}
      getKey={(goal) => goal.id}
      listClassName="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [grid-auto-rows:minmax(0,1fr)]"
      itemClassName="flex"
      emptyState={{
        title: "No goals here.",
        description: "Add one simple, finishable thing.",
      }}
      renderItem={(goal) => {
        const isEditing = editingId === goal.id;
        const headingId = `goal-${goal.id}-heading`;

        return (
          <article
            className="card-pad flex min-h-[var(--space-6)] w-full flex-1 flex-col rounded-card border border-card-hairline-60 bg-surface text-card-foreground transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-surface hover:bg-surface-2 focus-within:bg-surface-2"
          >
            <header className="flex items-start justify-between gap-[var(--space-2)]">
              <div className="flex-1 pr-[var(--space-6)]">
                <h3
                  id={headingId}
                  className={cn(
                    "text-title font-semibold tracking-[-0.01em] leading-tight",
                    isEditing ? "sr-only" : "line-clamp-2",
                  )}
                >
                  {isEditing
                    ? draft.title || goal.title || "Goal title"
                    : goal.title}
                </h3>
                {isEditing ? (
                  <Input
                    aria-labelledby={headingId}
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    className="font-semibold"
                    placeholder="Title"
                  />
                ) : null}
              </div>
              <div className="flex items-center gap-[var(--space-2)]">
                {isEditing ? (
                  <>
                    <IconButton
                      aria-label="Cancel"
                      onClick={cancelEdit}
                      size="sm"
                      variant="quiet"
                      tone="accent"
                      className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      iconSize="sm"
                    >
                      <X aria-hidden className={ICON_SM} />
                    </IconButton>
                    <IconButton
                      aria-label="Save"
                      onClick={() => saveEdit(goal.id)}
                      size="sm"
                      variant="neo"
                      tone="accent"
                      className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      iconSize="sm"
                    >
                      <Check aria-hidden className={ICON_SM} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <CheckCircle
                      aria-label={goal.done ? "Mark active" : "Mark done"}
                      checked={goal.done}
                      onChange={() => onToggleDone(goal.id)}
                      size="sm"
                      className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                    />
                    <IconButton
                      title="Edit"
                      aria-label="Edit goal"
                      onClick={() => startEdit(goal)}
                      size="sm"
                      variant="quiet"
                      tone="accent"
                      className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      iconSize="sm"
                    >
                      <Pencil aria-hidden className={ICON_SM} />
                    </IconButton>
                    <IconButton
                      title="Delete"
                      aria-label="Delete goal"
                      onClick={() => onRemove(goal.id)}
                      size="sm"
                      variant="neo"
                      tone="accent"
                      className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                      iconSize="sm"
                    >
                      <Trash2 aria-hidden className={ICON_SM} />
                    </IconButton>
                  </>
                )}
              </div>
            </header>

            <div className="mt-[var(--space-4)] space-y-[var(--space-2)] text-ui font-medium text-muted-foreground">
              {isEditing ? (
                <div className="space-y-[var(--space-2)]">
                  <Input
                    aria-label="Metric"
                    value={draft.metric}
                    onChange={(event) => updateDraft("metric", event.target.value)}
                    className="tabular-nums"
                    placeholder="Metric"
                  />
                  <Textarea
                    aria-label="Notes"
                    value={draft.notes}
                    onChange={(event) => updateDraft("notes", event.target.value)}
                    placeholder="Notes"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  {goal.metric ? (
                    <div className="tabular-nums">
                      <span className="opacity-70">Metric:</span>{" "}
                      {goal.metric}
                    </div>
                  ) : null}
                  {goal.notes ? (
                    <p className="text-body leading-relaxed">{goal.notes}</p>
                  ) : null}
                </>
              )}
            </div>

            <footer className="mt-auto flex items-center justify-between pt-[var(--space-3)] text-label font-medium tracking-[0.02em] text-muted-foreground">
              <span className="inline-flex items-center gap-[var(--space-2)]">
                <span
                  aria-hidden
                  className={cn(
                    "h-[var(--space-2)] w-[var(--space-2)] rounded-full transition-all",
                    goal.done
                      ? "bg-muted-foreground/40"
                      : "bg-accent shadow-ring motion-safe:animate-pulse",
                  )}
                />
                <time
                  className="tabular-nums"
                  dateTime={new Date(goal.createdAt).toISOString()}
                >
                  {shortDate.format(new Date(goal.createdAt))}
                </time>
              </span>
              <span className={goal.done ? "text-muted-foreground" : "text-accent-3"}>
                {goal.done ? "Done" : "Active"}
              </span>
            </footer>
          </article>
        );
      }}
    />
  );
}
