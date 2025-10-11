"use client";

import * as React from "react";
import { DashboardCard } from "./DashboardCard";
import { DashboardList } from "./DashboardList";
import { todayISO } from "@/components/planner/plannerSerialization";
import { useDay } from "@/components/planner";

export function TodayCard() {
  const iso = todayISO();
  const { tasks } = useDay(iso);
  const topTasks = React.useMemo(() => tasks.slice(0, 3), [tasks]);

  return (
    <DashboardCard title="Today" cta={{ label: "Planner", href: "/planner" }}>
      <DashboardList
        items={topTasks}
        getKey={(task) => task.id}
        itemClassName="flex justify-between text-ui"
        empty="No tasks"
        cta={{ label: "Create", href: "/planner" }}
        renderItem={(task) => (
          <>
            <span>{task.title}</span>
            <span className="text-label text-muted-foreground">Today</span>
          </>
        )}
      />
    </DashboardCard>
  );
}
