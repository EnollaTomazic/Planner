"use client";
import "./style.css";

import * as React from "react";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import IconButton from "@/components/ui/primitives/IconButton";
import Pill from "@/components/ui/primitives/pill";
import { Trash2 } from "lucide-react";

export default function GoalCard({ goal, onToggle, onDelete }: {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const date = React.useMemo(() => new Date(goal.createdAt), [goal.createdAt]);
  return (
    <article className="p-4 rounded-xl border bg-[hsl(var(--card)/0.6)] flex flex-col gap-4">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight flex-1 min-w-0 line-clamp-2">
          {goal.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <CheckCircle
            aria-label={goal.done ? "Mark active" : "Mark done"}
            checked={goal.done}
            onChange={onToggle}
            size="lg"
          />
          <IconButton
            title="Delete"
            aria-label="Delete goal"
            onClick={onDelete}
            circleSize="sm"
          >
            <Trash2 />
          </IconButton>
        </div>
      </header>

      <div className="flex flex-col gap-1 min-h-[28px]">
        {goal.metric && (
          <p className="text-sm text-white/70 tabular-nums">{goal.metric}</p>
        )}
        {goal.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{goal.notes}</p>
        )}
      </div>

      <footer className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 rounded-full",
              goal.done ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--primary))]"
            )}
          />
          <time className="tabular-nums" dateTime={date.toISOString()}>
            {date.toLocaleDateString()}
          </time>
        </span>
        <Pill className={goal.done ? "text-[hsl(var(--accent))]" : ""}>
          {goal.done ? "Done" : "Active"}
        </Pill>
      </footer>
    </article>
  );
}
