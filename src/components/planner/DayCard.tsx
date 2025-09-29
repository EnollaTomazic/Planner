"use client";

/**
 * DayCard — day row with single-select (project OR task) shared across app.
 * - Selecting a project clears task selection.
 * - Selecting a task auto-selects its project.
 * - Animated day-progress bar.
 */

import "./style.css";
import * as React from "react";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import type { ISODate, TaskReminder } from "./plannerTypes";
import { useDay } from "./useDay";
import { cn } from "@/lib/utils";
import DayCardHeader from "./DayCardHeader";
import ProjectList from "./ProjectList";
import TaskList from "./TaskList";
import { usePlannerActions } from "./usePlannerStore";
import TaskReminderSettings from "./TaskReminderSettings";

type Props = { iso: ISODate; isToday?: boolean };

export default function DayCard({ iso, isToday }: Props) {
  const {
    projects,
    renameProject,
    deleteProject,
    toggleProject,
    tasksById,
    tasksByProject,
    renameTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    addTaskImage,
    removeTaskImage: removeTaskImageForDay,
    doneCount,
    totalCount,
    updateTaskReminder,
  } = useDay(iso);

  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [selectedTaskId, setSelectedTaskId] = useSelectedTask(iso);
  const { createProject, createTask } = usePlannerActions();

  const selectedTask = selectedTaskId ? tasksById[selectedTaskId] : undefined;

  const handleCreateProject = React.useCallback(
    (name: string) =>
      createProject({ iso, name, select: setSelectedProjectId }),
    [createProject, iso, setSelectedProjectId],
  );

  const handleCreateTask = React.useCallback(
    (title: string) =>
      createTask({
        iso,
        projectId: selectedProjectId,
        title,
        select: setSelectedTaskId,
      }),
    [createTask, iso, selectedProjectId, setSelectedTaskId],
  );

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
        "daycard relative overflow-hidden card-neo-soft rounded-card r-card-lg border card-pad",
        "grid gap-[var(--space-4)] lg:gap-[var(--space-6)]",
        "grid-cols-1 lg:grid-cols-12",
        isToday && "ring-1 ring-ring/65 title-glow",
        "before:pointer-events-none before:absolute before:inset-x-[var(--space-4)] before:top-0 before:h-px before:bg-gradient-to-r",
        "before:from-transparent before:via-ring/45 before:to-transparent",
        "after:pointer-events-none after:absolute after:-inset-px after:[border-radius:var(--radius-card)] after:bg-[radial-gradient(60%_40%_at_100%_0%,hsl(var(--ring)/.12),transparent_60%)]",
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
          setSelectedProjectId={setSelectedProjectId}
          setSelectedTaskId={setSelectedTaskId}
          toggleProject={toggleProject}
          renameProject={renameProject}
          deleteProject={deleteProject}
          createProject={handleCreateProject}
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
              createTask={handleCreateTask}
              renameTask={renameTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              reorderTasks={reorderTasks}
              addTaskImage={addTaskImage}
              removeTaskImage={(id, url, index) =>
                removeTaskImageForDay(id, url, index)
              }
              setSelectedTaskId={setSelectedTaskId}
            />
          </div>
        </React.Fragment>
      )}

      <div className="col-span-full">
        <TaskReminderSettings task={selectedTask} onChange={handleReminderChange} />
      </div>
    </section>
  );
}
