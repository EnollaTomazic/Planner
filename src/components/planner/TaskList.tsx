"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import EmptyRow from "./EmptyRow";
import TaskRow from "./TaskRow";
import type { DayTask } from "./plannerStore";

type Props = {
  tasksById: Record<string, DayTask>;
  tasksByProject: Record<string, string[]>;
  selectedProjectId: string;
  addTask: (title: string, projectId?: string) => string | undefined;
  renameTask: (id: string, title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskImage: (id: string, url: string) => void;
  removeTaskImage: (id: string, url: string) => void;
  setSelectedTaskId: (id: string) => void;
};

export default function TaskList({
  tasksById,
  tasksByProject,
  selectedProjectId,
  addTask,
  renameTask,
  toggleTask,
  deleteTask,
  addTaskImage,
  removeTaskImage,
  setSelectedTaskId,
}: Props) {
  const [draftTask, setDraftTask] = React.useState("");
  const tasksForSelected = React.useMemo<DayTask[]>(() => {
    if (!selectedProjectId) return [];
    const ids = tasksByProject[selectedProjectId] ?? [];
    return ids
      .map((taskId) => tasksById[taskId])
      .filter((task): task is DayTask => Boolean(task));
  }, [selectedProjectId, tasksByProject, tasksById]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const v = draftTask.trim();
      if (!v || !selectedProjectId) return;
      const id = addTask(v, selectedProjectId);
      setDraftTask("");
      if (id) setSelectedTaskId(id);
    },
    [draftTask, selectedProjectId, addTask, setSelectedTaskId],
  );

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {selectedProjectId && (
        <form onSubmit={onSubmit}>
          <Input
            className="w-full"
            placeholder="> add task…"
            value={draftTask}
            onChange={(e) => setDraftTask(e.target.value)}
            aria-label="Add task"
          />
        </form>
      )}
      <div className="min-h-32 max-h-80 overflow-y-auto px-2 py-2">
        {!selectedProjectId ? (
          <EmptyRow text="Select a project to view tasks" />
        ) : tasksForSelected.length === 0 ? (
          <EmptyRow text="No tasks yet" />
        ) : (
          <ul
            className="space-y-2 [&>li:first-child]:mt-2 [&>li:last-child]:mb-2"
            aria-label="Tasks"
          >
            {tasksForSelected.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={() => {
                  toggleTask(t.id);
                  setSelectedTaskId(t.id);
                }}
                onDelete={() => {
                  deleteTask(t.id);
                  setSelectedTaskId("");
                }}
                onEdit={(title) => renameTask(t.id, title)}
                onSelect={() => setSelectedTaskId(t.id)}
                onAddImage={(url) => addTaskImage(t.id, url)}
                onRemoveImage={(url) => removeTaskImage(t.id, url)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
