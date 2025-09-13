// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps } from "./Hero";
import NeomorphicHeroFrame, {
  type NeomorphicHeroFrameProps,
} from "./NeomorphicHeroFrame";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Props forwarded to <Header> */
  header: HeaderProps;
  /** Props forwarded to <Hero> */
  hero: HeroProps;
  /** Optional className for the outer frame */
  className?: string;
  /** Additional props for the outer frame */
  frameProps?: NeomorphicHeroFrameProps;
}

/**
 * PageHeader — combines <Header> and <Hero> within a neomorphic frame.
 *
 * Used for top-of-page introductions with optional actions.
 */
export default function PageHeader({
  header,
  hero,
  className,
  frameProps,
}: PageHeaderProps) {
  return (
    <NeomorphicHeroFrame
      {...frameProps}
      className={cn(
        "rounded-2xl border border-[hsl(var(--border))/0.4] px-6 md:px-7 lg:px-8",
        className,
      )}
    >
      <div className="relative z-[2] space-y-4">
        <Header {...header} />
        <Hero
          {...hero}
          frame={hero.frame ?? false}
          topClassName={cn("top-[var(--header-stack)]", hero.topClassName)}
        />
      </div>
    </NeomorphicHeroFrame>
  );
}
