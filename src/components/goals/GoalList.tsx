"use client";

import * as React from "react";
import { IconButton, Input, Textarea, CheckCircle } from "@/components/ui";
import { Trash2, Flag, Pencil, X, Check } from "lucide-react";
import { shortDate } from "@/lib/date";
import type { Goal } from "@/lib/types";

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
    <div className="grid grid-cols-12 gap-6 [grid-auto-rows:minmax(0,1fr)]">
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card r-card-lg border border-dashed border-accent/40 bg-card/20 p-6 text-center text-ui font-medium text-muted-foreground backdrop-blur-md shadow-ring [--ring:var(--accent)]">
          <Flag
            aria-hidden
            className="mb-2 h-6 w-6 text-accent shadow-ring motion-safe:animate-bounce [--ring:var(--accent)]"
          />
          <p>No goals here. Add one simple, finishable thing.</p>
        </div>
      ) : (
        goals.map((g) => {
          const isEditing = editingId === g.id;
          return (
            <div key={g.id} className="col-span-12 md:col-span-6 lg:col-span-4">
              <article
                className={[
                  "relative overflow-hidden rounded-card r-card-lg p-6 min-h-8 flex flex-col",
                  "bg-card/30 backdrop-blur-md",
                  "shadow-ring [--ring:var(--accent)]",
                  "transition-all duration-150 hover:-translate-y-1 hover:shadow-ring",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-card r-card-lg p-px [background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),transparent)] [mask:linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))_content-box,linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))] [mask-composite:exclude]"
                />
                <header className="relative z-[1] flex items-start justify-between gap-2">
                  {isEditing ? (
                    <Input
                      value={draft.title}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, title: e.target.value }))
                      }
                      className="pr-6 font-semibold"
                      placeholder="Title"
                    />
                  ) : (
                    <h3 className="pr-6 text-title font-semibold tracking-[-0.01em] leading-tight line-clamp-2">
                      {g.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <IconButton
                          aria-label="Cancel"
                          onClick={cancelEdit}
                          size="sm"
                          variant="ring"
                          tone="accent"
                          className="transition-transform hover:-translate-y-0.5"
                        >
                          <X />
                        </IconButton>
                        <IconButton
                          aria-label="Save"
                          onClick={() => saveEdit(g.id)}
                          size="sm"
                          variant="glow"
                          tone="accent"
                          className="transition-transform hover:-translate-y-0.5"
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
                          className="transition-transform shadow-ring hover:-translate-y-0.5 hover:shadow-ring [--ring:var(--accent)]"
                        />
                        <IconButton
                          title="Edit"
                          aria-label="Edit goal"
                          onClick={() => startEdit(g)}
                          size="sm"
                          variant="ring"
                          tone="accent"
                          className="transition-transform hover:-translate-y-0.5"
                        >
                          <Pencil />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          aria-label="Delete goal"
                          onClick={() => onRemove(g.id)}
                          size="sm"
                          variant="glow"
                          tone="accent"
                          className="transition-transform hover:-translate-y-0.5"
                        >
                          <Trash2 />
                        </IconButton>
                      </>
                    )}
                  </div>
                </header>
                <div className="relative z-[1] mt-4 space-y-2 text-ui font-medium text-muted-foreground">
                  {isEditing ? (
                    <div className="space-y-2">
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
                          <span className="opacity-70">Metric:</span> {g.metric}
                        </div>
                      ) : null}
                      {g.notes ? (
                        <p className="text-body leading-relaxed">{g.notes}</p>
                      ) : null}
                    </>
                  )}
                </div>
                <footer className="relative z-[1] mt-auto pt-3 flex items-center justify-between text-label font-medium tracking-[0.02em] text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className={[
                        "h-2 w-2 rounded-full transition-all",
                        g.done
                          ? "bg-muted-foreground/40"
                          : "bg-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent)]",
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
                    className={g.done ? "text-muted-foreground" : "text-accent"}
                  >
                    {g.done ? "Done" : "Active"}
                  </span>
                </footer>
              </article>
            </div>
          );
        })
      )}
    </div>
  );
}
