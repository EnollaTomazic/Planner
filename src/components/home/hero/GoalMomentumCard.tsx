"use client";

import * as React from "react";
import { NeoCard } from "@/components/ui";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import { usePersistentState } from "@/lib/db";
import type { Goal } from "@/lib/types";

export type GoalMomentumActiveGoal = {
  id: string;
  title: string;
  metric?: string | null;
  notes?: string | null;
};

export type GoalMomentumCardProps = {
  total: number;
  completed: number;
  pct: number;
  activeGoals: readonly GoalMomentumActiveGoal[];
  className?: string;
};

type GoalStats = {
  total: number;
  completed: number;
  active: GoalMomentumActiveGoal[];
};

function computeGoalStats(
  goals: readonly Goal[],
  maxActive: number,
): GoalStats {
  let completed = 0;
  const active: GoalMomentumActiveGoal[] = [];
  for (const goal of goals) {
    if (goal.done) {
      completed += 1;
      continue;
    }
    if (active.length >= maxActive) continue;
    active.push({
      id: goal.id,
      title: goal.title,
      metric: goal.metric ?? null,
      notes: goal.notes ?? null,
    });
  }
  return {
    total: goals.length,
    completed,
    active,
  };
}

function computeGoalPct(total: number, completed: number): number {
  if (total === 0) return 0;
  const pct = (completed / total) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function useGoalMomentumCard(
  maxActive = 2,
): Omit<GoalMomentumCardProps, "className"> {
  const [goals] = usePersistentState<Goal[]>("goals.v2", []);

  const stats = React.useMemo(
    () => computeGoalStats(goals, maxActive),
    [goals, maxActive],
  );

  const pct = React.useMemo(
    () => computeGoalPct(stats.total, stats.completed),
    [stats.completed, stats.total],
  );

  return {
    total: stats.total,
    completed: stats.completed,
    pct,
    activeGoals: stats.active,
  } as const;
}

function GoalMomentumCard({
  total,
  completed,
  pct,
  activeGoals,
  className,
}: GoalMomentumCardProps) {
  const hasGoals = total > 0;
  const hasActive = activeGoals.length > 0;

  return (
    <div className={className}>
      <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
        <header className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-label text-muted-foreground">Goals overview</p>
            <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
              Momentum
            </h3>
          </div>
          <div className="text-right">
            <p className="text-label text-muted-foreground">Completed</p>
            <p className="text-ui font-medium tabular-nums text-card-foreground">
              {completed}/{total}
            </p>
          </div>
        </header>
        <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:gap-[var(--space-5)]">
          <div className="flex items-center justify-center">
            <div className="relative flex h-[var(--space-8)] w-[var(--space-8)] items-center justify-center">
              <ProgressRingIcon pct={pct} size={64} />
              <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
                {hasGoals ? `${pct}%` : "0%"}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-[var(--space-3)]">
            {!hasGoals ? (
              <p className="text-label text-muted-foreground">
                No goals tracked yet. Capture one in the goals workspace to see it here.
              </p>
            ) : hasActive ? (
              activeGoals.map((goal) => (
                <div key={goal.id} className="space-y-[var(--space-1)]">
                  <p className="text-ui font-medium text-card-foreground">
                    {goal.title}
                  </p>
                  {goal.metric ? (
                    <p className="text-label text-muted-foreground">{goal.metric}</p>
                  ) : goal.notes ? (
                    <p className="text-label text-muted-foreground">{goal.notes}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-label text-muted-foreground">
                All active goals are complete. Great work!
              </p>
            )}
          </div>
        </div>
      </NeoCard>
    </div>
  );
}

export default GoalMomentumCard;
