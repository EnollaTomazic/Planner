"use client";

import * as React from "react";
import { useDay } from "./useDay";
import { usePlannerActions } from "./usePlannerStore";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import type { ISODate, TaskReminder } from "./plannerTypes";
import type { DayCardActions, DayCardProps, DayCardSelection } from "./DayCard";

type UseDayCardControllerOptions = {
  iso: ISODate;
  isToday?: boolean;
};

export function useDayCardController({
  iso,
  isToday = false,
}: UseDayCardControllerOptions): DayCardProps {
  const {
    projects,
    tasks,
    tasksById,
    tasksByProject,
    renameProject,
    deleteProject,
    toggleProject,
    renameTask,
    toggleTask,
    deleteTask,
    addTaskImage,
    removeTaskImage,
    doneCount,
    totalCount,
    updateTaskReminder,
  } = useDay(iso);

  const { createProject, createTask } = usePlannerActions();
  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [selectedTaskId, setSelectedTaskId] = useSelectedTask(iso);

  const handleCreateProject = React.useCallback(
    (name: string) =>
      createProject({ iso, name, select: setSelectedProjectId }),
    [createProject, iso, setSelectedProjectId],
  );

  const handleCreateTask = React.useCallback(
    (title: string) => {
      if (!selectedProjectId) return undefined;
      return createTask({
        iso,
        projectId: selectedProjectId,
        title,
        select: setSelectedTaskId,
      });
    },
    [createTask, iso, selectedProjectId, setSelectedTaskId],
  );

  const handleRemoveTaskImage = React.useCallback(
    (id: string, url: string, index: number) => removeTaskImage(id, url, index),
    [removeTaskImage],
  );

  const handleUpdateTaskReminder = React.useCallback(
    (taskId: string, partial: Partial<TaskReminder> | null) =>
      updateTaskReminder(taskId, partial),
    [updateTaskReminder],
  );

  const selection: DayCardSelection = React.useMemo(
    () => ({
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      onProjectChange: setSelectedProjectId,
      onTaskChange: setSelectedTaskId,
    }),
    [selectedProjectId, selectedTaskId, setSelectedProjectId, setSelectedTaskId],
  );

  const actions: DayCardActions = React.useMemo(
    () => ({
      createProject: handleCreateProject,
      renameProject,
      deleteProject,
      toggleProject,
      createTask: handleCreateTask,
      renameTask,
      toggleTask,
      deleteTask,
      addTaskImage,
      removeTaskImage: handleRemoveTaskImage,
      updateTaskReminder: handleUpdateTaskReminder,
    }),
    [
      handleCreateProject,
      renameProject,
      deleteProject,
      toggleProject,
      handleCreateTask,
      renameTask,
      toggleTask,
      deleteTask,
      addTaskImage,
      handleRemoveTaskImage,
      handleUpdateTaskReminder,
    ],
  );

  return React.useMemo(
    () => ({
      day: { iso, isToday, doneCount, totalCount },
      date: new Date(iso),
      projects,
      tasks,
      tasksById,
      tasksByProject,
      selection,
      actions,
    }),
    [
      iso,
      isToday,
      doneCount,
      totalCount,
      projects,
      tasks,
      tasksById,
      tasksByProject,
      selection,
      actions,
    ],
  );
}
