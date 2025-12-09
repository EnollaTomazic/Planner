"use client";

import Link from "next/link";
import * as React from "react";

import { CheckCircle, ProgressRing, SectionCard } from "@/components/ui";
import { cn, withBasePath } from "@/lib/utils";
import type { PlannerOverviewProps } from "./types";

interface PlannerOverviewComponentProps extends PlannerOverviewProps {
  className?: string;
}

type OverviewHeaderProps = {
  label?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  actionsClassName?: string;
};

function OverviewHeader({
  label,
  title,
  description,
  actions,
  actionsClassName,
}: OverviewHeaderProps) {
  return (
    <SectionCard.Header
      title={
        <div className="space-y-[var(--space-1)]">
          {label ? (
            <p className="text-label text-muted-foreground">{label}</p>
          ) : null}
          {title ? (
            <span className="block text-body font-semibold tracking-[-0.01em] text-card-foreground">
              {title}
            </span>
          ) : null}
          {description ? (
            <span className="block text-label text-muted-foreground">{description}</span>
          ) : null}
        </div>
      }
      titleAs="h3"
      actions={
        actions ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-[var(--space-2)] text-right",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : undefined
      }
      className="space-y-[var(--space-3)]"
    />
  );
}

export function PlannerOverview({
  summary,
  focus,
  goals,
  calendar,
  className,
}: PlannerOverviewComponentProps) {
  const calendarDescription = React.useMemo(
    () =>
      calendar.hasPlannedTasks ? (
        <span className="tabular-nums text-card-foreground">
          {calendar.doneCount}/{calendar.totalCount}
        </span>
      ) : (
        calendar.summary
      ),
    [calendar.doneCount, calendar.hasPlannedTasks, calendar.summary, calendar.totalCount],
  );

  return (
    <div
      className={cn(
        "col-span-full grid grid-cols-12 gap-[var(--space-5)]",
        "supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
        className,
      )}
    >
      <SectionCard className="col-span-12 h-full md:col-span-6 lg:col-span-4">
        <OverviewHeader label={summary.label} title={summary.title} />
        <SectionCard.Body className="flex flex-col gap-[var(--space-3)] text-card-foreground">
          <ul className="grid gap-[var(--space-2)]" role="list">
            {summary.items.map((item) => (
              <li key={item.key}>
                <Link
                  href={withBasePath(item.href, { skipForNextLink: true })}
                  className={cn(
                    "group flex items-center justify-between gap-[var(--space-3)] rounded-[var(--control-radius)] border border-border/60 bg-card/70 px-[var(--space-3)] py-[var(--space-2)] transition",
                    "hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                    "active:border-primary/60 active:bg-card/80",
                  )}
                >
                  <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                    <span className="text-label text-muted-foreground">{item.label}</span>
                    <span className="text-ui font-semibold text-card-foreground text-balance">
                      {item.value}
                    </span>
                  </div>
                  <span className="shrink-0 text-label font-medium text-primary transition-colors group-hover:text-primary-foreground group-active:text-primary-foreground">
                    {item.cta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard.Body>
      </SectionCard>

      <SectionCard className="col-span-12 h-full md:col-span-6 lg:col-span-4">
        <OverviewHeader
          label={focus.label}
          title={focus.title}
          actions={
            <div className="text-right">
              <p className="text-label text-muted-foreground">Progress</p>
              <p className="text-ui font-medium tabular-nums text-card-foreground">
                {focus.doneCount}/{focus.totalCount}
              </p>
            </div>
          }
          actionsClassName="justify-end"
        />
        <SectionCard.Body className="flex flex-1 flex-col gap-[var(--space-3)] text-card-foreground">
          <ul className="flex flex-col gap-[var(--space-3)]" aria-live="polite">
            {focus.tasks.length > 0 ? (
              focus.tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-[var(--space-3)]">
                  <CheckCircle
                    checked={task.done}
                    onChange={() => focus.onToggleTask(task.id)}
                    aria-label={task.toggleLabel}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => focus.onToggleTask(task.id)}
                    aria-pressed={task.done}
                    aria-label={task.toggleLabel}
                    className={cn(
                      "flex flex-col items-start gap-[var(--space-1)] rounded-[var(--control-radius)] px-[var(--space-1)] py-[var(--space-1)] text-left transition",
                      "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                      "active:text-foreground/80",
                      "disabled:pointer-events-none disabled:opacity-disabled data-[loading=true]:cursor-progress data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
                    )}
                  >
                    <span
                      className={cn(
                        "text-ui font-medium text-card-foreground",
                        task.done && "line-through-soft text-muted-foreground",
                      )}
                    >
                      {task.title}
                    </span>
                    {task.projectName ? (
                      <span className="text-label text-muted-foreground">{task.projectName}</span>
                    ) : null}
                  </button>
                </li>
              ))
            ) : (
              <li className="rounded-card r-card-md border border-dashed border-border px-[var(--space-3)] py-[var(--space-3)] text-label text-muted-foreground">
                No tasks captured for this day.
              </li>
            )}
          </ul>
          {focus.remainingTasks > 0 ? (
            <div className="border-t border-card-hairline/60 pt-[var(--space-3)] text-label text-muted-foreground">
              +{focus.remainingTasks} more task{focus.remainingTasks === 1 ? "" : "s"} in planner
            </div>
          ) : null}
        </SectionCard.Body>
      </SectionCard>

      <SectionCard className="col-span-12 h-full md:col-span-6 lg:col-span-4">
        <OverviewHeader
          label={goals.label}
          title={goals.title}
          actions={
            <div className="text-right">
              <p className="text-label text-muted-foreground">Completed</p>
              <p className="text-ui font-medium tabular-nums text-card-foreground">
                {goals.completed}/{goals.total}
              </p>
            </div>
          }
          actionsClassName="justify-end"
        />
        <SectionCard.Body className="flex flex-col gap-[var(--space-4)] text-card-foreground md:flex-row md:items-center md:gap-[var(--space-5)]">
          <div className="relative flex items-center justify-center">
            <div className="relative flex size-[var(--ring-diameter-m)] items-center justify-center">
              <ProgressRing value={goals.percentage} size="m" aria-label="Goal completion" />
              <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
                {goals.total > 0 ? `${goals.percentage}%` : "0%"}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-[var(--space-3)]">
            {goals.total === 0 ? (
              <p className="text-label text-muted-foreground">{goals.emptyMessage}</p>
            ) : goals.active.length > 0 ? (
              goals.active.map((goal) => (
                <div key={goal.id} className="space-y-[var(--space-1)]">
                  <p className="text-ui font-medium text-card-foreground">{goal.title}</p>
                  {goal.detail ? (
                    <p className="text-label text-muted-foreground">{goal.detail}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-label text-muted-foreground">{goals.allCompleteMessage}</p>
            )}
          </div>
        </SectionCard.Body>
      </SectionCard>

      <SectionCard className="col-span-12 h-full md:col-span-6 lg:col-span-4">
        <OverviewHeader
          label={calendar.label}
          title={calendar.title}
          description={calendarDescription}
        />
        <SectionCard.Body className="text-card-foreground">
          <div className="flex overflow-x-auto rounded-card r-card-lg border border-border/60 p-[var(--space-2)]">
            <ul className="flex w-full min-w-0 gap-[var(--space-2)]" aria-label="Select focus day">
              {calendar.days.map((day) => {
                const blockInteraction = day.disabled || day.loading;
                return (
                  <li key={day.iso} className="flex-1 min-w-[calc(var(--space-8)+var(--space-2))]">
                    <button
                      type="button"
                      aria-pressed={day.selected}
                      aria-current={day.today ? "date" : undefined}
                      aria-disabled={blockInteraction || undefined}
                      aria-busy={day.loading || undefined}
                      disabled={day.disabled}
                      data-loading={day.loading ? "true" : undefined}
                      onClick={() => {
                        if (blockInteraction) return;
                        calendar.onSelectDay(day.iso);
                      }}
                      className={cn(
                        "flex w-full flex-col items-start gap-[var(--space-1)] rounded-[var(--control-radius)] border px-[var(--space-3)] py-[var(--space-2)] text-left transition",
                        "border-card-hairline bg-card/70 hover:border-primary/40 hover:bg-card/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                        "active:bg-card/90",
                        "disabled:pointer-events-none disabled:opacity-disabled data-[loading=true]:cursor-progress data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
                        day.selected && "border-primary/70 bg-card",
                      )}
                    >
                      <span
                        className={cn(
                          "text-label text-muted-foreground",
                          day.today && "text-accent-3",
                        )}
                      >
                        {day.weekday}
                      </span>
                      <span className="text-ui font-semibold tabular-nums text-card-foreground">
                        {day.dayNumber}
                      </span>
                      <span className="text-label text-muted-foreground tabular-nums">
                        {day.done}/{day.total}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}
