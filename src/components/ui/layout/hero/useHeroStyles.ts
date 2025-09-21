// src/components/ui/layout/hero/useHeroStyles.ts

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TabBarProps } from "../TabBar";

type HeroTabVariant = Extract<TabBarProps["variant"], "neo">;

export interface HeroStyleOptions {
  frame: boolean;
  sticky: boolean;
  topClassName?: string;
  padding: "default" | "none";
  barVariant: "flat" | "raised";
  tone: "heroic" | "supportive";
  glitch: "default" | "subtle" | "off";
  dividerTint: "primary" | "life";
  rail: boolean;
}

export interface HeroStyleResult {
  heroVariant: HeroTabVariant | undefined;
  shouldRenderGlitchStyles: boolean;
  isRaisedBar: boolean;
  showRail: boolean;
  showDividerGlow: boolean;
  dividerStyle: React.CSSProperties;
  classes: {
    shell: string;
    bar: string;
    labelCluster: string;
    raisedLabelBar: string;
    utilities: string;
    body: string;
    actionRow: string;
    heading: string;
    subtitle: string;
    rail: string;
    dividerLine: string;
    dividerGlow: string;
  };
}

export function useHeroStyles(options: HeroStyleOptions): HeroStyleResult {
  const {
    frame,
    sticky,
    topClassName,
    padding,
    barVariant,
    tone,
    glitch,
    dividerTint,
    rail,
  } = options;

  return React.useMemo(() => {
    const glitchMode = glitch ?? "default";
    const isGlitchSubtle = glitchMode === "subtle";
    const isGlitchOff = glitchMode === "off";
    const isGlitchCalm = isGlitchSubtle || isGlitchOff;
    const heroVariant: HeroTabVariant | undefined = frame ? "neo" : undefined;
    const shouldRenderGlitchStyles = frame && !isGlitchCalm;
    const isRaisedBar = barVariant === "raised";
    const showRail = rail && !isGlitchOff;
    const showDividerGlow = frame && !isGlitchOff;
    const dividerStyle = {
      "--divider": dividerTint === "life" ? "var(--accent)" : "var(--ring)",
    } as React.CSSProperties;

    const stickyClasses = sticky ? cn("sticky sticky-blur", topClassName) : "";

    const shell = cn(
      stickyClasses,
      frame
        ? "relative overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))/0.4] hero2-frame hero2-neomorph"
        : undefined,
      frame
        ? padding === "default"
          ? "px-[var(--space-6)]"
          : undefined
        : padding === "default"
          ? "px-[var(--space-2)] sm:px-[var(--space-4)] lg:px-[var(--space-5)]"
          : undefined,
    );

    const bar = frame
      ? "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-4)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-6)] py-[var(--space-4)] md:py-[var(--space-5)]"
      : "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-2)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-5)] py-[var(--space-4)] md:py-[var(--space-5)]";

    const clusterGapClass = frame
      ? "gap-[var(--space-4)] md:gap-[var(--space-5)]"
      : "gap-[var(--space-2)] md:gap-[var(--space-4)]";

    const labelCluster = cn(
      "relative col-span-full md:col-span-8 flex min-w-0 flex-wrap items-start md:flex-nowrap",
      isRaisedBar ? "md:items-stretch" : "md:items-center",
      clusterGapClass,
    );

    const raisedLabelBar = cn(
      "flex w-full min-w-0 flex-wrap items-start md:flex-nowrap md:items-center",
      clusterGapClass,
      "overflow-hidden rounded-card r-card-lg border border-[hsl(var(--border))/0.45] bg-card/70 px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-4)] shadow-neoSoft backdrop-blur-md hero2-frame hero2-neomorph",
    );

    const utilities = cn(
      "col-span-full flex w-full min-w-0 justify-start md:col-span-4 md:w-auto md:justify-end",
      "flex-wrap items-start gap-[var(--space-2)] md:flex-nowrap md:items-center",
    );

    const body = frame
      ? "relative z-[2] mt-[var(--space-5)] md:mt-[var(--space-6)] flex flex-col gap-[var(--space-5)] md:gap-[var(--space-6)]"
      : "relative z-[2] mt-[var(--space-4)] md:mt-[var(--space-5)] flex flex-col gap-[var(--space-4)] md:gap-[var(--space-5)]";

    const actionRow = frame
      ? "flex flex-wrap items-start gap-[var(--space-4)] md:flex-nowrap md:items-center md:gap-[var(--space-5)] lg:gap-[var(--space-6)] pt-[var(--space-5)] md:pt-[var(--space-6)]"
      : "flex flex-wrap items-start gap-[var(--space-2)] md:flex-nowrap md:items-center md:gap-[var(--space-4)] lg:gap-[var(--space-5)] pt-[var(--space-4)] md:pt-[var(--space-5)]";

    const heading = cn(
      "font-semibold tracking-[-0.01em] text-balance break-words text-foreground",
      tone === "supportive"
        ? "text-title md:text-title"
        : "text-title-lg md:text-title-lg",
    );

    const subtitle = cn(
      "text-ui md:text-body text-muted-foreground break-words",
      tone === "supportive" ? "font-normal" : "font-medium",
    );

    const railClassName = cn(
      "header-rail",
      "pointer-events-none absolute left-0 top-[var(--space-1)] bottom-[var(--space-1)] w-[var(--space-2)] rounded-l-2xl",
      isGlitchSubtle && "header-rail--subtle",
    );

    const dividerLine = cn(
      "block h-px",
      frame
        ? isGlitchOff
          ? "hero2-divider-line bg-[hsl(var(--divider))/0.18]"
          : isGlitchSubtle
            ? "hero2-divider-line bg-[hsl(var(--divider))/0.24]"
            : "hero2-divider-line bg-[hsl(var(--divider))/0.35]"
        : "bg-[hsl(var(--divider))/0.28]",
    );

    const dividerGlow = cn(
      "hero2-divider-glow absolute inset-x-0 top-0 h-px bg-[hsl(var(--divider))]",
      isGlitchSubtle ? "opacity-35" : "opacity-60",
    );

    return {
      heroVariant,
      shouldRenderGlitchStyles,
      isRaisedBar,
      showRail,
      showDividerGlow,
      dividerStyle,
      classes: {
        shell,
        bar,
        labelCluster,
        raisedLabelBar,
        utilities,
        body,
        actionRow,
        heading,
        subtitle,
        rail: railClassName,
        dividerLine,
        dividerGlow,
      },
    } satisfies HeroStyleResult;
  }, [
    frame,
    sticky,
    topClassName,
    padding,
    barVariant,
    tone,
    glitch,
    dividerTint,
    rail,
  ]);
}

