"use client";

import { useEffect, useState } from "react";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayTask } from "./plannerStore";
import { useTaskAnnouncement } from "./useTaskAnnouncement";

const TASK_PREVIEW_LIMIT = 12;

type TodayTaskPanelProps = {
  projectId: string;
  projectName: string;
  tasks: DayTask[];
  addTask: (title: string, projectId?: string) => string | undefined;
  renameTask: (id: string, title: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setSelectedTaskId: (taskId: string) => void;
};

export default function TodayTaskPanel({
  projectId,
  projectName,
  tasks,
  addTask,
  renameTask,
  deleteTask,
  toggleTask,
  setSelectedTaskId,
}: TodayTaskPanelProps) {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const announcement = useTaskAnnouncement(tasks, projectId, projectName);

  useEffect(() => {
    setShowAllTasks(false);
  }, [projectId]);

  useEffect(() => {
    if (showAllTasks && tasks.length <= TASK_PREVIEW_LIMIT) {
      setShowAllTasks(false);
    }
  }, [showAllTasks, tasks]);

  const tasksListId = `today-hero-task-list-${projectId || "none"}`;
  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, TASK_PREVIEW_LIMIT);
  const shouldShowTaskToggle = tasks.length > TASK_PREVIEW_LIMIT;

  return (
    <div className="mt-[var(--space-4)] space-y-[var(--space-4)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const field = event.currentTarget.elements.namedItem(
            `new-task-${projectId}`,
          ) as HTMLInputElement | null;
          const value = field?.value ?? "";
          if (!value.trim()) return;
          const id = addTask(value, projectId);
          if (field) field.value = "";
          if (id) setSelectedTaskId(id);
        }}
      >
        <Input
          name={`new-task-${projectId}`}
          placeholder={`> task for "${projectName || "Project"}"`}
          aria-label="New task"
          className="w-full"
        />
      </form>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {tasks.length === 0 ? (
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
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-center gap-[var(--space-3)]">
                    <CheckCircle
                      checked={task.done}
                      onChange={() => {
                        toggleTask(task.id);
                        setSelectedTaskId(task.id);
                      }}
                      size="sm"
                    />
                    {isEditing ? (
                      <Input
                        name={`rename-task-${task.id}`}
                        autoFocus
                        value={editingTaskText}
                        onChange={(event) => setEditingTaskText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            renameTask(task.id, editingTaskText || task.title);
                            setEditingTaskId(null);
                          }
                          if (event.key === "Escape") setEditingTaskId(null);
                        }}
                        onBlur={() => {
                          renameTask(task.id, editingTaskText || task.title);
                          setEditingTaskId(null);
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
                          setEditingTaskText(task.title);
                          setEditingTaskId(task.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setEditingTaskText(task.title);
                            setEditingTaskId(task.id);
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
                        setEditingTaskText(task.title);
                        setEditingTaskId(task.id);
                        setSelectedTaskId(task.id);
                      }}
                      size="sm"
                      variant="ring"
                      iconSize="xs"
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      aria-label="Remove task"
                      title="Remove"
                      onClick={() => {
                        deleteTask(task.id);
                        setSelectedTaskId("");
                      }}
                      size="sm"
                      variant="ring"
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
                onClick={() => setShowAllTasks((prev) => !prev)}
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

