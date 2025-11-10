"use client"

import * as React from "react"

import { Card } from "../../Card"
import ProgressRingIcon from "@/icons/ProgressRingIcon"

import type { PlannerOverviewGoalsProps } from "../types"

function MomentumCardComponent({
  label,
  title,
  completed,
  total,
  percentage,
  active,
  emptyMessage,
  allCompleteMessage,
}: PlannerOverviewGoalsProps) {
  const hasGoals = total > 0
  const hasActiveGoals = active.length > 0

  return (
    <Card as="section" className="col-span-12 h-full md:col-span-6 lg:col-span-4">
      <Card.Header
        eyebrow={label}
        eyebrowClassName="text-label text-muted-foreground"
        title={title}
        titleClassName="text-body font-semibold text-card-foreground tracking-[-0.01em]"
        actionsClassName="justify-end"
        actions={
          <div className="text-right">
            <p className="text-label text-muted-foreground">Completed</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {completed}/{total}
            </p>
          </div>
        }
      />
      <Card.Body className="gap-[var(--space-4)] text-card-foreground md:flex-row md:items-center md:gap-[var(--space-5)]">
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
      </Card.Body>
    </Card>
  )
}

export const MomentumCard = React.memo(MomentumCardComponent)
