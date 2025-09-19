"use client";

/**
 * TodayHero — day-scoped. Single project selection shared via useSelectedProject/useSelectedTask.
 * - No default selection. Select via UI or when adding a project/task.
 * - Animated progress bar for the selected project's tasks.
 */

import { useMemo, useRef, useEffect } from "react";
import { toISODate } from "@/lib/date";
import { useFocusDate } from "./useFocusDate";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import type { ISODate } from "./plannerStore";
import { useDay } from "./useDay";
import IconButton from "@/components/ui/primitives/IconButton";
import GlitchProgress from "@/components/ui/primitives/GlitchProgress";
import { Calendar } from "lucide-react";
import TodayProjectPanel from "./TodayProjectPanel";
import TodayTaskPanel from "./TodayTaskPanel";

type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };
type Props = { iso?: ISODate };

export default function TodayHero({ iso }: Props) {
  const nowISO = useMemo(() => toISODate(), []);
  const { iso: isoActive, setIso, today } = useFocusDate();
  const viewIso = iso ?? isoActive;
  const isToday = viewIso === today;

  useEffect(() => {
    if (iso && iso !== isoActive) setIso(iso);
  }, [iso, isoActive, setIso]);

  const {
    projects,
    tasks,
    addTask,
    renameTask,
    toggleTask,
    deleteTask,
    addProject,
    renameProject,
    deleteProject,
    toggleProject,
  } = useDay(viewIso);

  const [selProjectId, setSelProjectId] = useSelectedProject(viewIso);
  const [, setSelTaskId] = useSelectedTask(viewIso);

  const selectedProjectName = useMemo(() => {
    const project = projects.find((candidate) => candidate.id === selProjectId);
    return project?.name ?? "";
  }, [projects, selProjectId]);

  useEffect(() => {
    if (selProjectId && !projects.some((project) => project.id === selProjectId)) {
      setSelProjectId("");
    }
  }, [projects, selProjectId, setSelProjectId]);

  const scopedTasks = useMemo(
    () => (selProjectId ? tasks.filter((task) => task.projectId === selProjectId) : []),
    [tasks, selProjectId],
  );

  const { done, total } = useMemo(
    () =>
      scopedTasks.reduce(
        (accumulator, task) => {
          accumulator.total += 1;
          if (task.done) accumulator.done += 1;
          return accumulator;
        },
        { done: 0, total: 0 },
      ),
    [scopedTasks],
  );

  const dateRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const el = dateRef.current as DateInputWithPicker | null;
    if (el?.showPicker) el.showPicker();
    else dateRef.current?.focus();
  };

  return (
    <section className="bg-hero-soft rounded-card r-card-lg card-pad-lg anim-in">
      {/* Header */}
      <div className="mb-[var(--space-4)] flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <h2
            className="glitch text-title font-semibold tracking-[-0.01em]"
            data-text={isToday ? "Today" : viewIso}
          >
            {isToday ? "Today" : viewIso}
          </h2>
        </div>

        <div className="flex items-center gap-[var(--space-2)]">
          <input
            ref={dateRef}
            type="date"
            value={viewIso || nowISO}
            onChange={(event) => setIso(event.target.value)}
            aria-label="Change focused date"
            className="sr-only"
          />
          <IconButton
            aria-label="Open calendar"
            title={viewIso}
            onClick={openPicker}
            size="md"
            variant="ring"
            iconSize="md"
          >
            <Calendar />
          </IconButton>
        </div>
      </div>

      {/* Animated Progress of selected project */}
      <GlitchProgress
        current={done}
        total={total}
        showPercentage
        className="mb-[var(--space-4)] flex items-center gap-[var(--space-3)]"
        trackClassName="w-full"
        percentageClassName="glitch-percent w-[var(--space-7)] text-right text-ui font-medium"
      />

      {/* Projects */}
      <TodayProjectPanel
        projects={projects}
        selectedProjectId={selProjectId}
        onSelectProject={setSelProjectId}
        onClearSelection={() => setSelProjectId("")}
        addProject={addProject}
        renameProject={renameProject}
        deleteProject={deleteProject}
        toggleProject={toggleProject}
      />

      {/* Tasks (only when a project is selected) */}
      {!selProjectId ? (
        <div className="mt-[var(--space-4)] text-ui font-medium text-muted-foreground">
          Select a project to add and view tasks.
        </div>
      ) : (
        <TodayTaskPanel
          projectId={selProjectId}
          projectName={selectedProjectName}
          tasks={scopedTasks}
          addTask={addTask}
          renameTask={renameTask}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          setSelectedTaskId={setSelTaskId}
        />
      )}
    </section>
  );
}
