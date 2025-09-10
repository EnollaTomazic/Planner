"use client";

import * as React from "react";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Trash2, Flag } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-accent/40 bg-card/20 p-6 text-center text-sm text-muted-foreground backdrop-blur-md shadow-[0_0_16px_hsl(var(--accent)/.2)]">
          <Flag aria-hidden className="mb-2 h-6 w-6 text-accent drop-shadow-[0_0_8px_var(--neon)] animate-bounce" />
          <p>No goals here. Add one simple, finishable thing.</p>
        </div>
      ) : (
        goals.map((g) => (
          <article
            key={g.id}
            className={[
              "relative overflow-hidden rounded-2xl p-6 min-h-8 flex flex-col",
              "bg-card/30 backdrop-blur-md",
              "shadow-[inset_0_0_8px_hsl(var(--accent)/.15),0_0_12px_hsl(var(--accent)/.25)]",
              "transition-all duration-150 hover:-translate-y-1 hover:shadow-[inset_0_0_8px_hsl(var(--accent)/.25),0_0_24px_hsl(var(--accent)/.4)]",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl p-px [background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),transparent)] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] [mask-composite:exclude]"
            />
            <header className="relative z-[1] flex items-start justify-between gap-2">
              <h3 className="pr-6 font-semibold leading-tight line-clamp-2">
                {g.title}
              </h3>
              <div className="flex items-center gap-2">
                <CheckCircle
                  aria-label={g.done ? "Mark active" : "Mark done"}
                  checked={g.done}
                  onChange={() => onToggleDone(g.id)}
                  size="lg"
                  className="transition-transform shadow-[0_0_6px_var(--neon-soft)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_var(--neon)]"
                />
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
              </div>
            </header>
            <div className="relative z-[1] mt-4 space-y-2 text-sm text-muted-foreground">
              {g.metric ? (
                <div className="tabular-nums">
                  <span className="opacity-70">Metric:</span>{" "}
                  {g.metric}
                </div>
              ) : null}
              {g.notes ? <p className="leading-relaxed">{g.notes}</p> : null}
            </div>
            <footer className="relative z-[1] mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className={[
                    "h-2 w-2 rounded-full transition-all",
                    g.done
                      ? "bg-muted-foreground/40"
                      : "bg-accent shadow-[0_0_6px_hsl(var(--accent))] animate-pulse",
                  ].join(" ")}
                />
                <time className="tabular-nums" dateTime={new Date(g.createdAt).toISOString()}>
                  {shortDate.format(new Date(g.createdAt))}
                </time>
              </span>
              <span className={g.done ? "text-muted-foreground" : "text-accent"}>
                {g.done ? "Done" : "Active"}
              </span>
            </footer>
          </article>
        ))
      )}
    </div>
  );
}
