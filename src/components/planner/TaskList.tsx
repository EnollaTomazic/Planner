"use client";

import * as React from "react";
import { Reorder } from "framer-motion";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/primitives/Input";
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
  reorderTasks: (projectId: string, orderedIds: string[]) => void;
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
  reorderTasks,
  addTaskImage,
  removeTaskImage,
  setSelectedTaskId,
}: Props) {
  const [draftTask, setDraftTask] = React.useState("");
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
  const taskIds = React.useMemo(
    () => tasksForSelected.map((task) => task.id),
    [tasksForSelected],
  );
  const taskIdsKey = React.useMemo(() => taskIds.join("|"), [taskIds]);
  const [orderedIds, setOrderedIds] = React.useState<string[]>(taskIds);
  const tasksInOrder = React.useMemo(() => {
    if (!orderedIds.length) return tasksForSelected;
    const inOrder = orderedIds
      .map((taskId) => tasksById[taskId])
      .filter((task): task is DayTask => Boolean(task));
    if (inOrder.length === tasksForSelected.length) {
      return inOrder;
    }
    const missing = tasksForSelected.filter(
      (task) => !orderedIds.includes(task.id),
    );
    return [...inOrder, ...missing];
  }, [orderedIds, tasksById, tasksForSelected]);
  const hasSelectedProject = Boolean(selectedProjectId);
  const isEmpty = !hasSelectedProject || tasksInOrder.length === 0;

  React.useEffect(() => {
    setOrderedIds((prev) => {
      if (prev.length === taskIds.length) {
        let matched = true;
        for (let index = 0; index < taskIds.length; index += 1) {
          if (prev[index] !== taskIds[index]) {
            matched = false;
            break;
          }
        }
        if (matched) {
          return prev;
        }
      }
      return taskIds;
    });
  }, [taskIdsKey, taskIds]);

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

  const handleReorder = React.useCallback(
    (next: string[]) => {
      if (!selectedProjectId) return;
      setOrderedIds(next);
      reorderTasks(selectedProjectId, next);
    },
    [reorderTasks, selectedProjectId],
  );

  const moveTask = React.useCallback(
    (taskId: string, direction: "up" | "down") => {
      if (!selectedProjectId) return;
      setOrderedIds((prev) => {
        const current = prev.length ? [...prev] : [...taskIds];
        const index = current.indexOf(taskId);
        if (index < 0) return prev;
        const targetIndex =
          direction === "up"
            ? Math.max(0, index - 1)
            : Math.min(current.length - 1, index + 1);
        if (index === targetIndex) return prev;
        current.splice(index, 1);
        current.splice(targetIndex, 0, taskId);
        reorderTasks(selectedProjectId, current);
        return current;
      });
    },
    [reorderTasks, selectedProjectId, taskIds],
  );

  const handleSwipe = React.useCallback(
    (taskId: string, direction: "left" | "right") => {
      if (direction === "right") {
        toggleTask(taskId);
        setSelectedTaskId(taskId);
        return;
      }

      deleteTask(taskId);
      setOrderedIds((prev) => prev.filter((id) => id !== taskId));
      setSelectedTaskId("");
    },
    [deleteTask, setSelectedTaskId, toggleTask],
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
                />
              </form>
            )
          : undefined
      }
      isEmpty={isEmpty}
      renderEmpty={() => (
        <EmptyRow
          text={hasSelectedProject ? "No tasks yet" : "Select a project to view tasks"}
          tone={hasSelectedProject ? "default" : "muted"}
          variant={hasSelectedProject ? "rotate" : "default"}
        />
      )}
      renderList={() => (
        <Reorder.Group
          className="space-y-[var(--space-2)]"
          aria-label="Tasks"
          axis="y"
          values={orderedIds}
          onReorder={handleReorder}
          role="list"
        >
          {tasksInOrder.map((t) => (
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
              onReorder={(direction) => moveTask(t.id, direction)}
              onSwipe={(direction) => handleSwipe(t.id, direction)}
              renameTask={(title) => renameTask(t.id, title)}
              selectTask={() => setSelectedTaskId(t.id)}
              addImage={(url) => addTaskImage(t.id, url)}
              removeImage={(url, index) => removeTaskImage(t.id, url, index)}
            />
          ))}
        </Reorder.Group>
      )}
      viewportSize={["minHTasks", "maxHTasks"]}
    />
  );
}
