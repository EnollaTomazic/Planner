import * as React from "react";
import {
  PageHeader,
  Header,
  Button,
  ThemeToggle,
  type HeaderTab,
} from "@/components/ui";

type MinimalTab = "overview" | "schedule" | "insights";

const minimalTabs: HeaderTab<MinimalTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Schedule" },
  { key: "insights", label: "Insights" },
];

const tabCopy: Record<MinimalTab, string> = {
  overview: "Track meetings, reviews, and highlights in one streamlined view.",
  schedule: "Preview your agenda and slot new scrim blocks without leaving the dashboard.",
  insights: "Surface trends and callouts tailored to your current sprint focus.",
};

export default function PageHeaderDemo() {
  const [activeTab, setActiveTab] = React.useState<MinimalTab>("overview");

  return (
    <div className="space-y-6">
      <Header
        variant="minimal"
        eyebrow="Planner"
        heading="Minimal Header"
        subtitle="Lean chrome with neon focus"
        sticky={false}
        topClassName="top-0"
        rail={false}
        right={<ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />}
        tabs={{
          items: minimalTabs,
          value: activeTab,
          onChange: setActiveTab,
          ariaLabel: "Switch dashboard view",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">{tabCopy[activeTab]}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">
              Invite teammate
            </Button>
            <Button size="sm" variant="primary">
              Create objective
            </Button>
          </div>
        </div>
      </Header>

      <PageHeader
        id="page-header-demo"
        aria-labelledby="page-header-demo-heading"
        header={{
          heading: (
            <span id="page-header-demo-heading">Welcome to Planner</span>
          ),
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
              <Button
                variant="primary"
                size="sm"
                className="px-4 whitespace-nowrap"
              >
                Plan Week
              </Button>
            </>
          ),
          sticky: false,
          topClassName: "top-0",
          barClassName: "p-0",
        }}
      />
    </div>
  );
}
