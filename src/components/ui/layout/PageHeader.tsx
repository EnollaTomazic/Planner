// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/primitives/Button";
import {
  getAccentColors,
  type AccentTone,
} from "@/components/ui/theme/getAccentColors";
import { cn } from "@/lib/utils";

const WRAPPER_BASE_CLASSES = cn(
  "relative isolate overflow-hidden",
  "rounded-[var(--radius-xl)]",
  "bg-panel/65",
  "shadow-[var(--shadow-inner-md)]",
  "px-[var(--space-6)] py-[var(--space-6)]",
  "sm:px-[var(--space-7)] sm:py-[var(--space-7)]",
  "lg:px-[var(--space-8)]",
);

const TITLE_STACK_CLASSES = cn(
  "min-w-0 space-y-[var(--space-2)]",
);

const ACTION_LIST_CLASSES = cn(
  "flex flex-wrap items-center gap-[var(--space-2)]",
  "md:justify-end",
);

const HERO_CONTAINER_CLASSES = cn(
  "relative flex shrink-0 items-center justify-center",
  "md:max-w-[18rem] lg:max-w-[20rem]",
);

type PageHeaderElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "header" | "section" | "article" | "div" | "aside"
>;

type PageHeaderElementProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "children"
>;

export type PageHeaderAction = {
  /** Unique identifier used as the React key. Falls back to array index when omitted. */
  id?: string;
  /** Content rendered inside the button. */
  label: React.ReactNode;
} & Omit<ButtonProps, "children">;

export interface PageHeaderProps extends PageHeaderElementProps {
  /** Heading displayed at the top of the header. */
  title: React.ReactNode;
  /** Optional supporting text beneath the title. */
  subtitle?: React.ReactNode;
  /** Optional collection of action buttons rendered to the right. */
  actions?: ReadonlyArray<PageHeaderAction>;
  /** Optional hero artwork displayed on either side of the copy. */
  hero?: React.ReactNode;
  /** Controls the side on which the hero artwork renders. Defaults to `"right"`. */
  heroPlacement?: "left" | "right";
  /** Semantic wrapper element. Defaults to a `<section>`. */
  as?: PageHeaderElement;
  /** Overrides the heading level used for the title. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Optional className applied to the hero wrapper. */
  heroClassName?: string;
  /** Optional className applied to the content stack. */
  contentClassName?: string;
  /** Accessible label for the actions list region. */
  actionsLabel?: string;
  /** Optional id applied to the internal heading element. */
  headingId?: string;
  /** Accent palette applied to the decorative surfaces. */
  accent?: AccentTone;
}

const PageHeaderInner = (
  {
    title,
    subtitle,
    actions,
    hero,
    heroPlacement = "right",
    as,
    className,
    headingLevel = 1,
    heroClassName,
    contentClassName,
    actionsLabel = "Page actions",
    headingId: headingIdProp,
    style: styleProp,
    accent = "accent",
    ...rest
  }: PageHeaderProps,
  ref: React.ForwardedRef<HTMLElement>,
) => {
  const Component: PageHeaderElement = as ?? "section";

  const accentColors = React.useMemo(
    () => getAccentColors(accent),
    [accent],
  );
  const accentVariables = React.useMemo(
    () =>
      ({
        "--page-header-accent-surface": `color-mix(in oklab, ${accentColors.accent1Soft} 70%, ${accentColors.panel})`,
        "--page-header-accent-border": `color-mix(in oklab, ${accentColors.accent1} 38%, ${accentColors.border})`,
        "--page-header-accent-glow": `color-mix(in oklab, ${accentColors.accent2} 45%, transparent)`,
        "--page-header-accent-glow-soft": `color-mix(in oklab, ${accentColors.accent3} 30%, transparent)`,
        "--page-header-accent-ring": accentColors.glow,
        "--page-header-accent-on-color": accentColors.accent1Foreground,
        "--page-header-accent-contrast": accentColors.accent1Contrast,
      }) as Record<string, string>,
    [accentColors],
  );

  const mergedStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (styleProp) {
      return { ...accentVariables, ...styleProp } as React.CSSProperties;
    }
    return accentVariables as React.CSSProperties;
  }, [accentVariables, styleProp]);

  const generatedId = React.useId();
  const headingId = React.useMemo(
    () => headingIdProp ?? `${generatedId}-title`,
    [generatedId, headingIdProp],
  );
  const subtitleId = React.useMemo(() => {
    if (!subtitle) return undefined;
    return `${generatedId}-subtitle`;
  }, [generatedId, subtitle]);
  const actionsId = React.useMemo(() => {
    if (!actions || actions.length === 0) return undefined;
    return `${generatedId}-actions`;
  }, [generatedId, actions]);

  const headingTag = React.useMemo(
    () => {
      const normalized = Math.min(6, Math.max(1, headingLevel));
      return `h${normalized}` as keyof JSX.IntrinsicElements;
    },
    [headingLevel],
  );
  const HeadingComponent = headingTag as React.ElementType;

  const heroNode = hero ? (
    <div
      className={cn(
        HERO_CONTAINER_CLASSES,
        heroPlacement === "left"
          ? "order-first md:order-none"
          : "order-last md:order-none",
        heroClassName,
      )}
      aria-hidden={typeof hero === "string" ? undefined : true}
    >
      {hero}
    </div>
  ) : null;

  const actionButtons = actions?.map((action, index) => {
    const {
      id,
      label,
      className: actionClassName,
      size,
      variant,
      ...buttonProps
    } = action;
    const key = id ?? String(index);
    const resolvedSize = size ?? "md";
    const resolvedVariant = variant ?? "default";

    return (
      <Button
        key={key}
        size={resolvedSize}
        variant={resolvedVariant}
        className={actionClassName}
        {...(buttonProps as ButtonProps)}
      >
        {label}
      </Button>
    );
  });

  return (
    <Component
      ref={ref as React.Ref<any>}
      className={cn(WRAPPER_BASE_CLASSES, className)}
      style={mergedStyle}
      {...rest}
    >
      <div
        className={cn(
          "flex flex-col gap-[var(--space-6)] md:flex-row md:items-center",
          hero || (actionButtons && actionButtons.length > 0)
            ? "md:justify-between"
            : undefined,
          contentClassName,
        )}
      >
        {heroPlacement === "left" ? heroNode : null}

        <div className={TITLE_STACK_CLASSES}>
          <HeadingComponent
            id={headingId}
            className={cn(
              "text-xl font-semibold text-foreground",
              "md:text-2xl",
              "tracking-tight",
              "text-balance",
            )}
          >
            {title}
          </HeadingComponent>
          {subtitle ? (
            <p
              id={subtitleId}
              className="text-lg text-muted-foreground"
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {actionButtons && actionButtons.length > 0 ? (
          <div
            id={actionsId}
            className={ACTION_LIST_CLASSES}
            role="group"
            aria-label={actionsLabel}
          >
            {actionButtons}
          </div>
        ) : null}

        {heroPlacement === "right" ? heroNode : null}
      </div>
    </Component>
  );
};

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(PageHeaderInner);
PageHeader.displayName = "PageHeader";

