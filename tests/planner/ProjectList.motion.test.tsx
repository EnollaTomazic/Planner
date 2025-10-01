import * as React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import ProjectList from "@/components/planner/ProjectList";
import type { Project } from "@/components/planner/plannerTypes";

const baseProject: Project = {
  id: "alpha",
  name: "Alpha",
  done: false,
  createdAt: Date.now(),
};

const selectProject: (value: string) => void = () => {};
const selectTask: (value: string) => void = () => {};
const toggleProject: (value: string) => void = () => {};
const renameProject: (id: string, name: string) => void = () => {};
const deleteProject: (value: string) => void = () => {};
const createProject = vi.fn<(name: string) => string | undefined>(() => undefined);

function renderActiveProjectList() {
  render(
    <ProjectList
      projects={[baseProject]}
      selectedProjectId="alpha"
      setSelectedProjectId={selectProject}
      setSelectedTaskId={selectTask}
      toggleProject={toggleProject}
      renameProject={renameProject}
      deleteProject={deleteProject}
      createProject={createProject}
    />,
  );
}

describe("ProjectList motion preferences", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") && query.includes("reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    createProject.mockClear();
  });

  it("disables the active project sheen animation when motion is reduced", () => {
    renderActiveProjectList();

    const activeCard = screen.getByRole("radio", { name: /alpha/i });
    const sheenStyles = window.getComputedStyle(activeCard, "::after");

    expect(["", "none"]).toContain(sheenStyles.animationName);
    expect(["", "0s", "0ms"]).toContain(sheenStyles.animationDuration);
  });
});
