"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyRow from "./EmptyRow";
import type { Project } from "./plannerStore";

type Props = {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  setSelectedTaskId: (id: string) => void;
  toggleProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
};

export default function ProjectList({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  setSelectedTaskId,
  toggleProject,
  renameProject,
  deleteProject,
}: Props) {
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(
    null,
  );
  const [editingProjectName, setEditingProjectName] = React.useState("");
  const projectsScrollable = projects.length > 3;
  const multiple = projects.length > 1;

  const onRowKey = React.useCallback(
    (idx: number, p: Project) =>
      (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setSelectedProjectId(p.id);
        }
        if (multiple && (e.key === "ArrowDown" || e.key === "ArrowRight")) {
          e.preventDefault();
          const next = (idx + 1) % projects.length;
          setSelectedProjectId(projects[next].id);
        }
        if (multiple && (e.key === "ArrowUp" || e.key === "ArrowLeft")) {
          e.preventDefault();
          const prev = (idx - 1 + projects.length) % projects.length;
          setSelectedProjectId(projects[prev].id);
        }
      },
    [multiple, projects, setSelectedProjectId],
  );

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div
        className={cn(
          "mt-1 px-0 py-2 w-full",
          projectsScrollable
            ? "max-h-[260px] overflow-y-auto"
            : "overflow-visible",
        )}
      >
        {projects.length === 0 ? (
          <EmptyRow text="No projects yet." />
        ) : (
          <ul
            className="w-full space-y-2 [&>li:first-child]:mt-2 [&>li:last-child]:mb-2"
            role="radiogroup"
            aria-label="Projects"
          >
            {projects.map((p, idx) => {
              const active = p.id === selectedProjectId;
              const isEditing = editingProjectId === p.id;
              const handleRowKey = onRowKey(idx, p);
              return (
                <li key={p.id} className="w-full">
                  <div
                    role="radio"
                    tabIndex={0}
                    aria-checked={active}
                    aria-label={p.name || "Untitled project"}
                    onKeyDown={isEditing ? undefined : handleRowKey}
                    onClick={() => {
                      if (isEditing) return;
                      setSelectedProjectId(active ? "" : p.id);
                      if (active) setSelectedTaskId("");
                    }}
                    className={cn(
                      "proj-card group relative [overflow:visible] w-full text-left rounded-2xl border pl-4 pr-2 py-2",
                      "bg-card/55 hover:bg-card/70 transition",
                      "grid min-h-12 grid-cols-[auto,1fr,auto] items-center gap-4",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active &&
                        "proj-card--active ring-1 ring-ring",
                    )}
                  >
                    <span
                      className="shrink-0 ml-1"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CheckCircle
                        checked={!!p.done}
                        onChange={() => toggleProject(p.id)}
                        aria-label="Toggle project complete"
                        size="md"
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
                            renameProject(p.id, editingProjectName || p.name);
                            setEditingProjectId(null);
                          }
                          if (e.key === "Escape") {
                            setEditingProjectId(null);
                            setEditingProjectName(p.name);
                          }
                        }}
                        onBlur={() => {
                          renameProject(p.id, editingProjectName || p.name);
                          setEditingProjectId(null);
                        }}
                        aria-label={`Rename project ${p.name}`}
                      />
                    ) : (
                      <span className="proj-card__title truncate font-medium">
                        {p.name || "Untitled"}
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                        variant="ring"
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
                        variant="ring"
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
      </div>
    </div>
  );
}
