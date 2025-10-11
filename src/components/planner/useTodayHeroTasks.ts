"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { DayTask, ISODate } from "./plannerTypes";
import { usePlannerActions } from "./usePlannerStore";

type TodayHeroTaskAnnouncement = {
  text: string;
  toggleMarker: boolean;
};

type UseTodayHeroTasksParams = {
  iso: ISODate;
  scopedTasks: DayTask[];
  projectId: string;
  projectName: string;
  renameTask: (taskId: string, title: string) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  setSelectedTaskId: (taskId: string) => void;
};

type UseTodayHeroTasksResult = {
  tasksListId: string;
  taskInputName: string;
  visibleTasks: DayTask[];
  totalTaskCount: number;
  showAllTasks: boolean;
  shouldShowTaskToggle: boolean;
  editingTaskId: string | null;
  editingTaskText: string;
  taskAnnouncementText: string;
  handleTaskFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleTaskSelect: (taskId: string) => void;
  handleTaskToggle: (taskId: string) => void;
  handleTaskDelete: (taskId: string) => void;
  openTaskEditor: (taskId: string, title: string, options?: { select?: boolean }) => void;
  handleTaskRenameChange: (value: string) => void;
  commitTaskRename: (taskId: string, fallbackTitle: string) => void;
  cancelTaskRename: () => void;
  toggleShowAllTasks: () => void;
};

const TASK_PREVIEW_LIMIT = 12;

