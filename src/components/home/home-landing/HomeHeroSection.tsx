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
              <div className="flex basis-full items-center justify-center md:basis-auto md:justify-end md:pl-[var(--space-3)]">
                <WelcomeHeroFigure
                  className="w-full max-w-[calc(var(--space-8)*4)] md:max-w-[calc(var(--space-8)*4.5)] lg:max-w-[calc(var(--space-8)*5)]"
                  haloTone={haloTone}
                  showGlitchRail={showGlitchRail}
                  framed={false}
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
              <div className="flex w-full flex-wrap items-center justify-center gap-[var(--space-2)] sm:flex-nowrap sm:justify-end">
                {actions}
              </div>
            ),
          }}
        />
      </div>
    </section>
  );
}
