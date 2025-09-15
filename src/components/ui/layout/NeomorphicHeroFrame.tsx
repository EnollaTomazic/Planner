// src/components/ui/layout/NeomorphicHeroFrame.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

type FrameElement = Extract<
  keyof JSX.IntrinsicElements,
  "div" | "header" | "section" | "nav" | "article" | "aside" | "main"
>;

type Align = "start" | "center" | "end" | "between";

export type NeomorphicHeroFrameVariant =
  | "default"
  | "compact"
  | "plain"
  | "unstyled";

export interface NeomorphicHeroFrameActionAreaProps {
  /** Optional segmented tabs rendered on the left */
  tabs?: React.ReactNode;
  /** Optional primary actions rendered on the right */
  actions?: React.ReactNode;
  /** Optional search control rendered inline */
  search?: React.ReactNode;
  /** Layout alignment across the action row */
  align?: Align;
  /** Adds a top divider when true (default) */
  divider?: boolean;
  /**
   * Additional class for the action row wrapper. Useful for controlling
   * grid spans when composing with other primitives.
   */
  className?: string;
  tabsClassName?: string;
  actionsClassName?: string;
  searchClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface NeomorphicHeroFrameProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Semantic element for the frame */
  as?: FrameElement;
  /** Built-in shell styles */
  variant?: NeomorphicHeroFrameVariant;
  /** Toggle animated frame layers */
  frame?: boolean;
  /** Optional class applied to the inner content wrapper */
  contentClassName?: string;
  /** Optional action row (tabs, search, buttons) */
  actionArea?: NeomorphicHeroFrameActionAreaProps | null;
}

const variantMap: Record<Exclude<NeomorphicHeroFrameVariant, "unstyled">, {
  container: string;
  padding: string;
  content: string;
  action: { mt: string; pt: string; gap: string };
}> = {
  default: {
    container:
      "rounded-card r-card-lg border border-border/40 bg-card/70 shadow-[0_0_0_1px_hsl(var(--border)/0.12)]",
    padding: "px-6 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8",
    content: "space-y-5 md:space-y-6",
    action: { mt: "mt-6 md:mt-7", pt: "pt-5 md:pt-6", gap: "gap-4" },
  },
  compact: {
    container:
      "rounded-card r-card-md border border-border/35 bg-card/65 shadow-[0_0_0_1px_hsl(var(--border)/0.12)]",
    padding: "px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6",
    content: "space-y-4 md:space-y-5",
    action: { mt: "mt-4 md:mt-5", pt: "pt-4 md:pt-5", gap: "gap-3" },
  },
  plain: {
    container:
      "rounded-card r-card-md border border-border/30 bg-card/60 shadow-[0_0_0_1px_hsl(var(--border)/0.08)]",
    padding: "px-4 py-4 md:px-5 md:py-5",
    content: "space-y-3 md:space-y-4",
    action: { mt: "mt-4", pt: "pt-3 md:pt-4", gap: "gap-3" },
  },
};

function slotLayout({
  hasTabs,
  hasSearch,
  hasActions,
}: {
  hasTabs: boolean;
  hasSearch: boolean;
  hasActions: boolean;
}) {
  if (hasTabs && hasSearch && hasActions) {
    return {
      tabs: "md:col-span-5",
      search: "md:col-span-4",
      actions: "md:col-span-3",
    };
  }
  if (hasTabs && hasSearch) {
    return {
      tabs: "md:col-span-6",
      search: "md:col-span-6",
      actions: "md:col-span-12",
    };
  }
  if (hasTabs && hasActions) {
    return {
      tabs: "md:col-span-7",
      search: "md:col-span-12",
      actions: "md:col-span-5",
    };
  }
  if (hasSearch && hasActions) {
    return {
      tabs: "md:col-span-12",
      search: "md:col-span-7",
      actions: "md:col-span-5",
    };
  }
  return {
    tabs: "md:col-span-12",
    search: "md:col-span-12",
    actions: "md:col-span-12",
  };
}

