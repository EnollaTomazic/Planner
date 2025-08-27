"use client";

/**
 * TodayHero — day-scoped. Single project selection shared via useSelectedProject/useSelectedTask.
 * - No default selection. Select via UI or when adding a project/task.
 * - Animated progress bar for the selected project's tasks.
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { toISODate, cn } from "@/lib/utils";
import { useFocusDate, useDay, useSelectedProject, useSelectedTask, type ISODate } from "./usePlanner";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import AnimatedSelect from "@/components/ui/selects/AnimatedSelect";
import Input from "@/components/ui/primitives/input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Pencil, Trash2, Calendar, Plus } from "lucide-react";
import type React from "react";

type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };
type Props = { iso?: ISODate };

export default function TodayHero({ iso }: Props) {
  const nowISO = useMemo(() => toISODate(), []);
  const { iso: isoActive, setIso, today } = useFocusDate();
  const viewIso = iso ?? isoActive;
  const isToday = viewIso === today;

  useEffect(() => { if (iso && iso !== isoActive) setIso(iso); }, [iso, isoActive, setIso]);

  const {
    projects, tasks, addTask, renameTask, toggleTask, deleteTask,
    addProject, renameProject, deleteProject, toggleProject,
  } = useDay(viewIso);

  // Shared selection
  const [selProjectId, setSelProjectId] = useSelectedProject(viewIso);
  const [, setSelTaskId] = useSelectedTask(viewIso);

  // If selected project disappears, clear selection
  useEffect(() => {
    if (selProjectId && !projects.some(p => p.id === selProjectId)) setSelProjectId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, viewIso]);

  // Local edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [projectName, setProjectName] = useState("");

  // Progress of selected project only (animated)
  const scopedTasks = selProjectId ? tasks.filter(t => t.projectId === selProjectId) : [];
  const done = scopedTasks.filter(t => t.done).length;
  const total = scopedTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Date picker
  const dateRef = useRef<HTMLInputElement>(null);
  const openPicker = () => { const el = dateRef.current as DateInputWithPicker | null; if (el?.showPicker) el.showPicker(); else dateRef.current?.focus(); };

  return (
    <section className="bg-hero-soft rounded-card card-pad-lg anim-in">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="glitch text-lg font-semibold tracking-tight" data-text={isToday ? "Today" : viewIso}>
            {isToday ? "Today" : viewIso}
          </h2>
        </div>

        <div className="flex items-center">
          <input ref={dateRef} type="date" value={viewIso || nowISO} onChange={e => setIso(e.target.value)} aria-label="Change focused date" className="sr-only" />
          <IconButton aria-label="Open calendar" title={viewIso} onClick={openPicker} circleSize="md" variant="ring" iconSize="md">
            <Calendar />
          </IconButton>
        </div>
      </div>

      {/* Project dropdown */}
      <div className="mb-4">
        <div className="w-[240px]">
          <AnimatedSelect
            items={projects.length ? projects.map(p => ({ value: p.id, label: p.name || "Untitled" })) : [{ value: "", label: "No projects" }]}
            value={selProjectId}
            onChange={v => { setSelProjectId(v); /* clears task selection via hook */ }}
            label="Project"
            hideLabel
            buttonClassName="h-10 rounded-2xl"
            dropdownClassName="rounded-2xl"
            placeholder="Select a project"
          />
        </div>
      </div>

      {/* Animated Progress of selected project */}
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("glitch-track w-full", pct === 100 && "is-complete")} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="glitch-fill transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          <div className="glitch-scan" />
        </div>
        <span className="glitch-percent w-12 text-right text-sm" aria-live="polite">{pct}%</span>
      </div>

      {/* Projects */}
      <div className="mt-1">
        <div className="mb-2 text-[11px] text-[hsl(var(--muted-foreground))]">{`// projects`}</div>

        <form
          className="flex items-center gap-2"
          onSubmit={e => {
            e.preventDefault();
            const title = projectName.trim(); if (!title) return;
            const id = addProject(title);
            setProjectName("");
            if (id) setSelProjectId(id);
          }}
        >
          <Input name="new-project" placeholder="> new project…" value={projectName} onChange={e => setProjectName(e.target.value)} aria-label="New project" className="mt-1" />
          <IconButton type="submit" aria-label="Add project" title="Add project" circleSize="sm" variant="ring" iconSize="sm">
            <Plus />
          </IconButton>
        </form>

        {projects.length > 0 && (
          <ul className="mt-3 space-y-2" role="list" aria-label="Projects">
            {projects.slice(0, 12).map(p => {
              const isEditing = editingProjectId === p.id;
              const isSelected = selProjectId === p.id;
              return (
                <li
                  key={p.id}
                  className={cn(
                    "group flex select-none items-center justify-between rounded-md border px-3 py-2 text-sm transition",
                    "border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] hover:bg-[hsl(var(--card)/0.7)]",
                    isSelected && "ring-1 ring-[hsl(var(--ring))]"
                  )}
                  onClick={() => !isEditing && setSelProjectId(p.id)}
                  title={isEditing ? "Editing…" : isSelected ? "Selected" : "Click to select"}
                  role="listitem"
                >
                  {isEditing ? (
                    <Input
                      name={`rename-project-${p.id}`} autoFocus value={editingProjectName}
                      onChange={e => setEditingProjectName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { renameProject(p.id, editingProjectName || p.name); setEditingProjectId(null); }
                        if (e.key === "Escape") setEditingProjectId(null);
                      }}
                      onBlur={() => { renameProject(p.id, editingProjectName || p.name); setEditingProjectId(null); }}
                      className="h-8 text-sm" aria-label={`Rename project ${p.name}`} onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <CheckCircle size="sm" checked={p.done} onChange={() => toggleProject(p.id)} aria-label={`Toggle completion for ${p.name}`} />
                      </span>
                      <span className={cn("truncate", p.done && "line-through-soft opacity-70")}>{p.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <IconButton aria-label={`Edit project ${p.name}`} title="Edit" onClick={e => { e.stopPropagation(); setEditingProjectId(p.id); setEditingProjectName(p.name); }} circleSize="sm" variant="ring" iconSize="xs">
                      <Pencil />
                    </IconButton>
                    <IconButton aria-label={`Remove project ${p.name}`} title="Remove" onClick={e => { e.stopPropagation(); deleteProject(p.id); if (selProjectId === p.id) setSelProjectId(""); }} circleSize="sm" variant="ring" iconSize="xs">
                      <Trash2 />
                    </IconButton>
                  </div>
                </li>
              );
            })}
            {projects.length > 12 && <li className="pr-1 text-right text-xs opacity-70">+ {projects.length - 12} more…</li>}
          </ul>
        )}
      </div>

      {/* Tasks (only when a project is selected) */}
      {!selProjectId ? (
        <div className="mt-4 text-[13px] text-[hsl(var(--muted-foreground))]">Select a project to add and view tasks.</div>
      ) : (
        <>
          <div className="mt-4 text-[11px] text-[hsl(var(--muted-foreground))]">{`// tasks`}</div>

          <form
            className="flex items-center gap-2"
            onSubmit={e => {
              e.preventDefault();
              const el = e.currentTarget.elements.namedItem(`new-task-${selProjectId}`) as HTMLInputElement | null;
              const v = el?.value ?? ""; if (!v.trim()) return;
              const id = addTask(v, selProjectId);
              if (el) el.value = "";
              if (id) setSelTaskId(id);
            }}
          >
            <Input name={`new-task-${selProjectId}`} placeholder={`> task for "${projects.find(p => p.id === selProjectId)?.name ?? "Project"}"`} aria-label="New task" className="mt-1" />
            <IconButton type="submit" aria-label="Add task" title="Add task" circleSize="sm" variant="ring" iconSize="sm">
              <Plus />
            </IconButton>
          </form>

          {scopedTasks.length === 0 ? (
            <div className="tasks-placeholder mt-4">No tasks yet.</div>
          ) : (
            <ul className="mt-4 space-y-2" role="list" aria-label="Tasks">
              {scopedTasks.slice(0, 12).map(t => {
                const isEditing = editingTaskId === t.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "task-tile flex items-center justify-between rounded-md border px-3 py-2",
                      "border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] hover:bg-[hsl(var(--card)/0.7)]"
                    )}
                    role="listitem"
                    onClick={() => setSelTaskId(t.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle checked={t.done} onChange={() => { toggleTask(t.id); setSelTaskId(t.id); }} size="sm" />
                      {isEditing ? (
                        <Input
                          name={`rename-task-${t.id}`} autoFocus value={editingTaskText}
                          onChange={e => setEditingTaskText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") { renameTask(t.id, editingTaskText || t.text); setEditingTaskId(null); }
                            if (e.key === "Escape") setEditingTaskId(null);
                          }}
                          onBlur={() => { renameTask(t.id, editingTaskText || t.text); setEditingTaskId(null); }}
                          className="h-8 text-sm" aria-label={`Rename task ${t.text}`}
                        />
                      ) : (
                        <span className={cn("task-tile__text", t.done && "line-through-soft")} onClick={() => setEditingTaskId(t.id)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter") setEditingTaskId(t.id); }} aria-label={`Edit task ${t.text}`} title="Edit task">
                          {t.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <IconButton aria-label={`Edit task ${t.text}`} title="Edit" onClick={() => { setEditingTaskId(t.id); setEditingTaskText(t.text); setSelTaskId(t.id); }} circleSize="sm" variant="ring" iconSize="xs">
                        <Pencil />
                      </IconButton>
                      <IconButton aria-label="Remove task" title="Remove" onClick={() => { deleteTask(t.id); setSelTaskId(""); }} circleSize="sm" variant="ring" iconSize="xs">
                        <Trash2 />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
              {scopedTasks.length > 12 && <li className="pr-1 text-right text-xs opacity-70">+ {scopedTasks.length - 12} more…</li>}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
