import type { ReactNode } from "react";
import type { Variant } from "@/lib/theme";

export type PlannerOverviewSummaryKey = "focus" | "reviews" | "prompts";

export interface PlannerOverviewSummaryItem {
  key: PlannerOverviewSummaryKey;
  label: string;
  value: string;
  href: string;
  cta: string;
}

export interface PlannerOverviewSummaryProps {
  label: string;
  title: string;
  items: readonly PlannerOverviewSummaryItem[];
}

export interface PlannerOverviewFocusTask {
  id: string;
  title: string;
  projectName: string | null;
  done: boolean;
  toggleLabel: string;
}

export interface PlannerOverviewFocusProps {
  label: string;
  title: string;
  doneCount: number;
  totalCount: number;
  tasks: readonly PlannerOverviewFocusTask[];
  remainingTasks: number;
  onToggleTask: (taskId: string) => void;
}

export interface PlannerOverviewGoalItem {
  id: string;
  title: string;
  detail: string | null;
}

export interface PlannerOverviewGoalsProps {
  label: string;
  title: string;
  completed: number;
  total: number;
  percentage: number;
  active: readonly PlannerOverviewGoalItem[];
  emptyMessage: string;
  allCompleteMessage: string;
}

export interface PlannerOverviewCalendarDay {
  iso: string;
  weekday: string;
  dayNumber: string;
  done: number;
  total: number;
  disabled: boolean;
  loading: boolean;
  selected: boolean;
  today: boolean;
}

export interface PlannerOverviewCalendarProps {
  label: string;
  title: string;
  summary: string;
  doneCount: number;
  totalCount: number;
  hasPlannedTasks: boolean;
  days: readonly PlannerOverviewCalendarDay[];
  onSelectDay: (iso: string) => void;
}

export interface PlannerOverviewProps {
  summary: PlannerOverviewSummaryProps;
  focus: PlannerOverviewFocusProps;
  goals: PlannerOverviewGoalsProps;
  calendar: PlannerOverviewCalendarProps;
}

export interface HomeHeroSectionProps {
  variant: Variant;
  actions?: ReactNode;
  headingId: string;
}
