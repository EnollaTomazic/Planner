import * as React from "react";
import { PageHeader, Button, ThemeToggle } from "@/components/ui";
import { Home } from "lucide-react";

export default function PageHeaderDemo() {
  return (
    <PageHeader
      className="px-6 md:px-7 lg:px-8"
      header={{
        heading: "Welcome to Planner",
        subtitle: "Plan your day, track goals, and review games.",
        icon: <Home className="opacity-70" />,
        sticky: false,
        rail: false,
        barClassName: "p-0",
      }}
      hero={{
        heading: "Your day at a glance",
        actions: (
          <>
            <ThemeToggle className="shrink-0" />
            <Button variant="primary" size="sm" className="px-4 whitespace-nowrap">
              Plan Week
            </Button>
          </>
        ),
        sticky: false,
        topClassName: "top-0",
        barClassName: "p-0",
      }}
    />
  );
}
