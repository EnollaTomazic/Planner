"use client";

import * as React from "react";
import { DashboardListCard, type DashboardListCardFooterAction } from "./DashboardListCard";
import { todayISO } from "@/components/planner/plannerSerialization";
import { useDay } from "@/components/planner";

export interface TodayCardProps {
  title?: string;
  emptyMessage?: string;
  listCta?: { label: string; href: string };
  footerAction?: DashboardListCardFooterAction;
  headerAction?: DashboardListCardFooterAction;
  cardClassName?: string;
}

export function TodayCard({
  title = "Today",
  emptyMessage = "No tasks",
  listCta = { label: "Create", href: "/planner" },
  footerAction = { label: "Planner", href: "/planner" },
  headerAction,
  cardClassName,
}: TodayCardProps = {}) {
  const iso = todayISO();
  const { tasks } = useDay(iso);
  const topTasks = React.useMemo(() => tasks.slice(0, 3), [tasks]);

  return (
    <DashboardListCard
      title={title}
      items={topTasks}
      getKey={(task) => task.id}
      itemClassName="flex justify-between text-ui"
      emptyMessage={emptyMessage}
      listCta={listCta}
      headerAction={headerAction}
      renderItem={(task) => (
        <>
          <span>{task.title}</span>
          <span className="text-label text-muted-foreground">Today</span>
        </>
      )}
      footerAction={footerAction}
      cardProps={{ className: cardClassName }}
    />
  );
}
