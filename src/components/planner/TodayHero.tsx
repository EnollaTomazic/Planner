"use client";

/**
 * TodayHero — day-scoped. Single project selection shared via useSelectedProject/useSelectedTask.
 * - No default selection. Select via UI or when adding a project/task.
 * - Animated progress bar for the selected project's tasks.
 */

import { useEffect, useMemo } from "react";

import GlitchProgress from "@/components/ui/primitives/GlitchProgress";

import type { ISODate } from "./plannerTypes";
import TodayHeroHeader from "./TodayHeroHeader";
import TodayHeroProjects from "./TodayHeroProjects";
import TodayHeroTasks from "./TodayHeroTasks";
import { useDay } from "./useDay";
import { useFocusDate } from "./useFocusDate";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import { useTodayHeroProjects } from "./useTodayHeroProjects";
import { useTodayHeroTasks } from "./useTodayHeroTasks";

type Props = { iso?: ISODate };

export default function TodayHero({ iso }: Props) {
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
    const project = projects.find((p) => p.id === selProjectId);
    return project?.name ?? "";
  }, [projects, selProjectId]);

  useEffect(() => {
    if (selProjectId && !projects.some((p) => p.id === selProjectId)) {
      setSelProjectId("");
    }
  }, [projects, selProjectId, setSelProjectId]);

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

  const projectState = useTodayHeroProjects({
    projects,
    selectedProjectId: selProjectId,
    setSelectedProjectId: setSelProjectId,
    addProject,
    renameProject,
    deleteProject,
    toggleProject,
  });

  const taskState = useTodayHeroTasks({
    scopedTasks,
    projectId: selProjectId,
    projectName: selectedProjectName,
    addTask,
    renameTask,
    deleteTask,
    toggleTask,
    setSelectedTaskId: setSelTaskId,
  });

  return (
    <section className="bg-hero-soft rounded-card r-card-lg card-pad-lg anim-in">
      <TodayHeroHeader viewIso={viewIso} isToday={isToday} onChange={setIso} />

      <GlitchProgress
        current={done}
        total={total}
        showPercentage
        className="mb-[var(--space-4)] flex items-center gap-[var(--space-3)]"
        trackClassName="w-full"
        percentageClassName="glitch-percent w-[var(--space-7)] text-right text-ui font-medium"
      />

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
    </section>
  );
}
