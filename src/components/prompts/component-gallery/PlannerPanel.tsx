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
  ScrollTopFloatingButton,
  TaskList,
  TaskRow,
} from "@/components/planner";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import GalleryItem from "../GalleryItem";
import {
  demoProjects,
  demoTasksById,
  demoTasksByProject,
} from "./ComponentGallery.demoData";
import WeekPickerDemo from "./WeekPickerDemo";
import type { PlannerPanelData } from "./useComponentGalleryState";

const GRID_CLASS =
  "grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 md:grid-cols-12 md:gap-[var(--space-8)]";
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
        { label: "EmptyRow", element: <EmptyRow text="Nothing here" /> },
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
              renderEmpty={() => <EmptyRow text="All caught up" />}
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
              addProject={() => ""}
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
              addTask={() => ""}
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
          label: "ScrollTopFloatingButton",
          element: (
            <ScrollTopFloatingButton
              watchRef={React.createRef<HTMLElement>()}
              forceVisible
            />
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
