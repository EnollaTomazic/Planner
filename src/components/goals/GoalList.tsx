"use client";

import * as React from "react";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Trash2 } from "lucide-react";
import { shortDate } from "@/lib/date";
import type { Goal } from "@/lib/types";

interface GoalListProps {
  goals: Goal[];
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function GoalList({ goals, onToggleDone, onRemove }: GoalListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:minmax(0,1fr)]">
      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No goals here. Add one simple, finishable thing.
        </p>
      ) : (
        goals.map((g) => (
          <article
            key={g.id}
            className={[
              "relative rounded-2xl p-6",
              "card-neo transition",
              "hover:shadow-[0_0_0_1px_hsl(var(--primary)/.25),0_12px_40px_hsl(var(--shadow-color)/0.35)]",
              "min-h-8 flex flex-col",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b from-primary via-accent to-transparent opacity-60"
            />
            <header className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight pr-6 line-clamp-2">
                {g.title}
              </h3>
              <div className="flex items-center gap-2">
                <CheckCircle
                  aria-label={g.done ? "Mark active" : "Mark done"}
                  checked={g.done}
                  onChange={() => onToggleDone(g.id)}
                  size="lg"
                />
                <IconButton
                  title="Delete"
                  aria-label="Delete goal"
                  onClick={() => onRemove(g.id)}
                  size="sm"
                >
                  <Trash2 />
                </IconButton>
              </div>
            </header>
            <div className="mt-4 text-sm text-muted-foreground space-y-2">
              {g.metric ? (
                <div className="tabular-nums">
                  <span className="opacity-70">Metric:</span>{" "}
                  {g.metric}
                </div>
              ) : null}
              {g.notes ? <p className="leading-relaxed">{g.notes}</p> : null}
            </div>
            <footer className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className={["h-2 w-2 rounded-full", g.done ? "" : "bg-primary"].join(" ")}
                  style={g.done ? { background: "var(--accent-overlay)" } : undefined}
                />
                <time className="tabular-nums" dateTime={new Date(g.createdAt).toISOString()}>
                  {shortDate.format(new Date(g.createdAt))}
                </time>
              </span>
              <span className={g.done ? "text-accent" : ""}>
                {g.done ? "Done" : "Active"}
              </span>
            </footer>
          </article>
        ))
      )}
    </div>
  );
}

