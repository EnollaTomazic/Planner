"use client";

import { useEffect, useState } from "react";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "./plannerStore";

const PROJECT_PREVIEW_LIMIT = 12;

type TodayProjectPanelProps = {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onClearSelection: () => void;
  addProject: (name: string) => string | undefined;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  toggleProject: (id: string) => void;
};

export default function TodayProjectPanel({
  projects,
  selectedProjectId,
  onSelectProject,
  onClearSelection,
  addProject,
  renameProject,
  deleteProject,
  toggleProject,
}: TodayProjectPanelProps) {
  const [projectName, setProjectName] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");

  useEffect(() => {
    if (showAllProjects && projects.length <= PROJECT_PREVIEW_LIMIT) {
      setShowAllProjects(false);
    }
  }, [projects, showAllProjects]);

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

  const projectsListId = "today-hero-project-list";
  const visibleProjects = showAllProjects
    ? projects
    : projects.slice(0, PROJECT_PREVIEW_LIMIT);
  const hiddenProjectsCount = Math.max(
    projects.length - visibleProjects.length,
    0,
  );
  const shouldShowProjectToggle = projects.length > PROJECT_PREVIEW_LIMIT;

  return (
    <div className="mt-[var(--space-4)] space-y-[var(--space-4)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const title = projectName.trim();
          if (!title) return;
          const id = addProject(title);
          setProjectName("");
          if (id) onSelectProject(id);
        }}
      >
        <Input
          name="new-project"
          placeholder="> new project…"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          aria-label="New project"
          className="w-full"
        />
      </form>

      {projects.length > 0 && (
        <>
          <ul
            id={projectsListId}
            className="space-y-[var(--space-2)]"
            role="list"
            aria-label="Projects"
          >
            {visibleProjects.map((project) => {
              const isEditing = editingProjectId === project.id;
              const isSelected = selectedProjectId === project.id;
              return (
                <li
                  key={project.id}
                  className={cn(
                    "group flex select-none items-center justify-between rounded-card r-card-lg border px-[var(--space-3)] py-[var(--space-2)] text-ui font-medium transition",
                    "border-border bg-card/55 hover:bg-card/70",
                    isSelected && "ring-1 ring-ring",
                  )}
                  onClick={() => !isEditing && onSelectProject(project.id)}
                  title={
                    isEditing
                      ? "Editing…"
                      : isSelected
                        ? "Selected"
                        : "Click to select"
                  }
                  role="listitem"
                >
                  {isEditing ? (
                    <Input
                      name={`rename-project-${project.id}`}
                      autoFocus
                      value={editingProjectName}
                      onChange={(event) =>
                        setEditingProjectName(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          renameProject(
                            project.id,
                            editingProjectName || project.name,
                          );
                          setEditingProjectId(null);
                        }
                        if (event.key === "Escape") setEditingProjectId(null);
                      }}
                      onBlur={() => {
                        renameProject(
                          project.id,
                          editingProjectName || project.name,
                        );
                        setEditingProjectId(null);
                      }}
                      aria-label={`Rename project ${project.name}`}
                      onClick={(event) => event.stopPropagation()}
                    />
                  ) : (
                    <div className="flex min-w-0 items-center gap-[var(--space-3)]">
                      <span
                        className="shrink-0"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <CheckCircle
                          size="sm"
                          checked={project.done}
                          onChange={() => toggleProject(project.id)}
                          aria-label={`Toggle completion for ${project.name}`}
                        />
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          project.done &&
                            "line-through-soft text-muted-foreground",
                        )}
                      >
                        {project.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-[var(--space-2)]">
                    <IconButton
                      aria-label={`Edit project ${project.name}`}
                      title="Edit"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingProjectId(project.id);
                        setEditingProjectName(project.name);
                      }}
                      size="sm"
                      variant="ring"
                      iconSize="xs"
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      aria-label={`Remove project ${project.name}`}
                      title="Remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteProject(project.id);
                        if (selectedProjectId === project.id) {
                          onClearSelection();
                        }
                      }}
                      size="sm"
                      variant="ring"
                      iconSize="xs"
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                </li>
              );
            })}
            {hiddenProjectsCount > 0 && (
              <li className="pr-[var(--space-1)] text-right text-label font-medium tracking-[0.02em] opacity-70">
                + {hiddenProjectsCount} more…
              </li>
            )}
          </ul>
          {shouldShowProjectToggle && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAllProjects((prev) => !prev)}
                aria-expanded={showAllProjects}
                aria-controls={projectsListId}
              >
                {showAllProjects ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

