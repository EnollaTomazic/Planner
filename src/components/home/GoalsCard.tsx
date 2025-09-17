"use client";

import Link from "next/link";
import * as React from "react";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import type { Goal } from "@/lib/types";
import { Progress } from "@/components/ui";
import { CircleSlash } from "lucide-react";

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
      <ul className="divide-y divide-[hsl(var(--border))]">
        {activeGoals.map((g) => {
          const progress = deriveGoalProgress(g);
          const statusText = getGoalStatus(g);

          return (
            <li key={g.id} className="py-[var(--space-2)]">
              <p className="text-ui">{g.title}</p>
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
            </li>
          );
        })}
        {activeGoals.length === 0 && (
          <li className="flex justify-between py-[var(--space-2)] text-ui text-muted-foreground">
            <span className="flex items-center gap-[var(--space-2)]">
              <CircleSlash className="size-3" />
              No active goals
            </span>
            <Link
              href="/goals"
              className="inline-flex items-center text-label font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-foreground active:text-accent active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-reduce:transition-none"
            >
              Create
            </Link>
          </li>
        )}
      </ul>
    </DashboardCard>
  );
}
