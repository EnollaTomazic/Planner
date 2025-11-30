// src/components/ui/Hero.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  Hero as LayoutHero,
  type HeroProps as LayoutHeroProps,
  type HeroTab,
  type HeroTabsProps,
} from "./layout/Hero";
import { Button, type ButtonProps } from "./primitives/Button";
import { getAccentColors, type AccentTone } from "./theme/getAccentColors";

const PANEL_WRAPPER_BASE_CLASSES = cn(
  "relative isolate overflow-hidden",
  "rounded-[var(--radius-xl)]",
  "bg-panel/65",
  "shadow-[var(--shadow-inner-md)]",
  "px-[var(--space-6)] py-[var(--space-6)]",
  "sm:px-[var(--space-7)] sm:py-[var(--space-7)]",
  "lg:px-[var(--space-8)]",
);

const PANEL_TITLE_STACK_CLASSES = cn("min-w-0 space-y-[var(--space-2)]");

const PANEL_ACTION_LIST_CLASSES = cn(
  "flex flex-wrap items-center gap-[var(--space-2)]",
  "md:justify-end",
);

const PANEL_HERO_CONTAINER_CLASSES = cn(
  "relative flex shrink-0 items-center justify-center",
  "md:max-w-[18rem] lg:max-w-[20rem]",
);

type PanelElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "header" | "section" | "article" | "aside"
>;

type PanelElementProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "children"
>;

type PanelElementRef = HTMLElementTagNameMap[PanelElement];

export type HeroAction = {
  id?: string;
  label: React.ReactNode;
} & Omit<ButtonProps, "children">;

type HeroActionsInput =
  | ReadonlyArray<HeroAction>
  | React.ReactNode
  | null
  | undefined;

export type HeroPageAccent = "primary" | "life" | "supportive";

const PAGE_ACCENT_DEFAULTS: Record<
  HeroPageAccent,
  Pick<LayoutHeroProps, "tone" | "dividerTint">
> = {
  primary: { tone: "heroic", dividerTint: "primary" },
  life: { tone: "heroic", dividerTint: "life" },
  supportive: { tone: "supportive", dividerTint: "primary" },
};

export interface HeroPanelProps extends PanelElementProps {
  variant: "panel";
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  actions?: HeroActionsInput;
  hero?: React.ReactNode;
  heroPlacement?: "left" | "right";
  as?: PanelElement;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  heroClassName?: string;
  contentClassName?: string;
  actionsLabel?: string;
  headingId?: string;
  accent?: AccentTone;
  /** @deprecated Decorative header rail has been removed; prop is a no-op. */
  rail?: boolean;
}

type LayoutHeroVariantProps<Key extends string = string> = LayoutHeroProps<Key> & {
  variant?: "layout";
  actionButtons?: ReadonlyArray<HeroAction>;
  actions?: LayoutHeroProps<Key>["actions"] | HeroActionsInput;
  pageAccent?: HeroPageAccent;
};

export type HeroProps<Key extends string = string> =
  | LayoutHeroVariantProps<Key>
  | HeroPanelProps;

