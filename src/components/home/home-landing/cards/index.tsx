"use client"

import * as React from "react"
import Link from "next/link"

import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/primitives/Card"
import { CheckCircle } from "@/components/ui"
import ProgressRingIcon from "@/icons/ProgressRingIcon"
import { cn, withBasePath } from "@/lib/utils"
import type {
  PlannerOverviewCalendarProps,
  PlannerOverviewFocusProps,
  PlannerOverviewGoalsProps,
  PlannerOverviewSummaryProps,
} from "../types"

type OverviewCardProps = {
  cardProps?: React.ComponentProps<typeof Card>
}

type OverviewCardHeaderProps = {
  label?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  labelClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
}

function OverviewCardHeader({
  label,
  title,
  description,
  actions,
  className,
  labelClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: OverviewCardHeaderProps) {
  return (
    <CardHeader className={cn("space-y-[var(--space-3)]", className)}>
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          {label ? (
            <p
              className={cn(
                "text-label text-muted-foreground",
                labelClassName,
              )}
            >
              {label}
            </p>
          ) : null}
          {title ? (
            <h3
              className={cn(
                "text-body font-semibold text-card-foreground tracking-[-0.01em]",
                titleClassName,
              )}
            >
              {title}
            </h3>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-label text-muted-foreground",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-[var(--space-2)] text-right",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </CardHeader>
  )
}

export const SummaryCard = React.memo(function SummaryCardComponent({
  label,
  title,
  items,
  cardProps,
}: PlannerOverviewSummaryProps & OverviewCardProps) {
  const { className, ...restCardProps } = cardProps ?? {}

  return (
    <Card
      className={cn("h-full", className)}
      {...restCardProps}
    >
      <OverviewCardHeader
        label={label}
        labelClassName="text-label text-muted-foreground"
        title={title}
      />
      <CardBody className="flex flex-col gap-[var(--space-3)] text-card-foreground">
        <ul className="grid gap-[var(--space-2)]" role="list">
          {items.map((item) => (
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
      </CardBody>
    </Card>
  )
})
SummaryCard.displayName = "SummaryCard"

export const FocusCard = React.memo(function FocusCardComponent({
  label,
  title,
  doneCount,
  totalCount,
  tasks,
  remainingTasks,
  onToggleTask,
  cardProps,
}: PlannerOverviewFocusProps & OverviewCardProps) {
  const { className, ...restCardProps } = cardProps ?? {}

  return (
    <Card
      className={cn("flex h-full flex-col", className)}
      {...restCardProps}
    >
      <OverviewCardHeader
        label={label}
        labelClassName="text-label text-muted-foreground"
        title={title}
        actions={
          <div className="text-right">
            <p className="text-label text-muted-foreground">Progress</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {doneCount}/{totalCount}
            </p>
          </div>
        }
        actionsClassName="justify-end"
      />
      <CardBody className="flex flex-1 flex-col gap-[var(--space-3)] text-card-foreground">
        <ul className="flex flex-col gap-[var(--space-3)]" aria-live="polite">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className="flex items-start gap-[var(--space-3)]">
                <CheckCircle
                  checked={task.done}
                  onChange={() => onToggleTask(task.id)}
                  aria-label={task.toggleLabel}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
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
      </CardBody>
      {remainingTasks > 0 ? (
        <CardFooter className="border-t border-card-hairline/60 pt-[var(--space-3)] text-label text-muted-foreground">
          +{remainingTasks} more task{remainingTasks === 1 ? "" : "s"} in planner
        </CardFooter>
      ) : null}
    </Card>
  )
})
FocusCard.displayName = "FocusCard"

export const MomentumCard = React.memo(function MomentumCardComponent({
  label,
  title,
  completed,
  total,
  percentage,
  active,
  emptyMessage,
  allCompleteMessage,
  cardProps,
}: PlannerOverviewGoalsProps & OverviewCardProps) {
  const hasGoals = total > 0
  const hasActiveGoals = active.length > 0
  const { className, ...restCardProps } = cardProps ?? {}

  return (
    <Card
      className={cn("flex h-full flex-col", className)}
      {...restCardProps}
    >
      <OverviewCardHeader
        label={label}
        labelClassName="text-label text-muted-foreground"
        title={title}
        actions={
          <div className="text-right">
            <p className="text-label text-muted-foreground">Completed</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {completed}/{total}
            </p>
          </div>
        }
        actionsClassName="justify-end"
      />
      <CardBody className="flex flex-col gap-[var(--space-4)] text-card-foreground md:flex-row md:items-center md:gap-[var(--space-5)]">
        <div className="flex items-center justify-center">
          <div className="relative flex size-[var(--ring-diameter-m)] items-center justify-center">
            <ProgressRingIcon pct={percentage} size="m" />
            <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
              {hasGoals ? `${percentage}%` : "0%"}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-[var(--space-3)]">
          {!hasGoals ? (
            <p className="text-label text-muted-foreground">{emptyMessage}</p>
          ) : hasActiveGoals ? (
            active.map((goal) => (
              <div key={goal.id} className="space-y-[var(--space-1)]">
                <p className="text-ui font-medium text-card-foreground">{goal.title}</p>
                {goal.detail ? (
                  <p className="text-label text-muted-foreground">{goal.detail}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-label text-muted-foreground">{allCompleteMessage}</p>
          )}
        </div>
      </CardBody>
    </Card>
  )
})
MomentumCard.displayName = "MomentumCard"

export const CalendarCard = React.memo(function CalendarCardComponent({
  label,
  title,
  summary,
  doneCount,
  totalCount,
  hasPlannedTasks,
  days,
  onSelectDay,
  cardProps,
}: PlannerOverviewCalendarProps & OverviewCardProps) {
  const { className, ...restCardProps } = cardProps ?? {}
  const description = hasPlannedTasks ? (
    <span className="tabular-nums text-card-foreground">
      {doneCount}/{totalCount}
    </span>
  ) : (
    summary
  )

  return (
    <Card
      className={cn("flex h-full flex-col", className)}
      {...restCardProps}
    >
      <OverviewCardHeader
        label={label}
        labelClassName="text-label text-muted-foreground"
        title={title}
        description={description}
        descriptionClassName="text-label text-muted-foreground"
      />
      <CardBody className="text-card-foreground">
        <div className="flex overflow-x-auto rounded-card r-card-lg border border-border/60 p-[var(--space-2)]">
          <ul className="flex w-full min-w-0 gap-[var(--space-2)]" aria-label="Select focus day">
            {days.map((day) => {
              const blockInteraction = day.disabled || day.loading
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
                      if (blockInteraction) return
                      onSelectDay(day.iso)
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
              )
            })}
          </ul>
        </div>
      </CardBody>
    </Card>
  )
})
CalendarCard.displayName = "CalendarCard"
