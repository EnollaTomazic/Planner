"use client";

import * as React from "react";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/ui";
import WelcomeHeroFigure from "../WelcomeHeroFigure";
import type { HomeHeroSectionProps } from "./types";

const subtleVariants = new Set(["noir"]);

export default function HomeHeroSection({ variant, actions }: HomeHeroSectionProps) {
  const haloTone = React.useMemo(
    () => (subtleVariants.has(variant) ? "subtle" : "default"),
    [variant],
  );
  const showGlitchRail = React.useMemo(
    () => !subtleVariants.has(variant),
    [variant],
  );

  return (
    <section
      id="landing-hero"
      role="region"
      aria-label="Intro"
      className="grid grid-cols-12 gap-[var(--space-4)] pb-[var(--space-2)] md:pb-[var(--space-3)]"
      data-theme-variant={variant}
    >
      <div className="col-span-12">
        <PageHeader
          header={{
            id: "home-header",
            heading: "Welcome to Planner",
            subtitle: "Plan your day, track goals, and review games.",
            icon: <Home className="text-muted-foreground" />,
            sticky: false,
            barClassName: "flex-wrap gap-y-[var(--space-3)] md:flex-nowrap",
            right: (
              <div className="flex basis-full justify-center md:basis-auto md:justify-end">
                <WelcomeHeroFigure
                  className="w-full max-w-[calc(var(--space-7)*5)] md:w-[calc(var(--space-7)*5)] lg:w-[calc(var(--space-7)*6)]"
                  haloTone={haloTone}
                  showGlitchRail={showGlitchRail}
                />
              </div>
            ),
          }}
          hero={{
            heading: "Your day at a glance",
            sticky: false,
            barVariant: "raised",
            glitch: "subtle",
            topClassName: "top-[var(--header-stack)]",
            actions: (
              <div className="flex w-full flex-wrap items-center justify-end gap-[var(--space-2)] sm:flex-nowrap">
                {actions}
              </div>
            ),
          }}
        />
      </div>
    </section>
  );
}
