"use client";

import * as React from "react";
import { ensureDay, useSelection, useDays, type ISODate } from "./plannerStore";

/**
 * Manages the selected project for a given day.
 * Selecting a project clears any task selection.
 * @param iso - Day ISO string.
 * @returns Tuple of current project ID and setter.
 */
export function useSelectedProject(iso: ISODate) {
  const { selected, setSelected } = useSelection();
  const current = selected[iso]?.projectId ?? "";
  const set = React.useCallback(
    (projectId: string) => {
      setSelected((prev) => ({
        ...prev,
        [iso]: projectId ? { projectId } : {},
      }));
    },
    [iso, setSelected],
  );
  return [current, set] as const;
}

/**
 * Manages the selected task for a given day.
 * Selecting a task also tracks its parent project.
 * @param iso - Day ISO string.
 * @returns Tuple of current task ID and setter.
 */
export function useSelectedTask(iso: ISODate) {
  const { selected, setSelected } = useSelection();
  const { days } = useDays();
  const current = selected[iso]?.taskId ?? "";

  const set = React.useCallback(
    (taskId: string) => {
      if (!taskId) {
        setSelected((prev) => ({ ...prev, [iso]: {} }));
        return;
      }
      const rec = ensureDay(days, iso);
      const projectId = rec.tasks.find((t) => t.id === taskId)?.projectId;
      setSelected((prev) => ({
        ...prev,
        [iso]: { taskId, projectId },
      }));
    },
    [iso, setSelected, days],
  );

  return [current, set] as const;
}
