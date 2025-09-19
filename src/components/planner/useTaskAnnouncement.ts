"use client";

import { useEffect, useRef, useState } from "react";
import type { DayTask } from "./plannerStore";

type TaskSnapshot = Pick<DayTask, "id" | "title" | "done">;

export function useTaskAnnouncement(
  tasks: TaskSnapshot[],
  projectId: string,
  projectName: string,
) {
  const [announcement, setAnnouncement] = useState("");
  const previousProjectIdRef = useRef<string | null>(null);
  const previousTasksRef = useRef<Map<string, TaskSnapshot>>(new Map());
  const toggleMarkerRef = useRef(false);

  useEffect(() => {
    if (!projectId) {
      previousProjectIdRef.current = null;
      previousTasksRef.current = new Map();
      toggleMarkerRef.current = false;
      setAnnouncement("");
      return;
    }

    const currentTasksMap = new Map<string, TaskSnapshot>(
      tasks.map((task) => [task.id, { id: task.id, title: task.title, done: task.done }]),
    );

    if (previousProjectIdRef.current !== projectId) {
      previousProjectIdRef.current = projectId;
      previousTasksRef.current = currentTasksMap;
      toggleMarkerRef.current = false;
      setAnnouncement("");
      return;
    }

    const previousTasksMap = previousTasksRef.current;
    let message: string | null = null;
    const projectSuffix = projectName ? ` in project "${projectName}"` : "";

    for (const [id, task] of currentTasksMap) {
      if (!previousTasksMap.has(id)) {
        message = `Task "${task.title}" added${projectSuffix}.`;
        break;
      }
    }

    if (!message) {
      for (const [id, previousTask] of previousTasksMap) {
        if (!currentTasksMap.has(id)) {
          message = `Task "${previousTask.title}" removed${projectSuffix}.`;
          break;
        }
      }
    }

    if (!message) {
      for (const [id, task] of currentTasksMap) {
        const previousTask = previousTasksMap.get(id);
        if (!previousTask) continue;

        if (previousTask.title !== task.title) {
          message = `Task "${previousTask.title}" renamed to "${task.title}"${projectSuffix}.`;
          break;
        }

        if (previousTask.done !== task.done) {
          message = task.done
            ? `Task "${task.title}" marked complete${projectSuffix}.`
            : `Task "${task.title}" marked incomplete${projectSuffix}.`;
          break;
        }
      }
    }

    if (message) {
      const marker = toggleMarkerRef.current ? "" : "\u200B";
      toggleMarkerRef.current = !toggleMarkerRef.current;
      setAnnouncement(`${message}${marker}`);
    }

    previousProjectIdRef.current = projectId;
    previousTasksRef.current = currentTasksMap;
  }, [projectId, projectName, tasks]);

  return announcement;
}

