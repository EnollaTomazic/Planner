// src/components/ui/layout/NeomorphicHeroFrame.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

type FrameElement = Extract<
  keyof JSX.IntrinsicElements,
  "div" | "header" | "section" | "nav" | "article" | "aside" | "main"
>;

export type NeomorphicHeroFrameVariant = "neo" | "plain" | "ghost";
export type NeomorphicHeroFrameDensity = "default" | "compact" | "flush";

export interface NeomorphicHeroFrameProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Semantic element for the frame container. */
  as?: FrameElement;
  /** Visual styling variant. */
  variant?: NeomorphicHeroFrameVariant;
  /** Padding density. */
  density?: NeomorphicHeroFrameDensity;
  /** Wrapper classes for the internal grid layout. */
  contentClassName?: string;
  /** Optional lead slot (hero heading, breadcrumbs, etc.). */
  lead?: React.ReactNode;
  leadClassName?: string;
  /** Classes applied to the body slot that wraps `children`. */
  bodyClassName?: string;
  /** Optional segmented controls rendered beneath the lead. */
  tabs?: React.ReactNode;
  tabsClassName?: string;
  /** Supplemental actions (buttons, icon buttons, etc.). */
  actions?: React.ReactNode;
  actionsClassName?: string;
  /** Optional search region rendered alongside actions. */
  search?: React.ReactNode;
  searchClassName?: string;
  /** Footer region for secondary notes or metadata. */
  footer?: React.ReactNode;
  footerClassName?: string;
}

const densityClasses: Record<NeomorphicHeroFrameDensity, string> = {
  default: "px-6 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8",
  compact: "px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6",
  flush: "p-0",
};

const variantClasses: Record<NeomorphicHeroFrameVariant, string> = {
  neo: "hero2-neomorph border border-border/40",
  plain: "bg-card/70 border border-border/35 backdrop-blur-sm",
  ghost: "bg-card/20 border border-border/30 backdrop-blur-sm",
};

const variantRing: Partial<Record<NeomorphicHeroFrameVariant, string>> = {
  neo: "absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-border/55",
  plain: "absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-border/35",
};

const baseGridClass =
  "relative z-[2] grid gap-y-5 md:gap-y-6 md:grid-cols-12 md:gap-x-6";

const NeomorphicHeroFrame = React.forwardRef<
  HTMLElement,
  NeomorphicHeroFrameProps
>(
  (
    {
      as,
      variant = "neo",
      density = "default",
      contentClassName,
      lead,
      leadClassName,
      bodyClassName,
      tabs,
      tabsClassName,
      actions,
      actionsClassName,
      search,
      searchClassName,
      footer,
      footerClassName,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const ComponentTag = (as ?? "div") as FrameElement;
    const Component = ComponentTag as unknown as React.ElementType;
    const showTextures = variant === "neo";
    const hasSearch = search != null;
    const hasActions = actions != null;

    const wrapChildren =
      lead != null ||
      tabs != null ||
      hasSearch ||
      hasActions ||
      footer != null ||
      contentClassName != null ||
      bodyClassName != null;

    const leadNode = lead ? (
      <div className={cn("md:col-span-12", leadClassName)} data-slot="lead">
        {lead}
      </div>
    ) : null;

    const tabsNode = tabs ? (
      <div
        className={cn(
          "md:col-span-12 flex flex-wrap items-center gap-3",
          tabsClassName,
        )}
        data-slot="tabs"
      >
        {tabs}
      </div>
    ) : null;

    const bodyNode = children != null ? (
      <div className={cn("md:col-span-12", bodyClassName)} data-slot="body">
        {children}
      </div>
    ) : null;

    const searchNode = hasSearch ? (
      <div
        className={cn(
          "flex w-full flex-col gap-3",
          hasActions ? "md:col-span-7" : "md:col-span-12",
          searchClassName,
        )}
        data-slot="search"
      >
        {search}
      </div>
    ) : null;

    const actionsNode = hasActions ? (
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-2 md:justify-end",
          hasSearch ? "md:col-span-5" : "md:col-span-12",
          actionsClassName,
        )}
        data-slot="actions"
      >
        {actions}
      </div>
    ) : null;

    const footerNode = footer ? (
      <div
        className={cn("md:col-span-12", footerClassName)}
        data-slot="footer"
      >
        {footer}
      </div>
    ) : null;

    const structuredContent = (
      <div className={cn(baseGridClass, contentClassName)}>
        {leadNode}
        {tabsNode}
        {bodyNode}
        {searchNode}
        {actionsNode}
        {footerNode}
      </div>
    );

    return (
      <>
        <NeomorphicFrameStyles />
        <Component
          ref={ref}
          data-variant={variant}
          data-density={density}
          className={cn(
            "relative overflow-hidden rounded-card r-card-lg",
            densityClasses[density],
            variantClasses[variant],
            className,
          )}
          {...rest}
        >
          {showTextures ? (
            <>
              <span aria-hidden className="hero2-beams" />
              <span aria-hidden className="hero2-scanlines" />
              <span aria-hidden className="hero2-noise opacity-[0.03]" />
            </>
          ) : null}
          {wrapChildren ? structuredContent : children}
          {variantRing[variant] ? (
            <div aria-hidden className={variantRing[variant]} />
          ) : null}
        </Component>
      </>
    );
  },
);

NeomorphicHeroFrame.displayName = "NeomorphicHeroFrame";

export default NeomorphicHeroFrame;
