"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import DashboardList from "./DashboardList";
import { usePersistentState } from "@/lib/db";
import type { Goal } from "@/lib/types";
import { Progress } from "@/components/ui";

type GoalProgress = {
  value: number;
  label: string;
  display?: string;
};

function parseNumber(segment: string): number | null {
  const normalized = segment.replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function deriveGoalProgress(goal: Goal): GoalProgress | null {
  if (goal.done) {
    return {
      value: 100,
      label: `${goal.title} complete`,
      display: goal.metric?.trim(),
    };
  }

  const metric = goal.metric?.trim();
  if (!metric) return null;

  const fractionMatch = metric.match(
    /(-?\d[\d,]*(?:\.\d+)?)\s*\/\s*(-?\d[\d,]*(?:\.\d+)?)/,
  );
  if (fractionMatch) {
    const current = parseNumber(fractionMatch[1]);
    const total = parseNumber(fractionMatch[2]);
    if (current !== null && total !== null && total > 0) {
      return {
        value: (current / total) * 100,
        label: `${goal.title}: ${current}/${total}`,
        display: metric,
      };
    }
  }

  const ofMatch = metric.match(
    /(-?\d[\d,]*(?:\.\d+)?)\s+(?:of|out of)\s+(-?\d[\d,]*(?:\.\d+)?)/i,
  );
  if (ofMatch) {
    const current = parseNumber(ofMatch[1]);
    const total = parseNumber(ofMatch[2]);
    if (current !== null && total !== null && total > 0) {
      return {
        value: (current / total) * 100,
        label: `${goal.title}: ${current} of ${total}`,
        display: metric,
      };
    }
  }

  const percentMatch = metric.match(
    /(-?\d[\d,]*(?:\.\d+)?)\s*(?:%|percent)/i,
  );
  if (percentMatch) {
    const percent = parseNumber(percentMatch[1]);
    if (percent !== null) {
      return {
        value: percent,
        label: `${goal.title}: ${percent}%`,
        display: metric,
      };
    }
  }

  return null;
}

function getGoalStatus(goal: Goal): string {
  return goal.metric?.trim() || goal.notes?.trim() || "No metric yet";
}

export default function GoalsCard() {
  const [goals] = usePersistentState<Goal[]>("goals.v2", []);
  const activeGoals = React.useMemo(
    () => goals.filter((g) => !g.done).slice(0, 3),
    [goals],
  );

  return (
    <DashboardCard
      title="Active goals"
      cta={{ label: "Manage Goals", href: "/goals" }}
    >
      <DashboardList
        items={activeGoals}
        getKey={(goal) => goal.id}
        empty="No active goals"
        cta={{ label: "Create", href: "/goals" }}
        renderItem={(goal) => {
          const progress = deriveGoalProgress(goal);
          const statusText = getGoalStatus(goal);

          return (
            <div>
              <p className="text-ui">{goal.title}</p>
              <div className="mt-[var(--space-2)]">
                {progress ? (
                  <>
                    <Progress value={progress.value} label={progress.label} />
                    {progress.display ? (
                      <p className="mt-[var(--space-1)] text-label text-muted-foreground tabular-nums">
                        {progress.display}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-label text-muted-foreground">{statusText}</p>
                )}
              </div>
            </div>
          );
        }}
      />
    </DashboardCard>
  );
}
