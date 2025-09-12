"use client";

/**
 * TodayHero — day-scoped. Single project selection shared via useSelectedProject/useSelectedTask.
 * - No default selection. Select via UI or when adding a project/task.
 * - Animated progress bar for the selected project's tasks.
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toISODate } from "@/lib/date";
import { useFocusDate } from "./useFocusDate";
import { useSelectedProject, useSelectedTask } from "./useSelection";
import type { ISODate } from "./plannerStore";
import { useDay } from "./useDay";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Pencil, Trash2, Calendar } from "lucide-react";
import type React from "react";

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

  // Shared selection
  const [selProjectId, setSelProjectId] = useSelectedProject(viewIso);
  const [, setSelTaskId] = useSelectedTask(viewIso);

  // If selected project disappears, clear selection
  useEffect(() => {
    if (selProjectId && !projects.some((p) => p.id === selProjectId))
      setSelProjectId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, viewIso]);

  // Local edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [projectName, setProjectName] = useState("");

  // Progress of selected project only (animated)
  const scopedTasks = useMemo(
    () =>
      selProjectId ? tasks.filter((t) => t.projectId === selProjectId) : [],
    [tasks, selProjectId],
  );
  const { done, total } = useMemo(
    () =>
      tasks.reduce(
        (acc, t) => {
          if (t.projectId === selProjectId) {
            acc.total += 1;
            if (t.done) acc.done += 1;
          }
          return acc;
        },
        { done: 0, total: 0 },
      ),
    [tasks, selProjectId],
  );
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Date picker
  const dateRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const el = dateRef.current as DateInputWithPicker | null;
    if (el?.showPicker) el.showPicker();
    else dateRef.current?.focus();
  };

  return (
    <section className="bg-hero-soft rounded-card r-card-lg card-pad-lg anim-in">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2
            className="glitch text-lg font-semibold tracking-tight"
            data-text={isToday ? "Today" : viewIso}
          >
            {isToday ? "Today" : viewIso}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={dateRef}
            type="date"
            value={viewIso || nowISO}
            onChange={(e) => setIso(e.target.value)}
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
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn("glitch-track w-full", pct === 100 && "is-complete")}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div
            className="glitch-fill transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
          <div className="glitch-scan" />
        </div>
        <span
          className="glitch-percent w-12 text-right text-sm"
          aria-live="polite"
        >
          {pct}%
        </span>
      </div>

      {/* Projects */}
      <div className="mt-4 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const title = projectName.trim();
            if (!title) return;
            const id = addProject(title);
            setProjectName("");
            if (id) setSelProjectId(id);
          }}
        >
          <Input
            name="new-project"
            placeholder="> new project…"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            aria-label="New project"
            className="w-full"
          />
        </form>

        {projects.length > 0 && (
          <ul className="space-y-2" role="list" aria-label="Projects">
            {projects.slice(0, 12).map((p) => {
              const isEditing = editingProjectId === p.id;
              const isSelected = selProjectId === p.id;
              return (
                <li
                  key={p.id}
                  className={cn(
                    "group flex select-none items-center justify-between rounded-card r-card-lg border px-3 py-2 text-sm transition",
                    "border-border bg-card/55 hover:bg-card/70",
                    isSelected && "ring-1 ring-ring",
                  )}
                  onClick={() => !isEditing && setSelProjectId(p.id)}
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
                      name={`rename-project-${p.id}`}
                      autoFocus
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameProject(p.id, editingProjectName || p.name);
                          setEditingProjectId(null);
                        }
                        if (e.key === "Escape") setEditingProjectId(null);
                      }}
                      onBlur={() => {
                        renameProject(p.id, editingProjectName || p.name);
                        setEditingProjectId(null);
                      }}
                      aria-label={`Rename project ${p.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="shrink-0"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CheckCircle
                          size="sm"
                          checked={p.done}
                          onChange={() => toggleProject(p.id)}
                          aria-label={`Toggle completion for ${p.name}`}
                        />
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          p.done && "line-through-soft opacity-70",
                        )}
                      >
                        {p.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <IconButton
                      aria-label={`Edit project ${p.name}`}
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProjectId(p.id);
                        setEditingProjectName(p.name);
                      }}
                      size="sm"
                      variant="ring"
                      iconSize="xs"
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      aria-label={`Remove project ${p.name}`}
                      title="Remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p.id);
                        if (selProjectId === p.id) setSelProjectId("");
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
            {projects.length > 12 && (
              <li className="pr-1 text-right text-xs opacity-70">
                + {projects.length - 12} more…
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Tasks (only when a project is selected) */}
      {!selProjectId ? (
        <div className="mt-4 text-sm text-muted-foreground">
          Select a project to add and view tasks.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const el = e.currentTarget.elements.namedItem(
                `new-task-${selProjectId}`,
              ) as HTMLInputElement | null;
              const v = el?.value ?? "";
              if (!v.trim()) return;
              const id = addTask(v, selProjectId);
              if (el) el.value = "";
              if (id) setSelTaskId(id);
            }}
          >
            <Input
              name={`new-task-${selProjectId}`}
              placeholder={`> task for "${projects.find((p) => p.id === selProjectId)?.name ?? "Project"}"`}
              aria-label="New task"
              className="w-full"
            />
          </form>

          {scopedTasks.length === 0 ? (
            <div className="tasks-placeholder">No tasks yet.</div>
          ) : (
            <ul className="space-y-2" role="list" aria-label="Tasks">
              {scopedTasks.slice(0, 12).map((t) => {
                const isEditing = editingTaskId === t.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "task-tile flex items-center justify-between rounded-card r-card-lg border px-3 py-2",
                      "border-border bg-card/55 hover:bg-card/70",
                    )}
                    role="listitem"
                    onClick={() => setSelTaskId(t.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle
                        checked={t.done}
                        onChange={() => {
                          toggleTask(t.id);
                          setSelTaskId(t.id);
                        }}
                        size="sm"
                      />
                      {isEditing ? (
                        <Input
                          name={`rename-task-${t.id}`}
                          autoFocus
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              renameTask(t.id, editingTaskText || t.text);
                              setEditingTaskId(null);
                            }
                            if (e.key === "Escape") setEditingTaskId(null);
                          }}
                          onBlur={() => {
                            renameTask(t.id, editingTaskText || t.text);
                            setEditingTaskId(null);
                          }}
                          aria-label={`Rename task ${t.text}`}
                        />
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "task-tile__text",
                            t.done && "line-through-soft",
                          )}
                          onClick={() => setEditingTaskId(t.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setEditingTaskId(t.id);
                            }
                          }}
                          aria-label={`Edit task ${t.text}`}
                          title="Edit task"
                        >
                          {t.text}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <IconButton
                        aria-label={`Edit task ${t.text}`}
                        title="Edit"
                        onClick={() => {
                          setEditingTaskId(t.id);
                          setEditingTaskText(t.text);
                          setSelTaskId(t.id);
                        }}
                        size="sm"
                        variant="ring"
                        iconSize="xs"
                      >
                        <Pencil />
                      </IconButton>
                      <IconButton
                        aria-label="Remove task"
                        title="Remove"
                        onClick={() => {
                          deleteTask(t.id);
                          setSelTaskId("");
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
              {scopedTasks.length > 12 && (
                <li className="pr-1 text-right text-xs opacity-70">
                  + {scopedTasks.length - 12} more…
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
