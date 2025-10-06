"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import DashboardList from "./DashboardList";
import { useGoals } from "@/components/goals";
import type { Goal } from "@/lib/types";
import { Progress } from "@/components/ui";

type GoalProgress = {
  value: number;
  label: string;
  display?: string;
};

type ParsedMetric = {
  value: number;
  labelSuffix: string;
  display: string;
};

function parseNumber(segment: string): number | null {
  const normalized = segment.replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parses metrics formatted as "current/total".
 */
function parseFraction(metric: string): ParsedMetric | null {
  const fractionMatch = metric.match(
    /(-?\d[\d,]*(?:\.\d+)?)\s*\/\s*(-?\d[\d,]*(?:\.\d+)?)/,
  );
  if (!fractionMatch) return null;

  const current = parseNumber(fractionMatch[1]);
  const total = parseNumber(fractionMatch[2]);
  if (current === null || total === null || total <= 0) {
    return null;
  }

  return {
    value: (current / total) * 100,
    labelSuffix: `${current}/${total}`,
    display: metric,
  };
}

/**
 * Parses metrics formatted as "current of total" or "current out of total".
 */
function parseOfFormat(metric: string): ParsedMetric | null {
  const ofMatch = metric.match(
    /(-?\d[\d,]*(?:\.\d+)?)\s+(?:of|out of)\s+(-?\d[\d,]*(?:\.\d+)?)/i,
  );
  if (!ofMatch) return null;

  const current = parseNumber(ofMatch[1]);
  const total = parseNumber(ofMatch[2]);
  if (current === null || total === null || total <= 0) {
    return null;
  }

  return {
    value: (current / total) * 100,
    labelSuffix: `${current} of ${total}`,
    display: metric,
  };
}

/**
 * Parses metrics formatted as percentages.
 */
function parsePercentage(metric: string): ParsedMetric | null {
  const percentMatch = metric.match(/(-?\d[\d,]*(?:\.\d+)?)\s*(?:%|percent)/i);
  if (!percentMatch) return null;

  const percent = parseNumber(percentMatch[1]);
  if (percent === null) {
    return null;
  }

  return {
    value: percent,
    labelSuffix: `${percent}%`,
    display: metric,
  };
}

const metricParsers = [parseFraction, parseOfFormat, parsePercentage] as const;

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

  for (const parser of metricParsers) {
    const parsed = parser(metric);
    if (parsed) {
      return {
        value: parsed.value,
        label: `${goal.title}: ${parsed.labelSuffix}`,
        display: parsed.display,
      };
    }
  }

  return null;
}

function getGoalStatus(goal: Goal): string {
  return goal.metric?.trim() || goal.notes?.trim() || "No metric yet";
}

export default function GoalsCard() {
  const { goals } = useGoals();
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

export { deriveGoalProgress, parseFraction, parseOfFormat, parsePercentage };
