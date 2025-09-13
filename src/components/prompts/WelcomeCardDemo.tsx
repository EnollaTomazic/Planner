import * as React from "react";
import { Header, Hero, Button, ThemeToggle } from "@/components/ui";
import { Home } from "lucide-react";

export default function WelcomeCardDemo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))/0.4] px-6 md:px-7 lg:px-8 shadow-[0_8px_24px_-12px_hsl(var(--accent)/0.35),inset_0_1px_0_hsl(var(--highlight)/0.6)] bg-[linear-gradient(180deg,hsl(var(--card)/0.9),hsl(var(--card)/0.85))] space-y-4">
      <Header
        heading="Welcome to Planner"
        subtitle="Plan your day, track goals, and review games."
        icon={<Home className="opacity-70" />}
        sticky={false}
        rail={false}
        barClassName="p-0"
      />
      <Hero
        frame={false}
        heading="Your day at a glance"
        actions={
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
        }
        sticky={false}
        topClassName="top-0"
        barClassName="p-0"
      />
    </div>
  );
}