type LayoutHeroComponent = <Key extends string = string>(
  props: LayoutHeroVariantProps<Key> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;

type PanelHeroComponent = (
  props: HeroPanelProps & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;

type HeroComponent = LayoutHeroComponent & PanelHeroComponent;

function isPanelProps<Key extends string = string>(
  props: HeroProps<Key>,
): props is HeroPanelProps {
  return (props as HeroPanelProps).variant === "panel";
}

function resolveActions(actions: HeroActionsInput): React.ReactNode {
  if (!actions) {
    return null;
  }

  if (Array.isArray(actions)) {
    if (actions.length === 0) {
      return null;
    }

    return actions.map((action, index) => {
      const { id, label, className, size, variant, ...buttonProps } = action;
      const key = id ?? String(index);
      const resolvedSize = size ?? "md";
      const resolvedVariant = variant ?? "default";

      return (
        <Button
          key={key}
          size={resolvedSize}
          variant={resolvedVariant}
          className={className}
          {...(buttonProps as ButtonProps)}
        >
          {label}
        </Button>
      );
    });
  }

  return actions as React.ReactNode;
}

const PanelHero = React.forwardRef<PanelElementRef, HeroPanelProps>(
  (
    {
      title,
      subtitle,
      children,
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
      rail: _rail,
      ...rest
    },
    ref,
  ) => {
    const Component: PanelElement = as ?? "section";

    const accentColors = React.useMemo(() => getAccentColors(accent), [accent]);

    const accentVariables = React.useMemo(
      () =>
        ({
          "--hero-panel-accent-surface": `color-mix(in oklab, ${accentColors.accent1Soft} 70%, ${accentColors.panel})`,
          "--hero-panel-accent-border": `color-mix(in oklab, ${accentColors.accent1} 38%, ${accentColors.border})`,
          "--hero-panel-accent-glow": `color-mix(in oklab, ${accentColors.accent2} 45%, transparent)`,
          "--hero-panel-accent-glow-soft": `color-mix(in oklab, ${accentColors.accent3} 30%, transparent)`,
          "--hero-panel-accent-ring": accentColors.glow,
          "--hero-panel-accent-on-color": accentColors.accent1Foreground,
          "--hero-panel-accent-contrast": accentColors.accent1Contrast,
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
      if (!actions) return undefined;
      if (Array.isArray(actions) && actions.length === 0) return undefined;
      return `${generatedId}-actions`;
    }, [generatedId, actions]);

    const headingTag = React.useMemo(() => {
      const normalized = Math.min(6, Math.max(1, headingLevel));
      return `h${normalized}` as keyof JSX.IntrinsicElements;
    }, [headingLevel]);
    const HeadingComponent = headingTag as React.ElementType;

    const heroNode = hero ? (
      <div
        className={cn(
          PANEL_HERO_CONTAINER_CLASSES,
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

    const actionButtons = React.useMemo(() => resolveActions(actions), [actions]);

    return (
      <Component
        ref={ref}
        className={cn(PANEL_WRAPPER_BASE_CLASSES, className)}
        style={mergedStyle}
        {...rest}
      >
        <div
          className={cn(
            "flex flex-col gap-[var(--space-6)] md:flex-row md:items-center",
            hero || actionButtons
              ? "md:justify-between"
              : undefined,
            contentClassName,
          )}
        >
          {heroPlacement === "left" ? heroNode : null}

          <div className={PANEL_TITLE_STACK_CLASSES}>
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
              <p id={subtitleId} className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            {children}
          </div>

          {actionButtons ? (
            <div
              id={actionsId}
              className={PANEL_ACTION_LIST_CLASSES}
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
  },
);
PanelHero.displayName = "HeroPanel";

const LayoutHeroWrapper = React.forwardRef<
  HTMLElement,
  LayoutHeroVariantProps<string>
>(
  (
    {
      variant: _variant,
      actionButtons,
      actions,
      pageAccent,
      tone,
      dividerTint,
      rail: _rail,
      ...rest
    },
    ref,
  ) => {
    const accentDefaults = React.useMemo(() => {
      if (!pageAccent) return null;
      return PAGE_ACCENT_DEFAULTS[pageAccent] ?? null;
    }, [pageAccent]);

    const resolvedTone = tone ?? accentDefaults?.tone;
    const resolvedDividerTint = dividerTint ?? accentDefaults?.dividerTint;

    const actionContent = React.useMemo(() => {
      if (actionButtons && actionButtons.length > 0) {
        return (
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            {resolveActions(actionButtons)}
          </div>
        );
      }

      if (actions && !React.isValidElement(actions)) {
        return resolveActions(actions);
      }

      return actions ?? null;
    }, [actionButtons, actions]);

    return (
      <LayoutHero
        {...(rest as LayoutHeroProps<string>)}
        tone={resolvedTone}
        dividerTint={resolvedDividerTint}
        actions={actionContent ?? undefined}
      />
    );
  },
);
LayoutHeroWrapper.displayName = "HeroLayoutWrapper";

const HeroBase = React.forwardRef<HTMLElement, HeroProps<string>>((props, ref) => {
  if (isPanelProps(props)) {
    return <PanelHero {...props} ref={ref as React.ForwardedRef<PanelElementRef>} />;
  }

  return <LayoutHeroWrapper {...props} ref={ref} />;
});
HeroBase.displayName = "Hero";

export const Hero = HeroBase as HeroComponent;
export type { HeroTab, HeroTabsProps };
export type { LayoutHeroProps };
