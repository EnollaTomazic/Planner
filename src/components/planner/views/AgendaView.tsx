"use client";

import * as React from "react";
import PageShell from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import { addDays, formatWeekDay, toISODate } from "@/lib/date";
import { useWeek, useFocusDate } from "../useFocusDate";
import { usePlannerStore } from "../usePlannerStore";
import { ensureDay } from "../plannerSerialization";
import PlannerIslandBoundary from "../PlannerIslandBoundary";

export default function AgendaView() {
  const { iso } = useFocusDate();
  const { start, isToday } = useWeek(iso);
  const { days: map } = usePlannerStore();

  const entries = React.useMemo(() => {
    const list: {
      iso: string;
      label: string;
      done: number;
      total: number;
      projects: number;
      tasks: { id: string; title: string; done: boolean }[];
      isToday: boolean;
    }[] = [];
    for (let index = 0; index < 14; index += 1) {
      const dateIso = toISODate(addDays(start, index));
      const record = ensureDay(map, dateIso);
      const pending = record.tasks.filter((task) => !task.done);
      const shownTasks = pending.length > 0 ? pending : record.tasks;
      list.push({
        iso: dateIso,
        label: formatWeekDay(dateIso),
        done: record.doneCount,
        total: record.totalCount,
        projects: record.projects.length,
        tasks: shownTasks.map((task) => ({
          id: task.id,
          title: task.title,
          done: task.done,
        })),
        isToday: isToday(dateIso),
      });
    }
    return list;
  }, [isToday, map, start]);

  const headerId = React.useId();

  return (
    <PageShell
      as="section"
      grid
      className="py-[var(--space-6)]"
      contentClassName="gap-y-[var(--space-6)]"
      aria-labelledby={headerId}
    >
      <header className="col-span-full flex flex-col gap-[var(--space-3)]">
        <h2 id={headerId} className="text-title font-semibold tracking-tight">
          Agenda view
        </h2>
        <p className="text-body text-muted-foreground max-w-prose">
          Scan the next two weeks. Upcoming tasks show first; finished days still
          list their history so you can revisit context without leaving the
          agenda.
        </p>
      </header>

      <PlannerIslandBoundary
        name="planner:agenda-view:list"
        title="Agenda unavailable"
        description="We couldn't load the upcoming agenda. Retry to rebuild the list."
        retryLabel="Retry agenda"
        variant="plain"
        fallbackClassName="col-span-full space-y-[var(--space-4)]"
      >
        <ol className="col-span-full space-y-[var(--space-4)]">
          {entries.map((entry) => (
            <li key={entry.iso}>
              <article
                aria-labelledby={`${entry.iso}-heading`}
                className={cn(
                  "rounded-card border border-border/40 bg-card/80 p-[var(--space-4)] shadow-sm",
                  "flex flex-col gap-[var(--space-3)]",
                  entry.isToday && "ring-1 ring-ring/60",
                )}
              >
                <header className="flex flex-wrap items-center gap-[var(--space-3)]">
                  <h3
                    id={`${entry.iso}-heading`}
                    className="text-ui font-semibold tracking-wide"
                  >
                    {entry.label}
                  </h3>
                  <span className="badge badge--sm" aria-live="polite">
                    <span className="tabular-nums">{entry.done}</span>
                    <span aria-hidden className="px-[var(--space-1)] opacity-60">
                      /
                    </span>
                    <span className="tabular-nums">{entry.total}</span>
                  </span>
                  <span className="text-label text-muted-foreground">
                    {entry.projects} projects
                  </span>
                </header>

                {entry.tasks.length ? (
                  <ul className="space-y-[var(--space-2)]">
                    {entry.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={cn(
                          "rounded-[var(--radius-md)] border border-border/30 px-[var(--space-3)] py-[var(--space-2)]",
                          "bg-card/90 text-body flex items-center gap-[var(--space-3)]",
                          task.done && "opacity-70 line-through",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-[var(--space-3)] w-[var(--space-3)] items-center justify-center rounded-full border",
                            task.done
                              ? "border-success/60 text-success"
                              : "border-muted-foreground/40 text-muted-foreground",
                          )}
                          aria-hidden
                        >
                          {task.done ? "✓" : "•"}
                        </span>
                        <span className="flex-1 truncate" title={task.title}>
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-label text-muted-foreground">
                    No tasks scheduled.
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      </PlannerIslandBoundary>
    </PageShell>
  );
}
