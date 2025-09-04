"use client";

/**
 * DayCard — day row with single-select (project OR task) shared across app.
 * - Selecting a project clears task selection.
 * - Selecting a task auto-selects its project.
 * - Animated day-progress bar.
 */

import "./style.css";
import * as React from "react";
import { useDay, useSelectedProject, useSelectedTask, type ISODate } from "./usePlanner";
import Input from "@/components/ui/primitives/input";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { cn } from "@/lib/utils";
import { Trash2, Pencil } from "lucide-react";

type Props = { iso: ISODate; isToday?: boolean };

export default function DayCard({ iso, isToday }: Props) {
  const {
    projects, addProject, renameProject, deleteProject, toggleProject,
    tasks, addTask, renameTask, toggleTask, deleteTask,
    doneTasks, totalTasks,
  } = useDay(iso);

  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [, setSelectedTaskId] = useSelectedTask(iso);

  const [draftProject, setDraftProject] = React.useState("");
  const [draftTask, setDraftTask] = React.useState("");
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = React.useState("");
  const projectInputRef = React.useRef<HTMLInputElement>(null);
  const taskInputRef = React.useRef<HTMLInputElement>(null);

  // If the selected project goes away, clear selection
  React.useEffect(() => {
    if (selectedProjectId && !projects.some(p => p.id === selectedProjectId)) {
      setSelectedProjectId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // Header text + progress
  const date = React.useMemo(() => new Date(`${iso}T00:00:00`), [iso]);
  const WD = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"] as const;
  const MM = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] as const;
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  const headerText = `// ${WD[date.getDay()]}_${MM[date.getMonth()]} :: ${dd(date)}`;
  const pctNum = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const tasksForSelected = React.useMemo(
    () => tasks.filter(t => t.projectId === selectedProjectId),
    [tasks, selectedProjectId]
  );

  function addProjectCommit() {
    const v = draftProject.trim(); if (!v) return;
    const id = addProject(v);
    setDraftProject("");
    if (id) setSelectedProjectId(id); // select the new project
  }
  function addTaskCommit() {
    const v = draftTask.trim(); if (!v || !selectedProjectId) return;
    const id = addTask(v, selectedProjectId);
    setDraftTask("");
    if (id) setSelectedTaskId(id);
  }

  const projectsScrollable = projects.length > 3;

  return (
    <section
      className={cn(
        "daycard relative rounded-2xl border p-4",
        "grid gap-6",
        "grid-cols-1 lg:grid-cols-[340px_1px_1fr]",
        isToday && "ring-1 ring-[hsl(var(--ring)/0.65)]"
      )}
      aria-label={`Planner for ${iso}`}
    >
      {/* Header */}
      <div className="col-span-1 lg:col-span-3 flex items-center gap-4 min-w-0">
        <span className="text-sm font-semibold shrink-0">{headerText}</span>

        <div className="flex-1 h-1.5 rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pctNum}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pctNum}%` }} />
        </div>

        <div className="shrink-0 flex items-baseline gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums font-medium text-foreground">{pctNum}%</span>
          <span className="hidden sm:inline">·</span>
          <span className="whitespace-nowrap"><span className="tabular-nums">{projects.length}</span> projects</span>
          <span className="hidden sm:inline">·</span>
          <span className="whitespace-nowrap"><span className="tabular-nums">{doneTasks}</span> / <span className="tabular-nums">{totalTasks}</span> tasks</span>
        </div>
      </div>

      {/* Add project */}
      <form
        className="col-span-1 lg:col-span-3"
        onSubmit={e => { e.preventDefault(); addProjectCommit(); }}
      >
        <Input
          ref={projectInputRef}
          className="task-input w-full"
          placeholder="> new project…"
          value={draftProject}
          onChange={e => setDraftProject(e.target.value)}
          aria-label="Add project"
        />
      </form>

      {/* Left: projects */}
      <div className="flex flex-col gap-3 min-w-0">
        <div className={cn("mt-1 px-0 py-2 w-full", projectsScrollable ? "max-h-[260px] overflow-y-auto" : "overflow-visible")}>
          {projects.length === 0 ? (
            <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
              No projects yet.
              <div className="mt-2">
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs"
                  onClick={() => projectInputRef.current?.focus()}
                >
                  Add project
                </button>
              </div>
            </div>
          ) : (
            <ul className="w-full space-y-2 [&>li:first-child]:mt-1.5 [&>li:last-child]:mb-1.5" role="radiogroup" aria-label="Projects">
              {projects.map((p, idx) => {
                const active = p.id === selectedProjectId;

                const onRowKey = (e: React.KeyboardEvent) => {
                  if (e.key === " " || e.key === "Enter") { e.preventDefault(); setSelectedProjectId(p.id); }
                  if (projects.length > 1 && (e.key === "ArrowDown" || e.key === "ArrowRight")) { e.preventDefault(); const next = (idx + 1) % projects.length; setSelectedProjectId(projects[next].id); }
                  if (projects.length > 1 && (e.key === "ArrowUp" || e.key === "ArrowLeft")) { e.preventDefault(); const prev = (idx - 1 + projects.length) % projects.length; setSelectedProjectId(projects[prev].id); }
                };

                const isEditing = editingProjectId === p.id;
                return (
                  <li key={p.id} className="w-full">
                    <div
                      role="radio"
                      tabIndex={0}
                      aria-checked={active}
                      aria-label={p.name || "Untitled project"}
                      onKeyDown={e => { if (!isEditing) onRowKey(e); }}
                      onClick={() => {
                        if (isEditing) return;
                        setSelectedProjectId(active ? "" : p.id);
                        if (active) setSelectedTaskId("");
                      }}
                      className={cn(
                        "proj-card group relative [overflow:visible] w-full text-left rounded-2xl border pl-5 pr-3 py-2.5",
                        "bg-[hsl(var(--card)/0.55)] hover:bg-[hsl(var(--card)/0.7)] transition",
                        "grid min-h-[44px] grid-cols-[auto,1fr,auto] items-center gap-4",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                        active && "proj-card--active ring-1 ring-[hsl(var(--ring))]"
                      )}
                    >
                      <span className="shrink-0 ml-0.5" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <CheckCircle checked={!!p.done} onChange={() => toggleProject(p.id)} aria-label="Toggle project complete" size="md" />
                      </span>

                      {isEditing ? (
                        <Input
                          className="h-8 text-sm"
                          autoFocus
                          value={editingProjectName}
                          onChange={e => setEditingProjectName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") { renameProject(p.id, editingProjectName || p.name); setEditingProjectId(null); }
                            if (e.key === "Escape") { setEditingProjectId(null); setEditingProjectName(p.name); }
                          }}
                          onBlur={() => { renameProject(p.id, editingProjectName || p.name); setEditingProjectId(null); }}
                          aria-label={`Rename project ${p.name}`}
                        />
                      ) : (
                        <span className="proj-card__title truncate font-medium">{p.name || "Untitled"}</span>
                      )}

                      <div className="ml-auto flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <IconButton
                          aria-label="Edit project"
                          title="Edit"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingProjectId(p.id); setEditingProjectName(p.name); }}
                          circleSize="sm"
                          iconSize="xs"
                          variant="ring"
                        >
                          <Pencil />
                        </IconButton>
                        <IconButton
                          aria-label="Delete project" title="Delete"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); const was = selectedProjectId === p.id; deleteProject(p.id); if (was) setSelectedProjectId(""); }}
                          circleSize="sm" iconSize="xs" variant="ring"
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

      {/* Divider */}
      <div className="hidden lg:block w-px bg-[hsl(var(--card-hairline)/0.9)]/90 rounded-full self-stretch" aria-hidden />

      {/* Right: tasks */}
      <div className="flex flex-col gap-3 min-w-0">
        {selectedProjectId && (
          <Input
            ref={taskInputRef}
            className="task-input w-full"
            placeholder="> add task…"
            value={draftTask}
            onChange={e => setDraftTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTaskCommit()}
            aria-label="Add task"
          />
        )}
        <div className="min-h-[120px] max-h-[320px] overflow-y-auto px-2 py-2">
          {!selectedProjectId ? (
            <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
              No task selected.
              <div className="mt-2">
                <button type="button" className="rounded-md border px-2 py-1 text-xs">Select project</button>
              </div>
            </div>
          ) : tasksForSelected.length === 0 ? (
            <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
              No tasks yet.
              <div className="mt-2">
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs"
                  onClick={() => taskInputRef.current?.focus()}
                >
                  Add task
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2 [&>li:first-child]:mt-1.5 [&>li:last-child]:mb-1.5" aria-label="Tasks">
              {tasksForSelected.map(t => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => { toggleTask(t.id); setSelectedTaskId(t.id); }}
                  onDelete={() => { deleteTask(t.id); setSelectedTaskId(""); }}
                  onEdit={text => renameTask(t.id, text)}
                  onSelect={() => setSelectedTaskId(t.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function TaskRow({
  task, onToggle, onDelete, onEdit, onSelect,
}: {
  task: { id: string; text: string; done: boolean; projectId?: string };
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  onSelect: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(task.text);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function start() { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }
  function commit() { const v = text.trim(); setEditing(false); if (v && v !== task.text) onEdit(v); }
  function cancel() { setEditing(false); setText(task.text); }

  return (
    <li className="group">
      <div
        className={cn(
          "relative [overflow:visible] grid min-h-[44px] min-w-0 grid-cols-[auto,1fr,auto] items-center gap-4 rounded-2xl border pl-5 pr-3 py-2.5",
          "bg-[hsl(var(--card)/0.55)] hover:bg-[hsl(var(--card)/0.7)]",
          "focus-within:ring-2 focus-within:ring-[hsl(var(--ring))]"
        )}
        onClick={onSelect}
      >
        <div className="shrink-0 ml-0.5">
          <CheckCircle checked={task.done} onChange={() => !editing && onToggle()} aria-label="Toggle task done" size="md" />
        </div>

        <div className="flex-1 min-w-0 px-1">
          {!editing ? (
            <button
              className="task-tile__text block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-md"
              onClick={onToggle}
              onDoubleClick={start}
              aria-pressed={task.done}
              title="Click to toggle; double-click to edit"
            >
              <span className={cn("truncate break-words", task.done && "line-through-soft")}>{task.text}</span>
            </button>
          ) : (
            <Input
              className="planner-input"
              name={`dc-rename-task-${task.id}`}
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
              aria-label="Rename task"
            />
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2",
            editing
              ? "opacity-0 pointer-events-none"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
          )}
        >
          <IconButton aria-label="Edit task" title="Edit" onClick={start} circleSize="sm" iconSize="xs" variant="ring">
            <Pencil />
          </IconButton>
          <IconButton aria-label="Delete task" title="Delete" onClick={onDelete} circleSize="sm" iconSize="xs" variant="ring">
            <Trash2 />
          </IconButton>
        </div>
      </div>
    </li>
  );
}
