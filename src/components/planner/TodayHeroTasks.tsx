"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/primitives/Button";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import type { DayTask } from "./plannerStore";

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

export default function TodayHeroTasks({
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
                <li
                  key={task.id}
                  className={cn(
                    "task-tile flex items-center justify-between rounded-card r-card-lg border px-[var(--space-3)] py-[var(--space-2)]",
                    "border-border bg-card/55 hover:bg-card/70",
                  )}
                  role="listitem"
                  onClick={() => onTaskSelect(task.id)}
                >
                  <div className="flex items-center gap-[var(--space-3)]">
                    <CheckCircle
                      checked={task.done}
                      onChange={() => {
                        onTaskToggle(task.id);
                      }}
                      size="sm"
                    />
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
                        aria-label={`Rename task ${task.title}`}
                      />
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "task-tile__text",
                          task.done && "line-through-soft",
                        )}
                        onClick={() => {
                          onTaskEditOpen(task.id, task.title);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onTaskEditOpen(task.id, task.title);
                          }
                        }}
                        aria-label={`Edit task ${task.title}`}
                        title="Edit task"
                      >
                        {task.title}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-[var(--space-2)]">
                    <IconButton
                      aria-label={`Edit task ${task.title}`}
                      title="Edit"
                      onClick={() => {
                        onTaskEditOpen(task.id, task.title, { select: true });
                      }}
                      size="sm"
                      variant="secondary"
                      iconSize="xs"
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      aria-label="Remove task"
                      title="Remove"
                      onClick={() => {
                        onTaskDelete(task.id);
                      }}
                      size="sm"
                      variant="secondary"
                      iconSize="xs"
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
          {shouldShowTaskToggle && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
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
