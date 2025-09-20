"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/primitives/Button";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import type { Project } from "./plannerStore";

export type TodayHeroProjectsProps = {
  projects: Project[];
  selectedProjectId: string;
  projectsListId: string;
  projectName: string;
  editingProjectId: string | null;
  editingProjectName: string;
  showAllProjects: boolean;
  visibleProjects: Project[];
  hiddenProjectsCount: number;
  shouldShowProjectToggle: boolean;
  onProjectNameChange: (value: string) => void;
  onProjectFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onProjectSelect: (projectId: string) => void;
  onProjectToggle: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectEditOpen: (projectId: string, name: string) => void;
  onProjectRenameChange: (value: string) => void;
  onProjectRenameCommit: (projectId: string, fallbackName: string) => void;
  onProjectRenameCancel: () => void;
  onToggleShowAllProjects: () => void;
};

export default function TodayHeroProjects({
  projects,
  selectedProjectId,
  projectsListId,
  projectName,
  editingProjectId,
  editingProjectName,
  showAllProjects,
  visibleProjects,
  hiddenProjectsCount,
  shouldShowProjectToggle,
  onProjectNameChange,
  onProjectFormSubmit,
  onProjectSelect,
  onProjectToggle,
  onProjectDelete,
  onProjectEditOpen,
  onProjectRenameChange,
  onProjectRenameCommit,
  onProjectRenameCancel,
  onToggleShowAllProjects,
}: TodayHeroProjectsProps) {
  return (
    <div className="mt-[var(--space-4)] space-y-[var(--space-4)]">
      <form onSubmit={onProjectFormSubmit}>
        <Input
          name="new-project"
          placeholder="> new project…"
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
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
                <li key={project.id} role="presentation">
                  <div
                    className={cn(
                      "group flex select-none items-center justify-between rounded-card r-card-lg border px-[var(--space-3)] py-[var(--space-2)] text-ui font-medium transition",
                      "border-border bg-card/55 hover:bg-card/70 focus-visible:bg-card/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isSelected && "ring-1 ring-ring",
                    )}
                    tabIndex={0}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isEditing}
                    onClick={() => {
                      if (!isEditing) onProjectSelect(project.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (isEditing) return;
                      if (["Enter", " ", "Space", "Spacebar"].includes(event.key)) {
                        event.preventDefault();
                        onProjectSelect(project.id);
                      }
                    }}
                    title={
                      isEditing
                        ? "Editing…"
                        : isSelected
                          ? "Selected"
                          : "Click to select"
                    }
                  >
                    {isEditing ? (
                      <Input
                        name={`rename-project-${project.id}`}
                        autoFocus
                        value={editingProjectName}
                        onChange={(event) => onProjectRenameChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            onProjectRenameCommit(project.id, project.name);
                          }
                          if (event.key === "Escape") onProjectRenameCancel();
                        }}
                        onBlur={() => {
                          onProjectRenameCommit(project.id, project.name);
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
                            onChange={() => onProjectToggle(project.id)}
                            aria-label={`Toggle completion for ${project.name}`}
                          />
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            project.done && "line-through-soft text-muted-foreground",
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
                          onProjectEditOpen(project.id, project.name);
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
                          onProjectDelete(project.id);
                        }}
                        size="sm"
                        variant="ring"
                        iconSize="xs"
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
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
                onClick={onToggleShowAllProjects}
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
