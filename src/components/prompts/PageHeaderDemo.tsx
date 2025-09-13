import * as React from "react";
import { PageHeader, Button, ThemeToggle } from "@/components/ui";

export default function PageHeaderDemo() {
  return (
    <PageHeader
      header={{
        heading: "Welcome to Planner",
        subtitle: "Plan your day, track goals, and review games.",
        icon: (
          <img
            src="https://chatgpt.com/backend-api/estuary/content?id=file-PYBH1vD28Bzi3KruKxaiXa&ts=488268&p=fs&cid=1&sig=1e357c5433df95c196bb9530996ae68bb6ef1b29fde1a5dc741cdc1fce727ecb&v=0"
            alt=""
            className="h-12 w-auto object-contain"
          />
        ),
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
