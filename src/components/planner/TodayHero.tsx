"use client";

/**
 * TodayHero — day-scoped. Single project selection shared via useSelectedProject/useSelectedTask.
 * - No default selection. Select via UI or when adding a project/task.
 * - Animated progress bar for the selected project's tasks.
 */

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { GlitchProgress, Hero } from "@/components/ui";
import { SectionCard } from "@/components/ui/layout/SectionCard";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { toISODate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

import type { ISODate } from "./plannerTypes";
import { TodayHeroProjects } from "./TodayHeroProjects";
import { TodayHeroTasks } from "./TodayHeroTasks";
import { useDay } from "./useDay";
import { useFocusDate } from "./useFocusDate";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import { useTodayHeroProjects } from "./useTodayHeroProjects";
import { useTodayHeroTasks } from "./useTodayHeroTasks";

type Props = { iso?: ISODate };

export function TodayHero({ iso }: Props) {
  const { iso: isoActive, setIso, today } = useFocusDate();
  const viewIso = iso ?? isoActive;
  const isToday = viewIso === today;
  const fallbackIso = useMemo(() => toISODate(), []);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (iso && iso !== isoActive) setIso(iso);
  }, [iso, isoActive, setIso]);

  const openPicker = useCallback(() => {
    const el = dateRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (el?.showPicker) {
      el.showPicker();
      return;
    }
    dateRef.current?.focus();
  }, []);

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIso(event.target.value as ISODate);
    },
    [setIso],
  );

  const heroTitle = isToday ? "Today" : viewIso;
  const inputValue = viewIso || fallbackIso;

  const {
    projects,
    tasks,
    renameTask,
    toggleTask,
    deleteTask,
    renameProject,
    deleteProject,
    toggleProject,
  } = useDay(viewIso);

  const [selProjectId, setSelProjectId] = useSelectedProject(viewIso);
  const [, setSelTaskId] = useSelectedTask(viewIso);

  const selectedProjectName = useMemo(() => {
    const project = projects.find((p) => p.id === selProjectId);
    return project?.name ?? "";
  }, [projects, selProjectId]);

  const scopedTasks = useMemo(
    () => (selProjectId ? tasks.filter((t) => t.projectId === selProjectId) : []),
    [tasks, selProjectId],
  );

  const { done, total } = useMemo<{ done: number; total: number }>(
    () =>
      scopedTasks.reduce<{ done: number; total: number }>(
        (acc, task) => {
          acc.total += 1;
          if (task.done) acc.done += 1;
          return acc;
        },
        { done: 0, total: 0 },
      ),
    [scopedTasks],
  );

  const heroProgressLabel = selectedProjectName
    ? `Tasks completed for ${selectedProjectName}`
    : "Tasks completed";
  const percentComplete = total === 0 ? 0 : Math.round((done / total) * 100);

  const heroActions = (
    <div className="flex items-center gap-[var(--space-2)]">
      <input
        ref={dateRef}
        type="date"
        value={inputValue}
        onChange={handleDateChange}
        aria-label="Change focused date"
        className="sr-only"
      />
      <IconButton
        aria-label="Open calendar"
        title={viewIso}
        onClick={openPicker}
        size="md"
        variant="quiet"
        iconSize="md"
      >
        <Calendar />
      </IconButton>
    </div>
  );

  const projectState = useTodayHeroProjects({
    iso: viewIso,
    projects,
    selectedProjectId: selProjectId,
    setSelectedProjectId: setSelProjectId,
    renameProject,
    deleteProject,
    toggleProject,
  });

  const taskState = useTodayHeroTasks({
    iso: viewIso,
    scopedTasks,
    projectId: selProjectId,
    projectName: selectedProjectName,
    renameTask,
    deleteTask,
    toggleTask,
    setSelectedTaskId: setSelTaskId,
  });

  return (
    <SectionCard
      variant="plain"
      className="bg-hero-soft card-pad-lg anim-in rounded-[var(--radius-lg)]"
    >
      <Hero
        title={
          <span
            className="glitch text-title font-semibold tracking-[-0.01em]"
            data-text={heroTitle}
          >
            {heroTitle}
          </span>
        }
        actions={heroActions}
        sticky={false}
        frame={false}
        padding="none"
        className="mb-[var(--space-4)]"
        barClassName="gap-[var(--space-3)]"
      />

      <div className="mb-[var(--space-4)] flex items-center gap-[var(--space-4)]">
        <GlitchProgress
          value={done}
          max={total}
          size="lg"
          aria-label={heroProgressLabel}
        />
        <div className="flex flex-1 items-baseline justify-between gap-[var(--space-3)]">
          <span className="min-w-[var(--space-9)] text-right font-semibold tabular-nums text-title">
            {percentComplete}%
          </span>
          <span className="text-label text-muted-foreground">
            <span className="tabular-nums">{done}</span>
            {" / "}
            <span className="tabular-nums">{total}</span> tasks
          </span>
        </div>
      </div>

      <TodayHeroProjects
        projects={projects}
        selectedProjectId={selProjectId}
        projectsListId={projectState.projectsListId}
        projectName={projectState.projectName}
        editingProjectId={projectState.editingProjectId}
        editingProjectName={projectState.editingProjectName}
        showAllProjects={projectState.showAllProjects}
        visibleProjects={projectState.visibleProjects}
        hiddenProjectsCount={projectState.hiddenProjectsCount}
        shouldShowProjectToggle={projectState.shouldShowProjectToggle}
        onProjectNameChange={projectState.handleProjectNameChange}
        onProjectFormSubmit={projectState.handleProjectFormSubmit}
        onProjectSelect={projectState.handleProjectSelect}
        onProjectToggle={projectState.handleProjectToggle}
        onProjectDelete={projectState.handleProjectDelete}
        onProjectEditOpen={projectState.openProjectEditor}
        onProjectRenameChange={projectState.handleProjectRenameChange}
        onProjectRenameCommit={projectState.commitProjectRename}
        onProjectRenameCancel={projectState.cancelProjectRename}
        onToggleShowAllProjects={projectState.toggleShowAllProjects}
      />

      <TodayHeroTasks
        projectId={selProjectId}
        projectName={selectedProjectName}
        tasksListId={taskState.tasksListId}
        taskInputName={taskState.taskInputName}
        visibleTasks={taskState.visibleTasks}
        totalTaskCount={taskState.totalTaskCount}
        showAllTasks={taskState.showAllTasks}
        shouldShowTaskToggle={taskState.shouldShowTaskToggle}
        editingTaskId={taskState.editingTaskId}
        editingTaskText={taskState.editingTaskText}
        taskAnnouncementText={taskState.taskAnnouncementText}
        onTaskFormSubmit={taskState.handleTaskFormSubmit}
        onTaskSelect={taskState.handleTaskSelect}
        onTaskToggle={taskState.handleTaskToggle}
        onTaskDelete={taskState.handleTaskDelete}
        onTaskEditOpen={taskState.openTaskEditor}
        onTaskRenameChange={taskState.handleTaskRenameChange}
        onTaskRenameCommit={taskState.commitTaskRename}
        onTaskRenameCancel={taskState.cancelTaskRename}
        onToggleShowAllTasks={taskState.toggleShowAllTasks}
      />
    </SectionCard>
  );
}
