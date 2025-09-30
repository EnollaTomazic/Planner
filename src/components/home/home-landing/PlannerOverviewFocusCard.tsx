"use client";

import * as React from "react";
import { CheckCircle, NeoCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlannerOverviewFocusProps } from "./types";

function PlannerOverviewFocusCardComponent({
  label,
  title,
  doneCount,
  totalCount,
  tasks,
  remainingTasks,
  onToggleTask,
}: PlannerOverviewFocusProps) {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4">
      <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
        <header className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-label text-muted-foreground">{label}</p>
            <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
              {title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-label text-muted-foreground">Progress</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {doneCount}/{totalCount}
            </p>
          </div>
        </header>
        <ul className="flex flex-col gap-[var(--space-3)]" aria-live="polite">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className="flex items-start gap-[var(--space-3)]">
                <CheckCircle
                  checked={task.done}
                  onChange={() => onToggleTask(task.id)}
                  aria-label={task.toggleLabel}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-pressed={task.done}
                  aria-label={task.toggleLabel}
                  className={cn(
                    "flex flex-col items-start gap-[var(--space-1)] rounded-[var(--control-radius)] px-[var(--space-1)] py-[var(--space-1)] text-left transition",
                    "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 motion-reduce:transition-none",
                    "active:text-foreground/80",
                    "disabled:pointer-events-none disabled:opacity-disabled data-[loading=true]:cursor-progress data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
                  )}
                >
                  <span
                    className={cn(
                      "text-ui font-medium text-card-foreground",
                      task.done && "line-through-soft text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </span>
                  {task.projectName ? (
                    <span className="text-label text-muted-foreground">{task.projectName}</span>
                  ) : null}
                </button>
              </li>
            ))
          ) : (
            <li className="rounded-card r-card-md border border-dashed border-border px-[var(--space-3)] py-[var(--space-3)] text-label text-muted-foreground">
              No tasks captured for this day.
            </li>
          )}
        </ul>
        {remainingTasks > 0 ? (
          <p className="text-label text-muted-foreground">
            +{remainingTasks} more task{remainingTasks === 1 ? "" : "s"} in planner
          </p>
        ) : null}
      </NeoCard>
    </div>
  );
}

export default React.memo(PlannerOverviewFocusCardComponent);
