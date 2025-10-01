"use client";

import * as React from "react";
import { IconButton, Input, Textarea, CheckCircle } from "@/components/ui";
import { Trash2, Flag, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/date";
import type { Goal } from "@/lib/types";

const ICON_SM = "size-[var(--icon-size-sm)]";
const ICON_XS = "size-[var(--icon-size-xs)]";
const ICON_CLASS = {
  sm: ICON_SM,
  xs: ICON_XS,
} as const;

interface GoalListProps {
  goals: Goal[];
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Pick<Goal, "title" | "metric" | "notes">,
  ) => void;
}

export default function GoalList({
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

  function startEdit(g: Goal) {
    setEditingId(g.id);
    setDraft({
      title: g.title,
      metric: g.metric ?? "",
      notes: g.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id: string) {
    onUpdate(id, {
      title: draft.title,
      metric: draft.metric || undefined,
      notes: draft.notes || undefined,
    });
    setEditingId(null);
  }

  return (
    <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [grid-auto-rows:minmax(0,1fr)] list-none m-0 p-0">
      {goals.length === 0 ? (
        <li className="flex">
          <div className="card-pad flex h-full w-full flex-1 flex-col items-center justify-center gap-[var(--space-2)] text-center text-ui font-medium text-muted-foreground rounded-card border border-card-hairline-60 bg-surface">
            <Flag aria-hidden className={cn(ICON_CLASS.sm, "text-accent")} />
            <p className="max-w-[calc(var(--space-7)*5)]">
              No goals here. Add one simple, finishable thing.
            </p>
          </div>
        </li>
      ) : (
        goals.map((g) => {
          const isEditing = editingId === g.id;
          const headingId = `goal-${g.id}-heading`;
          return (
            <li key={g.id} className="flex">
              <article
                className="card-pad flex min-h-[var(--space-6)] w-full flex-1 flex-col rounded-card border border-card-hairline-60 bg-surface text-card-foreground transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--theme-ring,var(--focus))] focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--surface))] hover:bg-surface-2 focus-within:bg-surface-2"
              >
                  <header className="flex items-start justify-between gap-[var(--space-2)]">
                    <div className="flex-1 pr-[var(--space-6)]">
                      <h3
                        id={headingId}
                        className={[
                          "text-title font-semibold tracking-[-0.01em] leading-tight",
                          isEditing ? "sr-only" : "line-clamp-2",
                        ].join(" ")}
                      >
                        {isEditing
                          ? draft.title || g.title || "Goal title"
                          : g.title}
                      </h3>
                      {isEditing ? (
                        <Input
                          aria-labelledby={headingId}
                          value={draft.title}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, title: e.target.value }))
                          }
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
                            variant="ghost"
                            tone="accent"
                            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                          >
                            <X />
                          </IconButton>
                          <IconButton
                            aria-label="Save"
                            onClick={() => saveEdit(g.id)}
                            size="sm"
                            variant="soft"
                            tone="accent"
                            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                          >
                            <Check />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <CheckCircle
                            aria-label={g.done ? "Mark active" : "Mark done"}
                            checked={g.done}
                            onChange={() => onToggleDone(g.id)}
                            size="sm"
                            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                          />
                          <IconButton
                            title="Edit"
                            aria-label="Edit goal"
                            onClick={() => startEdit(g)}
                            size="sm"
                            variant="ghost"
                            tone="accent"
                            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                          >
                            <Pencil />
                          </IconButton>
                          <IconButton
                            title="Delete"
                            aria-label="Delete goal"
                            onClick={() => onRemove(g.id)}
                            size="sm"
                            variant="soft"
                            tone="accent"
                            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                          >
                            <Trash2 />
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
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, metric: e.target.value }))
                          }
                          className="tabular-nums"
                          placeholder="Metric"
                        />
                        <Textarea
                          aria-label="Notes"
                          value={draft.notes}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, notes: e.target.value }))
                          }
                          placeholder="Notes"
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <>
                        {g.metric ? (
                          <div className="tabular-nums">
                            <span className="opacity-70">Metric:</span>{" "}
                            {g.metric}
                          </div>
                        ) : null}
                        {g.notes ? (
                          <p className="text-body leading-relaxed">{g.notes}</p>
                        ) : null}
                      </>
                    )}
                  </div>
                  <footer className="mt-auto flex items-center justify-between pt-[var(--space-3)] text-label font-medium tracking-[0.02em] text-muted-foreground">
                    <span className="inline-flex items-center gap-[var(--space-2)]">
                      <span
                        aria-hidden
                        className={[
                          "h-[var(--space-2)] w-[var(--space-2)] rounded-full transition-all",
                          g.done
                            ? "bg-muted-foreground/40"
                            : "bg-accent shadow-ring motion-safe:animate-pulse",
                        ].join(" ")}
                      />
                      <time
                        className="tabular-nums"
                        dateTime={new Date(g.createdAt).toISOString()}
                      >
                        {shortDate.format(new Date(g.createdAt))}
                      </time>
                    </span>
                    <span
                      className={
                        g.done ? "text-muted-foreground" : "text-accent-3"
                      }
                    >
                      {g.done ? "Done" : "Active"}
                    </span>
                  </footer>
                </article>
            </li>
          );
        })
      )}
    </ul>
  );
}
