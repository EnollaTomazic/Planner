"use client";

/**
 * DayCard — day row with single-select (project OR task) shared across app.
 * - Selecting a project clears task selection.
 * - Selecting a task auto-selects its project.
 * - Animated day-progress bar.
 */

import "./style.css";
import * as React from "react";
import { cn } from "@/lib/utils";
import { NoiseOverlay } from "@/components/ui/patterns/NoiseOverlay";
import { DayCardHeader } from "./DayCardHeader";
import { ProjectList } from "./ProjectList";
import { TaskList } from "./TaskList";
import { TaskReminderSettings } from "./TaskReminderSettings";
import type {
  DayTask,
  ISODate,
  Project,
  TaskReminder,
} from "./plannerTypes";

export type DayCardSelection = {
  projectId: string;
  taskId: string;
  onProjectChange: (id: string) => void;
  onTaskChange: (id: string) => void;
};

export type DayCardActions = {
  createProject: (name: string) => string | undefined;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  toggleProject: (id: string) => void;
  createTask: (title: string) => string | undefined;
  renameTask: (id: string, title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskImage: (id: string, url: string) => void;
  removeTaskImage: (id: string, url: string, index: number) => void;
  updateTaskReminder: (id: string, partial: Partial<TaskReminder> | null) => void;
};

export type DayCardDay = {
  iso: ISODate;
  isToday?: boolean;
  doneCount: number;
  totalCount: number;
};

export type DayCardProps = {
  day: DayCardDay;
  date: Date;
  projects: Project[];
  tasks: DayTask[];
  tasksById: Record<string, DayTask>;
  tasksByProject: Record<string, string[]>;
  selection: DayCardSelection;
  actions: DayCardActions;
};

export function DayCard({
  day,
  projects,
  tasks,
  tasksById,
  tasksByProject,
  selection,
  actions,
}: DayCardProps) {
  const { iso, isToday, doneCount, totalCount } = day;
  const {
    projectId: selectedProjectId,
    taskId: selectedTaskId,
    onProjectChange,
    onTaskChange,
  } = selection;
  const {
    createProject,
    renameProject,
    deleteProject,
    toggleProject,
    createTask,
    renameTask,
    toggleTask,
    deleteTask,
    addTaskImage,
    removeTaskImage,
    updateTaskReminder,
  } = actions;

  const selectedTask = React.useMemo(() => {
    if (!selectedTaskId) return undefined;
    return (
      tasksById[selectedTaskId] ??
      tasks.find((candidate) => candidate.id === selectedTaskId)
    );
  }, [selectedTaskId, tasksById, tasks]);

  const handleReminderChange = React.useCallback(
    (partial: Partial<TaskReminder> | null) => {
      if (!selectedTaskId) return;
      updateTaskReminder(selectedTaskId, partial);
    },
    [selectedTaskId, updateTaskReminder],
  );

  return (
    <section
      className={cn(
        "daycard relative isolate overflow-hidden rounded-card r-card-lg border border-card-hairline/60 bg-panel/65 card-pad",
        "shadow-neo-soft",
        "grid gap-[var(--space-4)] lg:gap-[var(--space-6)]",
        "grid-cols-1 lg:grid-cols-12",
        isToday && "ring-1 ring-ring/60",
      )}
      aria-label={`Planner for ${iso}`}
    >
      <div className="col-span-1 lg:col-span-12">
        <DayCardHeader
          iso={iso}
          projectCount={projects.length}
          doneCount={doneCount}
          totalCount={totalCount}
        />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={onProjectChange}
          setSelectedTaskId={onTaskChange}
          toggleProject={toggleProject}
          renameProject={renameProject}
          deleteProject={deleteProject}
          createProject={createProject}
        />
      </div>
      {selectedProjectId && (
        <React.Fragment>
          <div
            className="hidden lg:block lg:col-span-1 w-px mx-auto bg-card-hairline-90 rounded-full self-stretch"
            aria-hidden
          />

          <div className="col-span-1 lg:col-span-8">
            <TaskList
              tasksById={tasksById}
              tasksByProject={tasksByProject}
              selectedProjectId={selectedProjectId}
              selectedTaskId={selectedTaskId}
              createTask={createTask}
              renameTask={renameTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              addTaskImage={addTaskImage}
              removeTaskImage={removeTaskImage}
              setSelectedTaskId={onTaskChange}
            />
          </div>
        </React.Fragment>
      )}

      <div className="col-span-full">
        <TaskReminderSettings task={selectedTask} onChange={handleReminderChange} />
      </div>
      <NoiseOverlay level="subtle" />
    </section>
  );
}
