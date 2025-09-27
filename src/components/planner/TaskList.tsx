"use client";

import * as React from "react";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/primitives/Input";
import { Inbox, ListPlus } from "lucide-react";
import EmptyRow from "./EmptyRow";
import PlannerListPanel from "./PlannerListPanel";
import TaskRow from "./TaskRow";
import type { DayTask } from "./plannerTypes";

type Props = {
  tasksById: Record<string, DayTask>;
  tasksByProject: Record<string, string[]>;
  selectedProjectId: string;
  createTask: (title: string) => string | undefined;
  renameTask: (id: string, title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskImage: (id: string, url: string) => void;
  removeTaskImage: (id: string, url: string, index: number) => void;
  setSelectedTaskId: (id: string) => void;
};

export default function TaskList({
  tasksById,
  tasksByProject,
  selectedProjectId,
  createTask,
  renameTask,
  toggleTask,
  deleteTask,
  addTaskImage,
  removeTaskImage,
  setSelectedTaskId,
}: Props) {
  const [draftTask, setDraftTask] = React.useState("");
  const newTaskInputRef = React.useRef<HTMLInputElement | null>(null);
  const newTaskInputId = React.useId();
  const tasksForSelected = React.useMemo(
    () => {
      if (!selectedProjectId) return [] as DayTask[];
      const ids = tasksByProject[selectedProjectId] ?? [];
      return ids
        .map((taskId) => tasksById[taskId])
        .filter((task): task is DayTask => Boolean(task));
    },
    [selectedProjectId, tasksByProject, tasksById],
  );
  const hasSelectedProject = Boolean(selectedProjectId);
  const isEmpty = !hasSelectedProject || tasksForSelected.length === 0;

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const id = createTask(draftTask);
      if (id) {
        setDraftTask("");
      }
    },
    [createTask, draftTask],
  );

  return (
    <PlannerListPanel
      renderComposer={
        hasSelectedProject
          ? () => (
              <form onSubmit={onSubmit} className="grid gap-[var(--space-2)]">
                <Label htmlFor={newTaskInputId} className="mb-0">
                  New task
                </Label>
                <Input
                  id={newTaskInputId}
                  className="w-full"
                  placeholder="> add task…"
                  value={draftTask}
                  onChange={(e) => setDraftTask(e.target.value)}
                  ref={newTaskInputRef}
                />
              </form>
            )
          : undefined
      }
      isEmpty={isEmpty}
      renderEmpty={() => (
        <EmptyRow
          icon={hasSelectedProject ? <ListPlus /> : <Inbox />}
          heading={
            hasSelectedProject ? "No tasks yet" : "Choose a project to view tasks"
          }
          helperText={
            hasSelectedProject
              ? "Add tasks to break work into focused steps."
              : "Select a project from the list to see its tasks."
          }
          action={
            hasSelectedProject
              ? {
                  label: "Add a task",
                  onClick: () => {
                    newTaskInputRef.current?.focus();
                    newTaskInputRef.current?.select();
                  },
                }
              : undefined
          }
        />
      )}
      renderList={() => (
        <ul
          className="space-y-[var(--space-2)] [&>li:first-child]:mt-[var(--space-2)] [&>li:last-child]:mb-[var(--space-2)]"
          aria-label="Tasks"
        >
          {tasksForSelected.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              toggleTask={() => {
                toggleTask(t.id);
                setSelectedTaskId(t.id);
              }}
              deleteTask={() => {
                deleteTask(t.id);
                setSelectedTaskId("");
              }}
              renameTask={(title) => renameTask(t.id, title)}
              selectTask={() => setSelectedTaskId(t.id)}
              addImage={(url) => addTaskImage(t.id, url)}
              removeImage={(url, index) => removeTaskImage(t.id, url, index)}
            />
          ))}
        </ul>
      )}
      viewportClassName="min-h-[calc(var(--space-8)*2)] max-h-[calc(var(--space-8)*5)]"
    />
  );
}
