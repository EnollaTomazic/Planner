"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import DashboardList from "./DashboardList";
import { usePersistentState } from "@/lib/db";
import {
  todayISO,
  type DayRecord,
  type ISODate,
} from "@/components/planner/plannerStore";

export default function TodayCard() {
  const [days] = usePersistentState<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
  );
  const tasks = React.useMemo(() => days[todayISO()]?.tasks ?? [], [days]);
  const topTasks = tasks.slice(0, 3);

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
