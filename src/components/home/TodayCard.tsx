"use client";

import Link from "next/link";
import * as React from "react";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import {
  todayISO,
  type DayRecord,
  type ISODate,
} from "@/components/planner/plannerStore";
import { CircleSlash } from "lucide-react";

export default function TodayCard() {
  const [days] = usePersistentState<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
  );
  const tasks = React.useMemo(() => days[todayISO()]?.tasks ?? [], [days]);
  const topTasks = tasks.slice(0, 3);

  return (
    <DashboardCard title="Today" cta={{ label: "Planner", href: "/planner" }}>
      <ul className="divide-y divide-[hsl(var(--border))]">
        {topTasks.map((t) => (
          <li key={t.id} className="flex justify-between py-2 text-sm">
            <span>{t.title}</span>
            <span className="text-xs text-muted-foreground">Today</span>
          </li>
        ))}
        {topTasks.length === 0 && (
          <li className="flex justify-between py-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CircleSlash className="size-3" />
              No tasks
            </span>
            <Link href="/planner" className="text-xs underline">
              Create
            </Link>
          </li>
        )}
      </ul>
    </DashboardCard>
  );
}
