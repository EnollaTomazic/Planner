"use client";

import * as React from "react";
import { NeoCard, CheckCircle } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useDay, useFocusDate } from "@/components/planner";
import type { ISODate } from "@/components/planner/plannerStore";
import {
  useFocusDayLabel,
  useProjectNameMap,
  useTaskPreview,
} from "./useHeroPlanner";

export type FocusDayTask = {
  id: string;
  title: string;
  done: boolean;
  projectName: string | null;
};

export type FocusDayCardProps = {
  focusLabel: string;
  doneCount: number;
  totalCount: number;
  tasks: readonly FocusDayTask[];
  remainingTasks: number;
  onToggleTask: (taskId: string) => void;
  className?: string;
};

function useFocusIso(): ISODate {
  const { iso } = useFocusDate();
  return iso;
}

export function useFocusDayCard(limit = 4): Omit<FocusDayCardProps, "className"> {
  const iso = useFocusIso();
  const { projects, tasks, toggleTask, doneCount, totalCount } = useDay(iso);
  const focusLabel = useFocusDayLabel(iso);
  const projectNames = useProjectNameMap(projects);
  const { preview, remaining } = useTaskPreview(tasks, limit);

  const taskItems = React.useMemo<FocusDayTask[]>(() => {
    return preview.map((task) => ({
      id: task.id,
      title: task.title,
      done: task.done,
      projectName: task.projectId
        ? projectNames.get(task.projectId) ?? null
        : null,
    }));
  }, [preview, projectNames]);

  const handleToggleTask = React.useCallback(
    (taskId: string) => {
      toggleTask(taskId);
    },
    [toggleTask],
  );

  return {
    focusLabel,
    doneCount,
    totalCount,
    tasks: taskItems,
    remainingTasks: remaining,
    onToggleTask: handleToggleTask,
  } as const;
}

function FocusDayCard({
  focusLabel,
  doneCount,
  totalCount,
  tasks,
  remainingTasks,
  onToggleTask,
  className,
}: FocusDayCardProps) {
  return (
    <div className={className}>
      <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
        <header className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-label text-muted-foreground">Focus day</p>
            <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
              {focusLabel}
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
                  aria-label={
                    task.done
                      ? `Mark ${task.title} as not done`
                      : `Mark ${task.title} as done`
                  }
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={cn(
                    "flex flex-col items-start gap-[var(--space-1)] rounded-card r-card-sm px-[var(--space-1)] py-[var(--space-1)] text-left transition",
                    "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                    "active:text-foreground/80",
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
                    <span className="text-label text-muted-foreground">
                      {task.projectName}
                    </span>
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

export default FocusDayCard;
