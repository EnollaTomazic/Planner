"use client";

import * as React from "react";

import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import type { Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

import styles from "./Hero.module.css";

const THEME_CLASS: Record<Variant, string> = {
  lg: styles.themeLg,
  aurora: styles.themeAurora,
  citrus: styles.themeCitrus,
  noir: styles.themeNoir,
  ocean: styles.themeOcean,
  kitten: styles.themeKitten,
  hardstuck: styles.themeHardstuck,
};

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  actionsProps?: React.HTMLAttributes<HTMLDivElement>;
  tabs?: React.ReactNode;
  tabsProps?: React.HTMLAttributes<HTMLDivElement>;
  theme: Variant;
  headingId?: string;
  contentClassName?: string;
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    title,
    subtitle,
    eyebrow,
    actions,
    actionsProps,
    tabs,
    tabsProps,
    theme,
    headingId,
    children,
    className,
    contentClassName,
    ...rest
  },
  forwardedRef,
) {
  const autoHeadingId = React.useId();
  const resolvedHeadingId = headingId ?? autoHeadingId;

  const themeClassName = THEME_CLASS[theme] ?? THEME_CLASS.lg;
  const { className: actionsClassName, role: actionsRole, ...actionsRestProps } = actionsProps ?? {};
  const { className: tabsClassName, ...tabsRestProps } = tabsProps ?? {};

  return (
    <section
      {...rest}
      ref={forwardedRef}
      className={cn(styles.root, themeClassName, className)}
      aria-labelledby={resolvedHeadingId}
      data-theme={theme}
    >
      <div className={styles.backdrop} aria-hidden />
      <div className={styles.surface}>
        <div className={cn(layoutGridClassName, styles.shell)}>
          <header className={styles.header}>
            <div className={styles.headingBlock}>
              {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
              <h1 id={resolvedHeadingId} className={styles.title}>
                {title}
              </h1>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            {actions ? (
              <div
                {...actionsRestProps}
                role={actionsRole ?? "group"}
                className={cn(styles.actions, actionsClassName)}
              >
                {actions}
              </div>
            ) : null}
          </header>
          {tabs ? (
            <div {...tabsRestProps} className={cn(styles.tabs, tabsClassName)}>
              {tabs}
            </div>
          ) : null}
          {children ? (
            <div className={cn(styles.body, contentClassName)}>{children}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "HomeLandingHero";

export { Hero };
