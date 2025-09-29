"use client";

import * as React from "react";
import { GoalsProgress, GoalsTabs } from "@/components/goals";
import {
  DayRow,
  DayCardHeader,
  EmptyRow,
  PlannerListPanel,
  PlannerProvider,
  ProjectList,
  PlannerCreateFab,
  TaskList,
  TaskRow,
  WeekPickerShell,
} from "@/components/planner";
import { Button, Input } from "@/components/ui";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GalleryItem from "../GalleryItem";
import {
  demoProjects,
  demoTasksById,
  demoTasksByProject,
} from "./ComponentGallery.demoData";
import WeekPickerDemo from "./WeekPickerDemo";
import type { PlannerPanelData } from "./useComponentGalleryState";

const GRID_CLASS = cn(layoutGridClassName, "sm:grid-cols-2 md:grid-cols-12");

type WeekPickerShellDemoDay = {
  readonly iso: string;
  readonly display: string;
  readonly accessible: string;
  readonly done: number;
  readonly total: number;
  readonly today?: boolean;
  readonly selected?: boolean;
};

const weekPickerShellDemoTotals = {
  range: "Jan 01 → Jan 07",
  done: 21,
  total: 35,
} as const;

const weekPickerShellDemoDays: readonly WeekPickerShellDemoDay[] = [
  {
    iso: "2024-01-01",
    display: "Mon, Jan 01",
    accessible: "Monday, January 1",
    done: 3,
    total: 5,
    today: true,
    selected: true,
  },
  {
    iso: "2024-01-02",
    display: "Tue, Jan 02",
    accessible: "Tuesday, January 2",
    done: 2,
    total: 6,
  },
  {
    iso: "2024-01-03",
    display: "Wed, Jan 03",
    accessible: "Wednesday, January 3",
    done: 4,
    total: 4,
  },
  {
    iso: "2024-01-04",
    display: "Thu, Jan 04",
    accessible: "Thursday, January 4",
    done: 1,
    total: 3,
  },
  {
    iso: "2024-01-05",
    display: "Fri, Jan 05",
    accessible: "Friday, January 5",
    done: 0,
    total: 2,
  },
] as const;

function getWeekPickerShellDemoAppearance(done: number, total: number) {
  if (total === 0) {
    return { tint: "bg-card", text: "text-muted-foreground" } as const;
  }

  const ratio = done / total;

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return { tint: "bg-accent-3/30", text: "text-foreground" } as const;
  }

  if (ratio >= 2 / 3) {
    return { tint: "bg-success-soft", text: "text-foreground" } as const;
  }

  if (ratio >= 1 / 3) {
    return { tint: "bg-accent-3/20", text: "text-foreground" } as const;
  }

  return { tint: "bg-accent-3/30", text: "text-foreground" } as const;
}

function WeekPickerShellPreview() {
  return (
    <WeekPickerShell>
      <WeekPickerShell.Controls slotId="planner-demo-controls">
        <div
          role="group"
          aria-label="Week navigation"
          className="flex flex-wrap items-center gap-[var(--space-2)]"
        >
          <Button variant="ghost" size="sm" aria-label="Go to previous week">
            <ChevronLeft />
            <span>Prev</span>
          </Button>
          <Button size="sm" aria-label="Jump to today" disabled>
            Today
          </Button>
          <Button variant="ghost" size="sm" aria-label="Go to next week">
            <span>Next</span>
            <ChevronRight />
          </Button>
        </div>
      </WeekPickerShell.Controls>
      <WeekPickerShell.Totals slotId="planner-demo-range">
        <span className="sr-only" aria-live="polite">
          Week range {weekPickerShellDemoTotals.range}
        </span>
        <span className="inline-flex items-baseline gap-[var(--space-1)] text-ui text-muted-foreground">
          <span>Total tasks:</span>
          <span className="font-medium tabular-nums text-foreground">
            {weekPickerShellDemoTotals.done} / {weekPickerShellDemoTotals.total}
          </span>
        </span>
      </WeekPickerShell.Totals>
      <WeekPickerShell.Chips slotId="planner-demo-days">
        <div
          role="listbox"
          aria-label="Select a focus day for the shell preview"
          className="flex flex-nowrap gap-[var(--space-3)] overflow-x-auto snap-x snap-mandatory lg:flex-wrap lg:gap-y-[var(--space-3)] lg:overflow-visible lg:[scroll-snap-type:none]"
        >
          {weekPickerShellDemoDays.map((day) => {
            const { tint, text } = getWeekPickerShellDemoAppearance(
              day.done,
              day.total,
            );

            return (
              <button
                key={day.iso}
                type="button"
                role="option"
                tabIndex={day.selected ? 0 : -1}
                aria-selected={day.selected ?? false}
                aria-label={`Select ${day.accessible}`}
                className={cn(
                  "chip relative flex-none w-[--chip-width] rounded-card r-card-lg border text-left px-[var(--space-3)] py-[var(--space-2)] transition snap-start",
                  "border-card-hairline",
                  tint,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "active:border-primary/60 active:bg-card/85",
                  day.today && "chip--today",
                  day.selected
                    ? "border-dashed border-primary/75"
                    : "hover:border-primary/40",
                )}
                data-today={day.today || undefined}
                data-active={day.selected || undefined}
              >
                <div
                  className={cn(
                    "chip__date",
                    text,
                    day.today && tint === "bg-card"
                      ? "text-accent-3"
                      : undefined,
                  )}
                  data-text={day.display}
                >
                  <span aria-hidden="true">{day.display}</span>
                  <span className="sr-only">{day.accessible}</span>
                </div>
                <div className="chip__counts text-foreground">
                  <span className="tabular-nums">{day.done}</span>
                  <span className="text-foreground/70"> / {day.total}</span>
                </div>
                <span aria-hidden className="chip__scan" />
                <span aria-hidden className="chip__edge" />
              </button>
            );
          })}
        </div>
      </WeekPickerShell.Chips>
    </WeekPickerShell>
  );
}

