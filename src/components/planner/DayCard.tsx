"use client";

/**
 * DayCard — day row with single-select (project OR task) shared across app.
 * - Selecting a project clears task selection.
 * - Selecting a task auto-selects its project.
 * - Animated day-progress bar.
 */

import "./style.css";
import * as React from "react";

import { SectionCard } from "@/components/ui";
import { cn } from "@/lib/utils";
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
    <SectionCard
      className={cn(
        "daycard grid gap-[var(--space-4)] lg:gap-[var(--space-6)]",
        "grid-cols-1 lg:grid-cols-12",
        isToday && "ring-1 ring-ring/60",
      )}
      aria-label={`Planner for ${iso}`}
    >
      <SectionCard.Header className="col-span-full">
        <DayCardHeader
          iso={iso}
          projectCount={projects.length}
          doneCount={doneCount}
          totalCount={totalCount}
        />
      </SectionCard.Header>

      <SectionCard.Body className="col-span-full grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12 lg:gap-[var(--space-6)]">
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
        {selectedProjectId ? (
          <>
            <div
              className="hidden w-px self-stretch rounded-full bg-card-hairline-90 lg:col-span-1 lg:block"
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
          </>
        ) : null}

        <div className="col-span-full">
          <TaskReminderSettings task={selectedTask} onChange={handleReminderChange} />
        </div>
      </SectionCard.Body>
    </SectionCard>
  );
}
