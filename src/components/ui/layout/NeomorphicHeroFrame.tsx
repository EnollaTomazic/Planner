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
  /** Boost surface contrast for accessibility */
  highContrast?: boolean;
}

const variantMap: Record<Exclude<NeomorphicHeroFrameVariant, "unstyled">, {
  container: string;
  padding: string;
  content: string;
  action: { mt: string; pt: string; gap: string };
}> = {
  default: {
    container:
      "rounded-card r-card-lg border border-border/40 bg-card/70 shadow-outline-subtle",
    padding:
      "px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-7)] md:py-[var(--space-7)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]",
    content: "space-y-[var(--space-5)] md:space-y-[var(--space-6)]",
    action: {
      mt: "mt-[var(--space-6)] md:mt-[var(--space-7)]",
      pt: "pt-[var(--space-5)] md:pt-[var(--space-6)]",
      gap: "gap-[var(--space-4)]",
    },
  },
  compact: {
    container:
      "rounded-card r-card-md border border-border/35 bg-card/65 shadow-outline-subtle",
    padding:
      "px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-5)] md:py-[var(--space-5)] lg:px-[var(--space-6)] lg:py-[var(--space-6)]",
    content: "space-y-[var(--space-4)] md:space-y-[var(--space-5)]",
    action: {
      mt: "mt-[var(--space-4)] md:mt-[var(--space-5)]",
      pt: "pt-[var(--space-4)] md:pt-[var(--space-5)]",
      gap: "gap-[var(--space-3)]",
    },
  },
  plain: {
    container:
      "rounded-card r-card-md border border-border/30 bg-card/60 shadow-outline-faint",
    padding:
      "px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-5)] md:py-[var(--space-5)]",
    content: "space-y-[var(--space-3)] md:space-y-[var(--space-4)]",
    action: {
      mt: "mt-[var(--space-4)]",
      pt: "pt-[var(--space-3)] md:pt-[var(--space-4)]",
      gap: "gap-[var(--space-3)]",
    },
  },
};

const highContrastVariantMap: Record<
  Exclude<NeomorphicHeroFrameVariant, "unstyled">,
  { container: string; divider: string }
> = {
  default: {
    container: "border-border/70 shadow-neoSoft",
    divider: "border-border/55",
  },
  compact: {
    container: "border-border/70 shadow-neoSoft",
    divider: "border-border/55",
  },
  plain: {
    container: "border-border/55 shadow-outline-subtle",
    divider: "border-border/50",
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
      highContrast,
      ...rest
    },
    ref,
  ) => {
    const Component = (as ?? "div") as FrameElement;
    const Comp = Component as React.ElementType;
    const showFrame = frame !== false;
    const variantStyles =
      variant !== "unstyled" ? variantMap[variant] : undefined;
    const contrastStyles =
      highContrast && variant !== "unstyled"
        ? highContrastVariantMap[variant]
        : undefined;
    const slotContrastClass = highContrast ? "text-foreground" : undefined;
    const actionDividerContrastClass =
      contrastStyles?.divider ?? (highContrast ? "border-border/55" : undefined);

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
            contrastStyles?.container,
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
                variantStyles?.action.mt ?? "mt-[var(--space-4)]",
                (actionArea?.divider ?? true)
                  ? cn(
                      "border-t border-border/35",
                      actionDividerContrastClass,
                      variantStyles?.action.pt ?? "pt-[var(--space-4)]",
                    )
                  : null,
                "grid gap-[var(--space-3)] md:grid-cols-12 md:gap-[var(--space-4)]",
                variantStyles?.action.gap,
                actionArea?.className,
              )}
            >
              {actionArea?.tabs ? (
                <div
                  data-area="tabs"
                  className={cn(
                    "flex flex-col gap-[var(--space-2)]",
                    slotContrastClass,
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
                    "flex flex-col gap-[var(--space-2)]",
                    slotContrastClass,
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
                    "flex flex-wrap items-center justify-end gap-[var(--space-2)]",
                    slotContrastClass,
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
              className={cn(
                "absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-border/55",
                highContrast && "ring-border/70",
              )}
            />
          ) : null}
        </Comp>
      </>
    );
  },
);

NeomorphicHeroFrame.displayName = "NeomorphicHeroFrame";

export default NeomorphicHeroFrame;
