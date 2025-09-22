"use client";

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
    searchWell: string;
    actionsWell: string;
    actionCluster: string;
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
    const glitchMode: NonNullable<HeroStyleOptions["glitch"]> = glitch ?? "subtle";
    const isGlitchDefault = glitchMode === "default";
    const isGlitchSubtle = glitchMode === "subtle";
    const isGlitchOff = glitchMode === "off";
    const heroVariant: HeroTabVariant | undefined = frame ? "neo" : undefined;
    const shouldRenderGlitchStyles = frame && isGlitchDefault;
    const isRaisedBar = barVariant === "raised";
    const showRail = rail && !isGlitchOff;
    const showDividerGlow = frame && !isGlitchOff;
    const dividerStyle = {
      "--divider": dividerTint === "life" ? "var(--accent-3)" : "var(--ring)",
    } as React.CSSProperties;

    const stickyClasses = sticky ? cn("sticky sticky-blur", topClassName) : "";

    const shellPadding =
      padding === "default"
        ? "px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-7)] md:py-[var(--space-7)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]"
        : undefined;

    const shell = cn(
      stickyClasses,
      frame
        ? cn(
            "group/hero relative z-0 isolate overflow-hidden hero-focus",
            "rounded-3xl border border-[hsl(var(--border)/0.18)] ring-1 ring-inset ring-white/5 text-foreground shadow-[0_12px_32px_hsl(var(--shadow))] focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-inset hero2-frame hero2-neomorph",
            shellPadding,
          )
        : padding === "default"
          ? "px-[var(--space-2)] sm:px-[var(--space-4)] lg:px-[var(--space-5)]"
          : undefined,
    );

    const bar = frame
      ? "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-4)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-6)]"
      : "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-2)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-5)] py-[var(--space-4)] md:py-[var(--space-5)]";

    const baseSearchWell = "w-full min-w-0 md:flex-1";

    const searchWell = frame
      ? cn(baseSearchWell, "flex flex-col gap-[var(--space-2)]")
      : baseSearchWell;

    const baseActionWell = "w-full md:w-auto";

    const baseActionCluster =
      "flex w-full flex-wrap items-center gap-[var(--space-2)] md:w-auto md:flex-nowrap";

    const actionsWell = frame
      ? cn(
          baseActionWell,
          "flex flex-wrap items-center gap-[var(--space-2)] md:flex-nowrap md:justify-end",
        )
      : baseActionWell;

    const actionCluster = frame
      ? "flex w-full flex-wrap items-center gap-[var(--space-2)] md:flex-nowrap md:justify-end"
      : baseActionCluster;

    const clusterGapClass = frame
      ? "gap-[var(--space-4)] md:gap-[var(--space-5)]"
      : "gap-[var(--space-2)] md:gap-[var(--space-4)]";

    const plateSurface =
      "hero2-frame rounded-2xl border border-[hsl(var(--border)/0.18)] bg-[hsl(var(--control))] text-foreground shadow-[inset_0_1px_0_hsl(var(--highlight)/0.12),inset_0_-12px_24px_hsl(var(--inset)/0.35)] transition-shadow duration-[var(--dur-chill)] ease-[var(--ease-out)] has-[:focus-visible]:shadow-[inset_0_0_0_1px_hsl(var(--ring)/0.55),inset_0_-12px_24px_hsl(var(--inset)/0.4)]";

    const labelCluster = cn(
      "relative col-span-full md:col-span-8 flex min-w-0 flex-wrap items-start md:flex-nowrap",
      isRaisedBar ? "md:items-stretch" : "md:items-center",
      clusterGapClass,
    );

    const raisedLabelBar = cn(
      "flex w-full min-w-0 flex-wrap items-start md:flex-nowrap md:items-center",
      clusterGapClass,
      plateSurface,
      "px-[var(--space-3)] py-[var(--space-3)] md:px-[var(--space-4)] md:py-[var(--space-4)]",
    );

    const utilities = cn(
      "col-span-full flex w-full min-w-0 justify-start md:col-span-4 md:w-auto md:justify-end",
      "flex-wrap items-start gap-[var(--space-2)] md:flex-nowrap md:items-center",
    );

    const body = frame
      ? "relative z-[2] mt-[var(--space-5)] md:mt-[var(--space-6)] flex flex-col gap-[var(--space-5)] md:gap-[var(--space-6)]"
      : "relative z-[2] mt-[var(--space-4)] md:mt-[var(--space-5)] flex flex-col gap-[var(--space-4)] md:gap-[var(--space-5)]";

    const actionRow = frame
      ? cn(
          "flex w-full min-w-0 flex-wrap items-start gap-[var(--space-4)] md:flex-nowrap md:items-center md:justify-between md:gap-[var(--space-5)] lg:gap-[var(--space-6)]",
          plateSurface,
          "px-[var(--space-3)] py-[var(--space-3)] md:px-[var(--space-4)] md:py-[var(--space-4)]",
        )
      : "flex w-full min-w-0 flex-wrap items-start gap-[var(--space-2)] md:flex-nowrap md:items-center md:justify-between md:gap-[var(--space-4)] lg:gap-[var(--space-5)] pt-[var(--space-4)] md:pt-[var(--space-5)]";

    const heading = cn(
      "font-semibold tracking-[-0.01em] text-balance break-words text-foreground",
      tone === "supportive"
        ? "text-title md:text-title"
        : "text-title-lg md:text-title-lg",
      frame && !isGlitchOff && "hero2-title",
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
        searchWell,
        actionsWell,
        actionCluster,
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

