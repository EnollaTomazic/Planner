"use client";

import * as React from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/primitives/Input";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { CheckCircle } from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyRow } from "./EmptyRow";
import { PlannerListPanel } from "./PlannerListPanel";
import type { Project } from "./plannerTypes";

const PROJECT_ROW_GUARD_SELECTOR = "[data-project-row-guard='true']";

type Props = {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  setSelectedTaskId: (id: string) => void;
  toggleProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  createProject: (name: string) => string | undefined;
};

export function ProjectList({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  setSelectedTaskId,
  toggleProject,
  renameProject,
  deleteProject,
  createProject,
}: Props) {
  const newProjectInputId = React.useId();
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(
    null,
  );
  const [editingProjectName, setEditingProjectName] = React.useState("");
  const [draftProject, setDraftProject] = React.useState("");
  const projectRefs = React.useRef<Map<string, HTMLDivElement | null>>(new Map());
  const projectsScrollable = projects.length > 3;
  const multiple = projects.length > 1;
  const projectListEmpty = projects.length === 0;

  const registerProjectRef = React.useCallback(
    (projectId: string, node: HTMLDivElement | null) => {
      if (node) {
        projectRefs.current.set(projectId, node);
      } else {
        projectRefs.current.delete(projectId);
      }
    },
    [],
  );

  const focusProjectRadio = React.useCallback((projectId: string) => {
    const node = projectRefs.current.get(projectId);
    node?.focus();
  }, []);

  const addProjectCommit = React.useCallback(() => {
    const id = createProject(draftProject);
    if (id) {
      setDraftProject("");
    }
  }, [createProject, draftProject]);

  const commitRename = React.useCallback(
    (projectId: string, fallbackName: string) => {
      const trimmed = editingProjectName.trim();
      const nextName = trimmed || fallbackName;
      renameProject(projectId, nextName);
      setEditingProjectName(nextName);
      setEditingProjectId(null);
    },
    [editingProjectName, renameProject, setEditingProjectId, setEditingProjectName],
  );

  React.useEffect(() => {
    if (!editingProjectId) return;
    const editingProject = projects.find((p) => p.id === editingProjectId);
    if (!editingProject) return;
    if (editingProject.disabled || editingProject.loading) {
      setEditingProjectId(null);
      setEditingProjectName(editingProject.name);
    }
  }, [editingProjectId, projects, setEditingProjectId, setEditingProjectName]);

  const onRowKey = React.useCallback(
    (idx: number, p: Project) => (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setSelectedProjectId(p.id);
      }
      if (multiple && (e.key === "ArrowDown" || e.key === "ArrowRight")) {
        e.preventDefault();
        const next = (idx + 1) % projects.length;
        const nextId = projects[next].id;
        setSelectedProjectId(nextId);
        focusProjectRadio(nextId);
      }
      if (multiple && (e.key === "ArrowUp" || e.key === "ArrowLeft")) {
        e.preventDefault();
        const prev = (idx - 1 + projects.length) % projects.length;
        const prevId = projects[prev].id;
        setSelectedProjectId(prevId);
        focusProjectRadio(prevId);
      }
    },
    [focusProjectRadio, multiple, projects, setSelectedProjectId],
  );

  return (
    <PlannerListPanel
      className="gap-[var(--space-2)]"
      renderComposer={() => (
        <form
          className="grid gap-[var(--space-2)]"
          onSubmit={(e) => {
            e.preventDefault();
            addProjectCommit();
          }}
        >
          <Label htmlFor={newProjectInputId} className="mb-0">
            New project
          </Label>
          <Input
            id={newProjectInputId}
            className="w-full"
            placeholder="> new project…"
            value={draftProject}
            onChange={(e) => setDraftProject(e.target.value)}
          />
        </form>
      )}
      isEmpty={projectListEmpty}
      renderEmpty={() => (
        <ul
          className="w-full space-y-[var(--space-2)]"
          aria-label="Projects"
        >
          <li className="w-full">
            <EmptyRow text="No projects yet." tone="muted" variant="rotate" />
          </li>
        </ul>
      )}
      renderList={() => (
        <ul
          className="w-full space-y-[var(--space-2)]"
          role="radiogroup"
          aria-label="Projects"
        >
          {projects.map((p, idx) => {
            const active = p.id === selectedProjectId;
            const isEditing = editingProjectId === p.id;
            const isDisabled = Boolean(p.disabled);
            const isLoading = Boolean(p.loading);
            const isRowInactive = isDisabled || isLoading;
            const blockInteraction = isRowInactive || isEditing;
            const handleRowKey = onRowKey(idx, p);
            const projectLabel = p.name.trim() || "Untitled project";
            return (
              <li key={p.id} className="w-full">
                <div
                  role="radio"
                  tabIndex={isRowInactive ? -1 : active ? 0 : -1}
                  aria-checked={active}
                  aria-label={projectLabel}
                  aria-disabled={isRowInactive || undefined}
                  data-disabled={isDisabled ? "true" : undefined}
                  data-loading={isLoading ? "true" : undefined}
                  ref={(node) => registerProjectRef(p.id, node)}
                  onKeyDown={blockInteraction ? undefined : handleRowKey}
                  onClick={(event) => {
                    if (
                      event.target instanceof Element &&
                      event.target.closest(PROJECT_ROW_GUARD_SELECTOR)
                    ) {
                      return;
                    }
                    if (blockInteraction || active) return;
                    setSelectedTaskId("");
                    setSelectedProjectId(p.id);
                  }}
                  className={cn(
                    "proj-card group relative [overflow:visible] w-full text-left rounded-card r-card-lg border pl-[var(--space-4)] pr-[var(--space-2)] py-[var(--space-2)]",
                    "bg-card/55 hover:bg-card/70 transition",
                    "grid min-h-[var(--space-7)] grid-cols-[auto,1fr,auto] items-center gap-[var(--space-4)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active && "proj-card--active ring-1 ring-ring",
                  )}
                >
                  <span
                    className="shrink-0"
                    data-project-row-guard="true"
                  >
                    <CheckCircle
                      checked={!!p.done}
                      onChange={() => toggleProject(p.id)}
                      disabled={isRowInactive}
                      aria-label={`Toggle ${projectLabel} complete`}
                      size="sm"
                    />
                  </span>

                  {isEditing ? (
                    <Input
                      name={`rename-project-${p.id}`}
                      autoFocus
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (isRowInactive) {
                            setEditingProjectId(null);
                            setEditingProjectName(p.name);
                            return;
                          }
                          commitRename(p.id, p.name);
                        }
                        if (e.key === "Escape") {
                          setEditingProjectId(null);
                          setEditingProjectName(p.name);
                        }
                      }}
                      onBlur={() => {
                        if (isRowInactive) {
                          setEditingProjectId(null);
                          setEditingProjectName(p.name);
                          return;
                        }
                        commitRename(p.id, p.name);
                      }}
                      disabled={isRowInactive}
                      aria-label={`Rename project ${p.name}`}
                      data-project-row-guard="true"
                    />
                  ) : (
                    <span className="proj-card__title truncate font-medium">
                      {p.name || "Untitled"}
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-[var(--space-2)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <IconButton
                      aria-label="Edit project"
                      title="Edit"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingProjectId(p.id);
                        setEditingProjectName(p.name);
                      }}
                      size="sm"
                      iconSize="xs"
                      variant="quiet"
                      disabled={isRowInactive}
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      aria-label="Delete project"
                      title="Delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const was = selectedProjectId === p.id;
                        deleteProject(p.id);
                        if (was) setSelectedProjectId("");
                      }}
                      size="sm"
                      iconSize="xs"
                      variant="quiet"
                      disabled={isRowInactive}
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      viewportClassName={cn(
        projectsScrollable ? undefined : "overflow-visible",
      )}
      viewportSize={projectsScrollable ? "maxHProjects" : undefined}
    />
  );
}
