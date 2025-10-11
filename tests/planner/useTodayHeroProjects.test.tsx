import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import type { FormEvent, ReactNode } from "react";

import { useTodayHeroProjects, type Project } from "@/components/planner";

vi.mock("@/components/planner/usePlannerStore", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/planner/usePlannerStore")
  >("@/components/planner/usePlannerStore");

  let projectCounter = 0;
  let taskCounter = 0;

  type PlannerActions = ReturnType<typeof actual.usePlannerActions>;

  const actions: PlannerActions = {
    createProject: ({ iso, name, select }) => {
      if (!iso) return undefined;
      const trimmed = name.trim();
      if (!trimmed) return undefined;
      const id = `proj-${(projectCounter += 1).toString().padStart(2, "0")}`;
      select?.(id);
      return id;
    },
    createTask: ({ iso, projectId, title, select }) => {
      if (!iso || !projectId) return undefined;
      const trimmed = title.trim();
      if (!trimmed) return undefined;
      const id = `task-${(taskCounter += 1).toString().padStart(2, "0")}`;
      select?.(id);
      return id;
    },
  } satisfies PlannerActions;

  return {
    ...actual,
    usePlannerActions: () => actions,
  };
});

const PREVIEW_LIMIT = 12;

type HookProps = Parameters<typeof useTodayHeroProjects>[0];

type Callbacks = {
  setSelectedProjectId: ReturnType<typeof vi.fn<(id: string) => void>>;
  renameProject: ReturnType<
    typeof vi.fn<(id: string, name: string) => void>
  >;
  deleteProject: ReturnType<typeof vi.fn<(id: string) => void>>;
  toggleProject: ReturnType<typeof vi.fn<(id: string) => void>>;
};

function createCallbacks(): Callbacks {
  return {
    setSelectedProjectId: vi.fn<(id: string) => void>(),
    renameProject: vi.fn<(id: string, name: string) => void>(),
    deleteProject: vi.fn<(id: string) => void>(),
    toggleProject: vi.fn<(id: string) => void>(),
  };
}