type PanelItem = { label: string; element: React.ReactNode; className?: string };

interface PlannerPanelProps {
  data: PlannerPanelData;
}

export default function PlannerPanel({ data }: PlannerPanelProps) {
  const items = React.useMemo<PanelItem[]>(
    () =>
      [
        {
          label: "GoalsProgress",
          element: <GoalsProgress total={5} pct={60} maxWidth={200} />,
        },
        {
          label: "Goals Tabs",
          element: (
            <div className="w-56">
              <GoalsTabs value={data.goalFilter.value} onChange={data.goalFilter.onChange} />
            </div>
          ),
        },
        {
          label: "WeekPicker",
          element: <WeekPickerDemo />,
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "DayCardHeader",
          element: (
            <DayCardHeader iso="2024-01-01" projectCount={2} doneCount={1} totalCount={3} />
          ),
        },
        {
          label: "EmptyRow",
          element: (
            <div className="space-y-[var(--space-2)]">
              <EmptyRow text="Nothing here" tone="muted" />
              <EmptyRow text="No backlog items" variant="rotate" />
            </div>
          ),
        },
        {
          label: "TaskRow",
          element: (
            <ul className="w-64">
              <TaskRow
                task={{
                  id: "t1",
                  title: "Sample",
                  done: false,
                  createdAt: Date.now(),
                  images: ["https://placekitten.com/100/100"],
                }}
                toggleTask={() => {}}
                deleteTask={() => {}}
                renameTask={() => {}}
                selectTask={() => {}}
                addImage={() => {}}
                removeImage={(url: string, index: number) => {
                  void url;
                  void index;
                }}
              />
            </ul>
          ),
        },
        {
          label: "WeekPickerShell",
          element: <WeekPickerShellPreview />,
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "PlannerListPanel",
          element: (
            <PlannerListPanel
              renderComposer={() => (
                <form
                  className="w-full"
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <Input className="w-full" placeholder="> add item…" aria-label="Add item" />
                </form>
              )}
              isEmpty={false}
              renderEmpty={() => (
                <EmptyRow text="All caught up" tone="muted" variant="rotate" />
              )}
              renderList={() => (
                <ul className="space-y-[var(--space-2)]" aria-label="Demo items">
                  {demoProjects.map((project) => (
                    <li key={project.id}>
                      <div className="rounded-card border border-border/40 bg-surface/60 px-[var(--space-4)] py-[var(--space-2)] text-label font-medium">
                        {project.name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            />
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "ProjectList",
          element: (
            <ProjectList
              projects={demoProjects}
              selectedProjectId=""
              setSelectedProjectId={() => {}}
              setSelectedTaskId={() => {}}
              toggleProject={() => {}}
              renameProject={() => {}}
              deleteProject={() => {}}
              createProject={() => undefined}
            />
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "TaskList",
          element: (
            <TaskList
              tasksById={demoTasksById}
              tasksByProject={demoTasksByProject}
              selectedProjectId="p1"
              createTask={() => undefined}
              renameTask={() => {}}
              toggleTask={() => {}}
              deleteTask={() => {}}
              addTaskImage={() => {}}
              removeTaskImage={(
                taskId: string,
                imageUrl: string,
                imageIndex: number,
              ) => {
                void taskId;
                void imageUrl;
                void imageIndex;
              }}
              setSelectedTaskId={() => {}}
            />
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "DayRow",
          element: (
            <PlannerProvider>
              <DayRow iso="2024-01-01" isToday={false} />
            </PlannerProvider>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "PlannerCreateFab",
          element: (
            <PlannerProvider>
              <PlannerCreateFab
                watchRef={React.createRef<HTMLElement>()}
                forceVisible
              />
            </PlannerProvider>
          ),
        },
      ],
    [data.goalFilter.value, data.goalFilter.onChange],
  );

  return (
    <div className={GRID_CLASS}>
      {items.map((item) => (
        <GalleryItem
          key={item.label}
          label={item.label}
          className={cn("md:col-span-4", item.className)}
        >
          {item.element}
        </GalleryItem>
      ))}
    </div>
  );
}
