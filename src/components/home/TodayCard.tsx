"use client";

import * as React from "react";
import { DashboardListCard } from "./DashboardListCard";
import { todayISO } from "@/components/planner/plannerSerialization";
import { useDay } from "@/components/planner";

export function TodayCard() {
  const iso = todayISO();
  const { tasks } = useDay(iso);
  const topTasks = React.useMemo(() => tasks.slice(0, 3), [tasks]);

  return (
    <DashboardListCard
      title="Today"
      items={topTasks}
      getKey={(task) => task.id}
      itemClassName="flex justify-between text-ui"
      emptyMessage="No tasks"
      listCta={{ label: "Create", href: "/planner" }}
      renderItem={(task) => (
        <>
          <span>{task.title}</span>
          <span className="text-label text-muted-foreground">Today</span>
        </>
      )}
      footerAction={{
        label: "Planner",
        href: "/planner",
      }}
    />
  );
}