const alignClassMap: Record<Align, { tabs: string; search: string; actions: string }> = {
  start: {
    tabs: "md:justify-self-start",
    search: "md:justify-self-start",
    actions: "md:justify-self-start",
  },
  center: {
    tabs: "md:justify-self-center",
    search: "md:justify-self-center",
    actions: "md:justify-self-center",
  },
  end: {
    tabs: "md:justify-self-end",
    search: "md:justify-self-end",
    actions: "md:justify-self-end",
  },
  between: {
    tabs: "md:justify-self-start",
    search: "md:justify-self-stretch",
    actions: "md:justify-self-end",
  },
};

const NeomorphicHeroFrame = React.forwardRef<HTMLElement, NeomorphicHeroFrameProps>(
  (
    {
      as,
      variant = "default",
      frame = true,
      className,
      contentClassName,
      children,
      actionArea,
      ...rest
    },
    ref,
  ) => {
    const Component = (as ?? "div") as FrameElement;
    const Comp = Component as React.ElementType;
    const showFrame = frame !== false;
    const variantStyles =
      variant !== "unstyled" ? variantMap[variant] : undefined;

    const hasActionArea = Boolean(
      actionArea &&
        (actionArea.tabs || actionArea.actions || actionArea.search),
    );

    const shouldWrapContent =
      variant !== "unstyled" || hasActionArea || Boolean(contentClassName);

    const actionAlign = actionArea?.align ?? "between";
    const slots = slotLayout({
      hasTabs: Boolean(actionArea?.tabs),
      hasSearch: Boolean(actionArea?.search),
      hasActions: Boolean(actionArea?.actions),
    });
    const aligns = alignClassMap[actionAlign];

    const content = shouldWrapContent ? (
      <div
        className={cn(
          "relative z-[2]",
          variantStyles?.content,
          !variantStyles && hasActionArea && "space-y-4 md:space-y-5",
          contentClassName,
        )}
      >
        {children}
      </div>
    ) : (
      children
    );

    return (
      <>
        {showFrame ? <NeomorphicFrameStyles /> : null}
        <Comp
          ref={ref}
          className={cn(
            "relative",
            showFrame && "overflow-hidden hero2-neomorph",
            variantStyles?.container,
            variantStyles?.padding,
            className,
          )}
          {...rest}
        >
          {showFrame ? (
            <>
              <span aria-hidden className="hero2-beams" />
              <span aria-hidden className="hero2-scanlines" />
              <span aria-hidden className="hero2-noise opacity-[0.03]" />
            </>
          ) : null}

          {content}

          {hasActionArea ? (
            <div
              role="group"
              aria-label={actionArea?.["aria-label"]}
              aria-labelledby={actionArea?.["aria-labelledby"]}
              className={cn(
                "relative z-[2]",
                variantStyles?.action.mt ?? "mt-4",
                (actionArea?.divider ?? true)
                  ? cn(
                      "border-t border-border/35",
                      variantStyles?.action.pt ?? "pt-4",
                    )
                  : null,
                "grid gap-3 md:grid-cols-12 md:gap-4",
                variantStyles?.action.gap,
                actionArea?.className,
              )}
            >
              {actionArea?.tabs ? (
                <div
                  data-area="tabs"
                  className={cn(
                    "flex flex-col gap-2",
                    slots.tabs,
                    aligns.tabs,
                    actionArea.tabsClassName,
                  )}
                >
                  {actionArea.tabs}
                </div>
              ) : null}

              {actionArea?.search ? (
                <div
                  data-area="search"
                  className={cn(
                    "flex flex-col gap-2",
                    slots.search,
                    aligns.search,
                    actionArea.searchClassName,
                  )}
                >
                  {actionArea.search}
                </div>
              ) : null}

              {actionArea?.actions ? (
                <div
                  data-area="actions"
                  className={cn(
                    "flex flex-wrap items-center justify-end gap-2",
                    slots.actions,
                    aligns.actions,
                    actionArea.actionsClassName,
                  )}
                >
                  {actionArea.actions}
                </div>
              ) : null}
            </div>
          ) : null}

          {showFrame ? (
            <div
              aria-hidden
              className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-border/55"
            />
          ) : null}
        </Comp>
      </>
    );
  },
);

NeomorphicHeroFrame.displayName = "NeomorphicHeroFrame";

export default NeomorphicHeroFrame;
