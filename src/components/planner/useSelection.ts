"use client";

import * as React from "react";
import { useSelection as usePlannerSelection, useDays } from "./plannerContext";
import type { ISODate, Selection } from "./plannerTypes";

type SelectionGetter = (selection: Selection | undefined) => string;
type SelectionProducer = (
  id: string,
  previous: Selection | undefined,
) => Selection;

type SelectionStrategy = {
  getCurrentId: SelectionGetter;
  produceSelection: SelectionProducer;
};

export function useSelectionState(
  iso: ISODate,
  { getCurrentId, produceSelection }: SelectionStrategy,
): readonly [string, (id: string) => void] {
  const { selected, setSelected } = usePlannerSelection();
  const current = getCurrentId(selected[iso]);

  const setId = React.useCallback(
    (id: string) => {
      setSelected((prev) => {
        const previousSelection = prev[iso];
        const nextSelection = produceSelection(id, previousSelection);

        if (
          previousSelection &&
          previousSelection.projectId === nextSelection.projectId &&
          previousSelection.taskId === nextSelection.taskId
        ) {
          return prev;
        }

        return {
          ...prev,
          [iso]: nextSelection,
        };
      });
    },
    [iso, produceSelection, setSelected],
  );

  return [current, setId] as const;
}

const getProjectId: SelectionGetter = (selection) =>
  selection?.projectId ?? "";

const produceProjectSelection: SelectionProducer = (projectId) =>
  projectId ? { projectId } : {};

/**
 * Manages the selected project for a given day.
 * Selecting a project clears any task selection.
 * @param iso - Day ISO string.
 * @returns Tuple of current project ID and setter.
 */
export function useSelectedProject(iso: ISODate) {
  return useSelectionState(iso, {
    getCurrentId: getProjectId,
    produceSelection: produceProjectSelection,
  });
}

const getTaskId: SelectionGetter = (selection) => selection?.taskId ?? "";

/**
 * Manages the selected task for a given day.
 * Selecting a task also tracks its parent project.
 * @param iso - Day ISO string.
 * @returns Tuple of current task ID and setter.
 */
export function useSelectedTask(iso: ISODate) {
  const { tasksById } = useDays();

  const produceTaskSelection = React.useCallback<SelectionProducer>(
    (taskId) => {
      if (!taskId) return {};
      const projectId = tasksById[iso]?.[taskId]?.projectId;
      return { taskId, projectId };
    },
    [iso, tasksById],
  );

  return useSelectionState(iso, {
    getCurrentId: getTaskId,
    produceSelection: produceTaskSelection,
  });
}
