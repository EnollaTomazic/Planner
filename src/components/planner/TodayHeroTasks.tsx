"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { FormEvent, KeyboardEvent, MouseEvent } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/Button";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Input } from "@/components/ui/primitives/Input";
import { CheckCircle } from "@/components/ui/toggles/CheckCircle";
import type { DayTask } from "./plannerTypes";

const TASK_OPTION_GUARD_SELECTOR = "[data-task-option-guard='true']";

export type TodayHeroTasksProps = {
  projectId: string;
  projectName: string;
  tasksListId: string;
  taskInputName: string;
  visibleTasks: DayTask[];
  totalTaskCount: number;
  showAllTasks: boolean;
  shouldShowTaskToggle: boolean;
  editingTaskId: string | null;
  editingTaskText: string;
  taskAnnouncementText: string;
  onTaskFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTaskSelect: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEditOpen: (taskId: string, title: string, options?: { select?: boolean }) => void;
  onTaskRenameChange: (value: string) => void;
  onTaskRenameCommit: (taskId: string, fallbackTitle: string) => void;
  onTaskRenameCancel: () => void;
  onToggleShowAllTasks: () => void;
};

export function TodayHeroTasks({
  projectId,
  projectName,
  tasksListId,
  taskInputName,
  visibleTasks,
  totalTaskCount,
  showAllTasks,
  shouldShowTaskToggle,
  editingTaskId,
  editingTaskText,
  taskAnnouncementText,
  onTaskFormSubmit,
  onTaskSelect,
  onTaskToggle,
  onTaskDelete,
  onTaskEditOpen,
  onTaskRenameChange,
  onTaskRenameCommit,
  onTaskRenameCancel,
  onToggleShowAllTasks,
}: TodayHeroTasksProps) {
  if (!projectId) {
    return (
      <div className="mt-[var(--space-4)] text-ui font-medium text-muted-foreground">
        Select a project to add and view tasks.
      </div>
    );
  }

  return (
    <div className="mt-[var(--space-4)] space-y-[var(--space-4)]">
      <form onSubmit={onTaskFormSubmit}>
        <Input
          name={taskInputName}
          placeholder={`> task for "${projectName || "Project"}"`}
          aria-label="New task"
          className="w-full"
        />
      </form>

      <div aria-live="polite" className="sr-only">
        {taskAnnouncementText}
      </div>

      {totalTaskCount === 0 ? (
        <div className="tasks-placeholder">No tasks yet.</div>
      ) : (
        <div className="space-y-[var(--space-2)]">
          <ul
            id={tasksListId}
            className="space-y-[var(--space-2)]"
            role="list"
            aria-label="Tasks"
          >
            {visibleTasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              return (
                <li key={task.id} className="group relative" role="listitem">
                  <button
                    type="button"
                    aria-label={`Select task ${task.title}`}
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      if (event.defaultPrevented) return;
                      if (
                        event.target instanceof Element &&
                        event.target.closest(TASK_OPTION_GUARD_SELECTOR)
                      ) {
                        return;
                      }
                      if (event.target !== event.currentTarget) return;
                      onTaskSelect(task.id);
                    }}
                    onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                      if (event.defaultPrevented) return;
                      if (event.currentTarget !== event.target) {
                        return;
                      }
                      if (
                        event.key === "Enter" ||
                        event.key === " " ||
                        event.key === "Spacebar"
                      ) {
                        event.preventDefault();
                        onTaskSelect(task.id);
                      }
                    }}
                    className={cn(
                      "task-tile absolute inset-0 w-full rounded-card r-card-lg border transition-colors",
                      "border-border bg-card/55 hover:bg-card/70 focus-visible:bg-card/70 active:bg-card/80",
                      "group-hover:bg-card/70 group-active:bg-card/80 group-focus-within:bg-card/70",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                      "group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-0",
                    )}
                  >
                    <span className="sr-only">{`Select task ${task.title}`}</span>
                  </button>

                  <div
                    className={cn(
                      "pointer-events-none relative z-[1] flex w-full items-center justify-between",
                      "rounded-card r-card-lg px-[var(--space-3)] py-[var(--space-2)]",
                    )}
                  >
                    <div className="pointer-events-none flex items-center gap-[var(--space-3)]">
                      <div
                        className="pointer-events-auto"
                        data-task-option-guard="true"
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <CheckCircle
                          checked={task.done}
                          onChange={() => {
                            onTaskToggle(task.id);
                          }}
                          size="sm"
                        />
                      </div>
                      {isEditing ? (
                        <Input
                          name={`rename-task-${task.id}`}
                          autoFocus
                          value={editingTaskText}
                          onChange={(event) => onTaskRenameChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              onTaskRenameCommit(task.id, task.title);
                            }
                            if (event.key === "Escape") onTaskRenameCancel();
                          }}
                          onBlur={() => {
                            onTaskRenameCommit(task.id, task.title);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="pointer-events-auto"
                          aria-label={`Rename task ${task.title}`}
                          data-task-option-guard="true"
                        />
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "task-tile__text pointer-events-auto",
                            task.done && "line-through-soft",
                          )}
                          onClick={(event) => {
                            event.stopPropagation();
                            onTaskEditOpen(task.id, task.title);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              onTaskEditOpen(task.id, task.title);
                            }
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          aria-label={`Edit task ${task.title}`}
                          title="Edit task"
                        >
                          {task.title}
                        </button>
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-[var(--space-2)]",
                        isEditing
                          ? "opacity-0 pointer-events-none"
                          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
                      )}
                    >
                      <IconButton
                        aria-label={`Edit task ${task.title}`}
                        title="Edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          onTaskEditOpen(task.id, task.title, { select: true });
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        size="sm"
                        variant="quiet"
                        iconSize="xs"
                      >
                        <Pencil />
                      </IconButton>
                      <IconButton
                        aria-label="Remove task"
                        title="Remove"
                        onClick={(event) => {
                          event.stopPropagation();
                          onTaskDelete(task.id);
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        size="sm"
                        variant="quiet"
                        iconSize="xs"
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {shouldShowTaskToggle && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="quiet"
                onClick={onToggleShowAllTasks}
                aria-expanded={showAllTasks}
                aria-controls={tasksListId}
              >
                {showAllTasks ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