export function useTodayHeroTasks({
  iso,
  scopedTasks,
  projectId,
  projectName,
  renameTask,
  deleteTask,
  toggleTask,
  setSelectedTaskId,
}: UseTodayHeroTasksParams): UseTodayHeroTasksResult {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [taskAnnouncement, setTaskAnnouncement] = useState<TodayHeroTaskAnnouncement>({
    text: "",
    toggleMarker: false,
  });
  const { createTask } = usePlannerActions();

  const prevProjectIdRef = useRef<string | null>(null);
  const prevTasksRef = useRef<Map<string, { title: string; done: boolean }>>(
    new Map(),
  );

  const tasksListId = useMemo(
    () => `today-hero-task-list-${projectId || "none"}`,
    [projectId],
  );

  const taskInputName = useMemo(
    () => `new-task-${projectId || "none"}`,
    [projectId],
  );

  const totalTaskCount = scopedTasks.length;

  const visibleTasks = useMemo(
    () =>
      showAllTasks
        ? scopedTasks
        : scopedTasks.slice(0, TASK_PREVIEW_LIMIT),
    [scopedTasks, showAllTasks],
  );

  const shouldShowTaskToggle = totalTaskCount > TASK_PREVIEW_LIMIT;

  const handleTaskFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!projectId) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const input = event.currentTarget.elements.namedItem(
        taskInputName,
      ) as HTMLInputElement | null;

      const rawValue = input?.value ?? "";
      const trimmedValue = rawValue.trim();

      if (!trimmedValue) {
        if (input) input.value = "";
        return;
      }

      const id = createTask({
        iso,
        projectId,
        title: trimmedValue,
        select: setSelectedTaskId,
      });

      if (id && input) {
        input.value = "";
      }
    },
    [createTask, iso, projectId, setSelectedTaskId, taskInputName],
  );

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
    },
    [setSelectedTaskId],
  );

  const handleTaskToggle = useCallback(
    (taskId: string) => {
      toggleTask(taskId);
      setSelectedTaskId(taskId);
    },
    [setSelectedTaskId, toggleTask],
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      deleteTask(taskId);
      setSelectedTaskId("");
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setEditingTaskText("");
      }
    },
    [deleteTask, editingTaskId, setSelectedTaskId],
  );

  const openTaskEditor = useCallback(
    (taskId: string, title: string, options?: { select?: boolean }) => {
      setEditingTaskText(title);
      setEditingTaskId(taskId);
      if (options?.select) setSelectedTaskId(taskId);
    },
    [setSelectedTaskId],
  );

  const handleTaskRenameChange = useCallback((value: string) => {
    setEditingTaskText(value);
  }, []);

  const commitTaskRename = useCallback(
    (taskId: string, fallbackTitle: string) => {
      const nextTitle = editingTaskText.trim() || fallbackTitle;
      renameTask(taskId, nextTitle);
      setEditingTaskId(null);
    },
    [editingTaskText, renameTask],
  );

  const cancelTaskRename = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const toggleShowAllTasks = useCallback(() => {
    setShowAllTasks((prev) => !prev);
  }, []);

  useEffect(() => {
    setShowAllTasks(false);
  }, [projectId]);

  useEffect(() => {
    if (showAllTasks && totalTaskCount <= TASK_PREVIEW_LIMIT) {
      setShowAllTasks(false);
    }
  }, [showAllTasks, totalTaskCount]);

  useEffect(() => {
    if (editingTaskId && !scopedTasks.some((task) => task.id === editingTaskId)) {
      setEditingTaskId(null);
      setEditingTaskText("");
    }
  }, [editingTaskId, scopedTasks]);

  useEffect(() => {
    if (!projectId) {
      prevProjectIdRef.current = null;
      prevTasksRef.current = new Map();
      setTaskAnnouncement((prev) =>
        prev.text ? { text: "", toggleMarker: prev.toggleMarker } : prev,
      );
      return;
    }

    const currentTasksMap = new Map<string, { title: string; done: boolean }>(
      scopedTasks.map((task) => [task.id, { title: task.title, done: task.done }]),
    );

    if (prevProjectIdRef.current !== projectId) {
      prevProjectIdRef.current = projectId;
      prevTasksRef.current = currentTasksMap;
      setTaskAnnouncement((prev) =>
        prev.text ? { text: "", toggleMarker: prev.toggleMarker } : prev,
      );
      return;
    }

    const prevTasksMap = prevTasksRef.current;
    let message: string | null = null;
    const projectSuffix = projectName ? ` in project "${projectName}"` : "";

    for (const [id, task] of currentTasksMap) {
      if (!prevTasksMap.has(id)) {
        message = `Task "${task.title}" added${projectSuffix}.`;
        break;
      }
    }

    if (!message) {
      for (const [id, prevTask] of prevTasksMap) {
        if (!currentTasksMap.has(id)) {
          message = `Task "${prevTask.title}" removed${projectSuffix}.`;
          break;
        }
      }
    }

    if (!message) {
      for (const [id, task] of currentTasksMap) {
        const prevTask = prevTasksMap.get(id);
        if (!prevTask) continue;

        if (prevTask.title !== task.title) {
          message = `Task "${prevTask.title}" renamed to "${task.title}"${projectSuffix}.`;
          break;
        }

        if (prevTask.done !== task.done) {
          message = task.done
            ? `Task "${task.title}" marked complete${projectSuffix}.`
            : `Task "${task.title}" marked incomplete${projectSuffix}.`;
          break;
        }
      }
    }

    if (message) {
      setTaskAnnouncement((prev) => ({
        text: `${message}${prev.toggleMarker ? "" : "\u200B"}`,
        toggleMarker: !prev.toggleMarker,
      }));
    }

    prevTasksRef.current = currentTasksMap;
  }, [projectId, projectName, scopedTasks]);

  return {
    tasksListId,
    taskInputName,
    visibleTasks,
    totalTaskCount,
    showAllTasks,
    shouldShowTaskToggle,
    editingTaskId,
    editingTaskText,
    taskAnnouncementText: taskAnnouncement.text,
    handleTaskFormSubmit,
    handleTaskSelect,
    handleTaskToggle,
    handleTaskDelete,
    openTaskEditor,
    handleTaskRenameChange,
    commitTaskRename,
    cancelTaskRename,
    toggleShowAllTasks,
  };
}