function createProject(index: number, overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${index}`,
    name: `Project ${index}`,
    done: false,
    createdAt: index,
    ...overrides,
  };
}

function createProjects(count: number): Project[] {
  return Array.from({ length: count }, (_, index) => createProject(index + 1));
}

const iso = "2024-05-01";

const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

describe("useTodayHeroProjects", () => {
  it("manages preview and expanded project lists", async () => {
    const projects = createProjects(15);
    const callbacks = createCallbacks();
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: "",
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result, rerender } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    expect(result.current.showAllProjects).toBe(false);
    expect(result.current.visibleProjects).toEqual(projects.slice(0, PREVIEW_LIMIT));
    expect(result.current.hiddenProjectsCount).toBe(projects.length - PREVIEW_LIMIT);
    expect(result.current.shouldShowProjectToggle).toBe(true);

    act(() => {
      result.current.toggleShowAllProjects();
    });

    expect(result.current.showAllProjects).toBe(true);
    expect(result.current.visibleProjects).toEqual(projects);
    expect(result.current.hiddenProjectsCount).toBe(0);

    act(() => {
      result.current.toggleShowAllProjects();
    });

    expect(result.current.showAllProjects).toBe(false);

    act(() => {
      result.current.toggleShowAllProjects();
    });

    expect(result.current.showAllProjects).toBe(true);

    const shorter = projects.slice(0, 8);
    act(() => {
      rerender({
        ...initialProps,
        projects: shorter,
      });
    });

    await waitFor(() => {
      expect(result.current.showAllProjects).toBe(false);
    });

    expect(result.current.visibleProjects).toEqual(shorter);
    expect(result.current.hiddenProjectsCount).toBe(0);
    expect(result.current.shouldShowProjectToggle).toBe(false);
  });

  it("selects new projects on create and resets local input", () => {
    const callbacks = createCallbacks();

    const initialProps: HookProps = {
      iso,
      projects: [],
      selectedProjectId: "",
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.handleProjectNameChange("  Launch Plan  ");
    });

    expect(result.current.projectName).toBe("  Launch Plan  ");

    const preventDefault = vi.fn();
    const submitEvent = { preventDefault } as unknown as FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleProjectFormSubmit(submitEvent);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(callbacks.setSelectedProjectId).toHaveBeenCalledWith(
      expect.stringMatching(/^proj/),
    );
    expect(result.current.projectName).toBe("");

    act(() => {
      result.current.handleProjectFormSubmit(submitEvent);
    });

    expect(callbacks.setSelectedProjectId).toHaveBeenCalledTimes(1);
  });

  it("clears selection and editors when deleting the active project", () => {
    const projects = createProjects(2);
    const callbacks = createCallbacks();
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: projects[0].id,
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.openProjectEditor(projects[0].id, projects[0].name);
    });

    expect(result.current.editingProjectId).toBe(projects[0].id);
    expect(result.current.editingProjectName).toBe(projects[0].name);

    act(() => {
      result.current.handleProjectDelete(projects[0].id);
    });

    expect(callbacks.deleteProject).toHaveBeenCalledWith(projects[0].id);
    expect(callbacks.setSelectedProjectId).toHaveBeenCalledWith("");
    expect(result.current.editingProjectId).toBeNull();
    expect(result.current.editingProjectName).toBe("");
  });

  it("closes orphaned editors when projects are removed externally", async () => {
    const projects = createProjects(3);
    const callbacks = createCallbacks();
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: "",
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result, rerender } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.openProjectEditor(projects[2].id, projects[2].name);
    });

    expect(result.current.editingProjectId).toBe(projects[2].id);
    expect(result.current.editingProjectName).toBe(projects[2].name);

    act(() => {
      rerender({
        ...initialProps,
        projects: projects.slice(0, 2),
      });
    });

    await waitFor(() => {
      expect(result.current.editingProjectId).toBeNull();
    });

    expect(result.current.editingProjectName).toBe("");
  });

  it("commits rename changes and falls back to the previous name when blank", () => {
    const projects = createProjects(4);
    const callbacks = createCallbacks();
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: "",
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.openProjectEditor(projects[1].id, projects[1].name);
    });

    act(() => {
      result.current.handleProjectRenameChange("  Updated Name  ");
    });

    act(() => {
      result.current.commitProjectRename(projects[1].id, projects[1].name);
    });

    expect(callbacks.renameProject).toHaveBeenCalledWith(
      projects[1].id,
      "Updated Name",
    );
    expect(result.current.editingProjectId).toBeNull();

    act(() => {
      result.current.openProjectEditor(projects[1].id, projects[1].name);
    });

    act(() => {
      result.current.handleProjectRenameChange("   ");
    });

    act(() => {
      result.current.commitProjectRename(projects[1].id, projects[1].name);
    });

    expect(callbacks.renameProject).toHaveBeenLastCalledWith(
      projects[1].id,
      projects[1].name,
    );
  });

  it("exposes callback helpers for selection and toggling", () => {
    const projects = createProjects(2);
    const callbacks = createCallbacks();
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: "",
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.handleProjectSelect(projects[0].id);
    });

    expect(callbacks.setSelectedProjectId).toHaveBeenCalledWith(projects[0].id);

    act(() => {
      result.current.handleProjectToggle(projects[0].id);
    });

    expect(callbacks.toggleProject).toHaveBeenCalledWith(projects[0].id);
  });

  it("ensures selected projects beyond the preview toggle expansion", async () => {
    const projects = createProjects(15);
    const callbacks = createCallbacks();
    const selected = projects[13].id;
    const initialProps: HookProps = {
      iso,
      projects,
      selectedProjectId: selected,
      setSelectedProjectId: callbacks.setSelectedProjectId,
      renameProject: callbacks.renameProject,
      deleteProject: callbacks.deleteProject,
      toggleProject: callbacks.toggleProject,
    };

    const { result } = renderHook(
      (props: HookProps) => useTodayHeroProjects(props),
      { initialProps, wrapper },
    );

    await waitFor(() => {
      expect(result.current.showAllProjects).toBe(true);
    });

    expect(result.current.visibleProjects).toEqual(projects);
    expect(result.current.hiddenProjectsCount).toBe(0);
  });
});
