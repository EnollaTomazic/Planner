"use client";

// src/components/ui/layout/hero/useHeroStyles.ts

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TabBarProps } from "../TabBar";
import styles from "./Hero.module.css";

type HeroTabVariant = Extract<TabBarProps["variant"], "neo">;

export interface HeroStyleOptions {
  frame: boolean;
  sticky: boolean;
  topClassName?: string;
  padding: "default" | "none";
  barVariant: "flat" | "raised";
  tone: "heroic" | "supportive";
  glitch: "default" | "subtle" | "off";
}

export interface HeroStyleResult {
  heroVariant: HeroTabVariant | undefined;
  shouldRenderGlitchStyles: boolean;
  isRaisedBar: boolean;
  showRail: boolean;
  showDividerGlow: boolean;
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
    divider: string;
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
  } = options;

  return React.useMemo(() => {
    const glitchMode: NonNullable<HeroStyleOptions["glitch"]> = glitch ?? "default";
    const isGlitchDefault = glitchMode === "default";
    const isGlitchSubtle = glitchMode === "subtle";
    const isGlitchOff = glitchMode === "off";
    const heroVariant: HeroTabVariant | undefined = frame ? "neo" : undefined;
    const shouldRenderGlitchStyles = frame && isGlitchDefault;
    const isRaisedBar = barVariant === "raised";
    const showRail = false;
    const showDividerGlow = frame && !isGlitchOff;
    const stickyClasses = sticky ? cn("sticky sticky-blur", topClassName) : "";

    const shellPadding =
      padding === "default"
        ? "px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-7)] md:py-[var(--space-7)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]"
        : undefined;

    const shell = cn(
      stickyClasses,
      "mx-auto w-full",
      frame
        ? cn(
            "group/hero relative z-0 isolate overflow-hidden rounded-card r-card-lg border border-border/55 bg-card/70 text-foreground shadow-outline-subtle hero2-frame hero2-neomorph",
            "before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:content-['']",
            "before:bg-glitch-overlay before:opacity-[var(--hero-glitch-overlay-opacity,0.38)] before:mix-blend-soft-light",
            "motion-reduce:before:opacity-[calc(var(--hero-glitch-overlay-opacity,0.38)*0.75)]",
            shellPadding,
          )
        : padding === "default"
          ? "px-[var(--space-2)] sm:px-[var(--space-4)] lg:px-[var(--space-5)]"
          : undefined,
    );

    const bar = frame
      ? "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-4)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-6)]"
      : "relative z-[2] grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-y-[var(--space-2)] md:gap-y-0 md:gap-x-[var(--space-4)] lg:gap-x-[var(--space-5)] py-[var(--space-4)] md:py-[var(--space-5)]";

    const slotWellSurface = cn(
      "group/hero-slot relative isolate flex w-full min-w-0 flex-col gap-[var(--space-2)] overflow-hidden rounded-card r-card-lg border border-border/45 bg-card/70 px-[var(--space-4)] py-[var(--space-3)] text-foreground",
      "[--neo-inset-shadow:var(--depth-shadow-inner)] neo-inset hero-focus transition-[box-shadow,transform] duration-motion-md ease-out",
      "motion-reduce:transform-none motion-reduce:transition-none focus-within:ring-1 focus-within:ring-ring/60",
      "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-[''] before:rounded-[inherit] before:bg-hero-slot-highlight before:opacity-70 before:mix-blend-screen",
      "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:content-[''] after:rounded-[inherit] after:translate-x-[calc(var(--space-1)/2)] after:translate-y-[calc(var(--space-1)/2)] after:bg-hero-slot-shadow after:shadow-[var(--hero-slot-shadow,var(--depth-shadow-soft))] after:opacity-65",
      "hover:[--neo-inset-shadow:var(--depth-shadow-soft)] focus-visible:[--neo-inset-shadow:var(--depth-shadow-soft)] focus-within:[--neo-inset-shadow:var(--depth-shadow-soft)]",
      "hover:-translate-y-[var(--hairline-w)] focus-visible:-translate-y-[var(--hairline-w)] focus-within:-translate-y-[var(--hairline-w)]",
    );

    const baseSearchWell = "w-full min-w-0 md:flex-1";

    const searchWell = frame
      ? cn(slotWellSurface, baseSearchWell)
      : baseSearchWell;

    const baseActionWell = "w-full md:w-auto";

    const baseActionCluster =
      "flex w-full flex-wrap items-center gap-[var(--space-2)] md:w-auto md:flex-nowrap";

    const actionsWell = frame
      ? cn(
          slotWellSurface,
          "flex-row flex-wrap gap-[var(--space-2)] md:flex-nowrap md:items-center md:justify-end md:gap-[var(--space-3)]",
        )
      : baseActionWell;

    const actionCluster = frame
      ? "flex w-full flex-wrap items-center gap-[var(--space-2)] md:flex-nowrap md:justify-end"
      : baseActionCluster;

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
      "z-0 overflow-hidden rounded-card r-card-lg border border-border/45 bg-card/70 px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-4)] text-foreground shadow-depth-soft backdrop-blur-md hero2-frame hero2-neomorph",
    );

    const utilities = cn(
      "col-span-full flex w-full min-w-0 justify-start md:col-span-4 md:w-auto md:justify-end",
      "flex-wrap items-start gap-[var(--space-2)] md:flex-nowrap md:items-center",
    );

    const body = frame
      ? "relative z-[2] mt-[var(--space-5)] md:mt-[var(--space-6)] flex flex-col gap-[var(--space-5)] md:gap-[var(--space-6)]"
      : "relative z-[2] mt-[var(--space-4)] md:mt-[var(--space-5)] flex flex-col gap-[var(--space-4)] md:gap-[var(--space-5)]";

    const actionRow = frame
      ? "flex w-full min-w-0 flex-wrap items-start gap-[var(--space-4)] md:flex-nowrap md:items-center md:justify-between md:gap-[var(--space-5)] lg:gap-[var(--space-6)] pt-[var(--space-5)] md:pt-[var(--space-6)]"
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

    const railClassName = "";

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
        divider: styles.divider,
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
  ]);
}

