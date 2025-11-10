"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "./Card";
import { DashboardList } from "./DashboardList";
import { todayISO } from "@/components/planner/plannerSerialization";
import { useDay } from "@/components/planner";
import { Button } from "@/components/ui";
import { withBasePath } from "@/lib/utils";

export function TodayCard() {
  const iso = todayISO();
  const { tasks } = useDay(iso);
  const topTasks = React.useMemo(() => tasks.slice(0, 3), [tasks]);

  return (
    <Card>
      <Card.Header title="Today" />
      <Card.Body className="text-card-foreground">
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
      </Card.Body>
      <Card.Footer className="flex justify-end text-card-foreground">
        <Button asChild size="sm" variant="default">
          <Link href={withBasePath("/planner", { skipForNextLink: true })}>
            Planner
          </Link>
        </Button>
      </Card.Footer>
    </Card>
  );
}
