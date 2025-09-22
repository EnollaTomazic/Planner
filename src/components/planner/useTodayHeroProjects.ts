"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import type { ISODate, Project } from "./plannerTypes";
import { usePlannerActions } from "./usePlannerStore";

const PROJECT_PREVIEW_LIMIT = 12;

type UseTodayHeroProjectsParams = {
  iso: ISODate;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (projectId: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  toggleProject: (id: string) => void;
};

type UseTodayHeroProjectsResult = {
  projectsListId: string;
  projectName: string;
  editingProjectId: string | null;
  editingProjectName: string;
  showAllProjects: boolean;
  visibleProjects: Project[];
  hiddenProjectsCount: number;
  shouldShowProjectToggle: boolean;
  handleProjectNameChange: (value: string) => void;
  handleProjectFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleProjectSelect: (projectId: string) => void;
  handleProjectToggle: (projectId: string) => void;
  handleProjectDelete: (projectId: string) => void;
  openProjectEditor: (projectId: string, name: string) => void;
  handleProjectRenameChange: (value: string) => void;
  commitProjectRename: (projectId: string, fallbackName: string) => void;
  cancelProjectRename: () => void;
  toggleShowAllProjects: () => void;
};

export function useTodayHeroProjects({
  iso,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  renameProject,
  deleteProject,
  toggleProject,
}: UseTodayHeroProjectsParams): UseTodayHeroProjectsResult {
  const [projectName, setProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);

  const { createProject } = usePlannerActions();

  const projectsListId = "today-hero-project-list";

  const visibleProjects = useMemo(
    () =>
      showAllProjects
        ? projects
        : projects.slice(0, PROJECT_PREVIEW_LIMIT),
    [projects, showAllProjects],
  );

  const hiddenProjectsCount = useMemo(
    () => Math.max(projects.length - visibleProjects.length, 0),
    [projects.length, visibleProjects.length],
  );

  const shouldShowProjectToggle = projects.length > PROJECT_PREVIEW_LIMIT;

  const handleProjectNameChange = useCallback((value: string) => {
    setProjectName(value);
  }, []);

  const handleProjectFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const id = createProject({
        iso,
        name: projectName,
        select: setSelectedProjectId,
      });
      if (id) {
        setProjectName("");
      }
    },
    [createProject, iso, projectName, setSelectedProjectId],
  );

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
    },
    [setSelectedProjectId],
  );

  const handleProjectToggle = useCallback(
    (projectId: string) => {
      toggleProject(projectId);
    },
    [toggleProject],
  );

  const handleProjectDelete = useCallback(
    (projectId: string) => {
      deleteProject(projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId("");
      }
      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setEditingProjectName("");
      }
    },
    [deleteProject, editingProjectId, selectedProjectId, setSelectedProjectId],
  );

  const openProjectEditor = useCallback((projectId: string, name: string) => {
    setEditingProjectId(projectId);
    setEditingProjectName(name);
  }, []);

  const handleProjectRenameChange = useCallback((value: string) => {
    setEditingProjectName(value);
  }, []);

  const commitProjectRename = useCallback(
    (projectId: string, fallbackName: string) => {
      const nextName = editingProjectName.trim() || fallbackName;
      renameProject(projectId, nextName);
      setEditingProjectId(null);
    },
    [editingProjectName, renameProject],
  );

  const cancelProjectRename = useCallback(() => {
    setEditingProjectId(null);
  }, []);

  const toggleShowAllProjects = useCallback(() => {
    setShowAllProjects((prev) => !prev);
  }, []);

  useEffect(() => {
    if (showAllProjects && projects.length <= PROJECT_PREVIEW_LIMIT) {
      setShowAllProjects(false);
    }
  }, [projects.length, showAllProjects]);

  useEffect(() => {
    if (!selectedProjectId || showAllProjects) return;
    if (projects.length <= PROJECT_PREVIEW_LIMIT) return;

    const isSelectedVisible = projects
      .slice(0, PROJECT_PREVIEW_LIMIT)
      .some((project) => project.id === selectedProjectId);

    if (!isSelectedVisible) {
      setShowAllProjects(true);
    }
  }, [projects, selectedProjectId, showAllProjects]);

  useEffect(() => {
    if (!editingProjectId) return;
    const stillExists = projects.some((project) => project.id === editingProjectId);
    if (!stillExists) {
      setEditingProjectId(null);
      setEditingProjectName("");
    }
  }, [editingProjectId, projects]);

  return {
    projectsListId,
    projectName,
    editingProjectId,
    editingProjectName,
    showAllProjects,
    visibleProjects,
    hiddenProjectsCount,
    shouldShowProjectToggle,
    handleProjectNameChange,
    handleProjectFormSubmit,
    handleProjectSelect,
    handleProjectToggle,
    handleProjectDelete,
    openProjectEditor,
    handleProjectRenameChange,
    commitProjectRename,
    cancelProjectRename,
    toggleShowAllProjects,
  };
}
