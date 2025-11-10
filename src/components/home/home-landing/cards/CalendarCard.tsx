"use client"

import * as React from "react"

import { Card } from "../../Card"
import { cn } from "@/lib/utils"

import type { PlannerOverviewCalendarProps } from "../types"

function CalendarCardComponent({
  label,
  title,
  summary,
  doneCount,
  totalCount,
  hasPlannedTasks,
  days,
  onSelectDay,
}: PlannerOverviewCalendarProps) {
  const description = hasPlannedTasks ? (
    <span className="tabular-nums text-card-foreground">
      {doneCount}/{totalCount}
    </span>
  ) : (
    summary
  )

  return (
    <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
      <Card.Header
        eyebrow={label}
        eyebrowClassName="text-label text-muted-foreground"
        title={title}
        titleClassName="text-body font-semibold text-card-foreground tracking-[-0.01em]"
        description={description}
        descriptionClassName="text-label text-muted-foreground"
      />
      <Card.Body className="text-card-foreground">
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
      </Card.Body>
    </Card>
  )
}

export const CalendarCard = React.memo(CalendarCardComponent)
