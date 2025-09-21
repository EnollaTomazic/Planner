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
import type { ISODate } from "./plannerTypes";
import { useDay } from "./useDay";
import { cn } from "@/lib/utils";
import DayCardHeader from "./DayCardHeader";
import ProjectList from "./ProjectList";
import TaskList from "./TaskList";

type Props = { iso: ISODate; isToday?: boolean };

export default function DayCard({ iso, isToday }: Props) {
  const {
    projects,
    addProject,
    renameProject,
    deleteProject,
    toggleProject,
    tasksById,
    tasksByProject,
    addTask,
    renameTask,
    toggleTask,
    deleteTask,
    addTaskImage,
    removeTaskImage: removeTaskImageForDay,
    doneCount,
    totalCount,
  } = useDay(iso);

  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [, setSelectedTaskId] = useSelectedTask(iso);

  React.useEffect(() => {
    if (
      selectedProjectId &&
      !projects.some((p) => p.id === selectedProjectId)
    ) {
      setSelectedProjectId("");
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

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
          addProject={addProject}
        />
      </div>
      {selectedProjectId && (
        <>
          <div
            className="hidden lg:block lg:col-span-1 w-px mx-auto bg-card-hairline/90 rounded-full self-stretch"
            aria-hidden
          />

          <div className="col-span-1 lg:col-span-8">
            <TaskList
              tasksById={tasksById}
              tasksByProject={tasksByProject}
              selectedProjectId={selectedProjectId}
              addTask={addTask}
              renameTask={renameTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              addTaskImage={addTaskImage}
              removeTaskImage={(id, url, index) =>
                removeTaskImageForDay(id, url, index)
              }
              setSelectedTaskId={setSelectedTaskId}
            />
          </div>
        </>
      )}
    </section>
  );
}
