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
import type { ISODate } from "./plannerStore";
import { useDay } from "./useDay";
import Input from "@/components/ui/primitives/Input";
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
    tasks,
    addTask,
    renameTask,
    toggleTask,
    deleteTask,
    doneTasks,
    totalTasks,
  } = useDay(iso);

  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [, setSelectedTaskId] = useSelectedTask(iso);

  const [draftProject, setDraftProject] = React.useState("");

  React.useEffect(() => {
    if (
      selectedProjectId &&
      !projects.some((p) => p.id === selectedProjectId)
    ) {
      setSelectedProjectId("");
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  function addProjectCommit() {
    const v = draftProject.trim();
    if (!v) return;
    const id = addProject(v);
    setDraftProject("");
    if (id) setSelectedProjectId(id);
  }

  return (
    <section
      className={cn(
        "daycard relative overflow-hidden card-neo-soft rounded-card r-card-lg border card-pad",
        "grid gap-4 lg:gap-6",
        "grid-cols-1 lg:grid-cols-[minmax(260px,320px)_1px_1fr]",
        isToday && "ring-1 ring-ring/65 title-glow",
        "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r",
        "before:from-transparent before:via-ring/45 before:to-transparent",
        "after:pointer-events-none after:absolute after:-inset-px after:[border-radius:var(--radius-card)] after:bg-[radial-gradient(60%_40%_at_100%_0%,hsl(var(--ring)/.12),transparent_60%)]",
      )}
      aria-label={`Planner for ${iso}`}
    >
      <DayCardHeader
        iso={iso}
        projectCount={projects.length}
        doneTasks={doneTasks}
        totalTasks={totalTasks}
      />

      <form
        className="col-span-1 lg:col-span-3"
        onSubmit={(e) => {
          e.preventDefault();
          addProjectCommit();
        }}
      >
        <Input
          className="w-full"
          placeholder="> new project…"
          value={draftProject}
          onChange={(e) => setDraftProject(e.target.value)}
          aria-label="Add project"
        />
      </form>

      <ProjectList
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        setSelectedTaskId={setSelectedTaskId}
        toggleProject={toggleProject}
        renameProject={renameProject}
        deleteProject={deleteProject}
      />

      <div
        className="hidden lg:block w-px bg-card-hairline/90 rounded-full self-stretch"
        aria-hidden
      />

      <TaskList
        tasks={tasks}
        selectedProjectId={selectedProjectId}
        addTask={addTask}
        renameTask={renameTask}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        setSelectedTaskId={setSelectedTaskId}
      />
    </section>
  );
}
