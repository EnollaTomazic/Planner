// src/components/ui/layout/PageHero.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Hero, type HeroProps } from "./Hero";

export type PageHeroAccent = "primary" | "life" | "supportive";

const ACCENT_DEFAULTS: Record<PageHeroAccent, Pick<HeroProps, "tone" | "dividerTint">> = {
  primary: { tone: "heroic", dividerTint: "primary" },
  life: { tone: "heroic", dividerTint: "life" },
  supportive: { tone: "supportive", dividerTint: "primary" },
};

export interface PageHeroProps<Key extends string = string>
  extends Omit<HeroProps<Key>, "heading" | "title"> {
  /** Accent palette applied to the divider glow + typography tone. */
  accent?: PageHeroAccent;
  /** Title rendered inside the hero. */
  title: NonNullable<HeroProps<Key>["title"]>;
}

export function PageHero<Key extends string = string>({
  accent = "primary",
  tone: toneProp,
  dividerTint: dividerTintProp,
  className,
  frame = true,
  sticky = false,
  glitch = "subtle",
  ...props
}: PageHeroProps<Key>) {
  const accentDefaults = ACCENT_DEFAULTS[accent] ?? ACCENT_DEFAULTS.primary;
  const tone = toneProp ?? accentDefaults.tone;
  const dividerTint = dividerTintProp ?? accentDefaults.dividerTint;

  return (
    <Hero
      {...props}
      frame={frame}
      sticky={sticky}
      glitch={glitch}
      tone={tone}
      dividerTint={dividerTint}
      className={cn("col-span-full md:col-span-12", className)}
    />
  );
}
