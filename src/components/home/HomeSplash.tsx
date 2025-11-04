"use client";

import * as React from "react";
import { PageShell, Spinner } from "@/components/ui";
import { Hero } from "@/components/ui/layout/hero/Hero";
import { cn } from "@/lib/utils";
import { HomeSplashIllustration } from "./HomeSplashIllustration";
import styles from "./HomeSplash.module.css";

type HomeSplashProps = {
  active: boolean;
  onExited?: () => void;
};

const STATUS_LABEL = "Planner is loading";
const STATUS_MESSAGE = "Preparing your planner…";

export function HomeSplash({ active, onExited }: HomeSplashProps) {
  const statusHeadingId = React.useId();
  const statusMessageId = React.useId();
  const exitNotifiedRef = React.useRef(false);
  const statusRef = React.useRef<HTMLDivElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    exitNotifiedRef.current = false;
  }, [active]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const statusNode = statusRef.current;

    if (!statusNode) {
      return;
    }

    if (active) {
      const currentActive = document.activeElement as HTMLElement | null;

      if (currentActive && currentActive !== statusNode) {
        previousFocusRef.current = currentActive;
      }

      if (statusNode !== currentActive) {
        statusNode.focus({ preventScroll: true });
      }

      return;
    }

    if (previousFocusRef.current?.isConnected) {
      previousFocusRef.current.focus({ preventScroll: true });
    }

    previousFocusRef.current = null;
  }, [active]);

  React.useEffect(() => {
    if (active) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery || !mediaQuery.matches) {
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      if (exitNotifiedRef.current) {
        return;
      }
      exitNotifiedRef.current = true;
      onExited?.();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [active, onExited]);

  const handleTransitionEnd = React.useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (active) {
        return;
      }
      if (exitNotifiedRef.current) {
        return;
      }
      exitNotifiedRef.current = true;
      onExited?.();
    },
    [active, onExited],
  );

  return (
    <div
      className={styles.root}
      data-state={active ? "active" : "inactive"}
      role={active ? "status" : undefined}
      aria-live={active ? "polite" : undefined}
      aria-labelledby={active ? statusHeadingId : undefined}
      aria-hidden={active ? undefined : true}
      data-home-splash=""
      onTransitionEnd={handleTransitionEnd}
    >
      <PageShell className={styles.shell} aria-labelledby={statusHeadingId}>
        <Hero
          title="Plan your day"
          subtitle="Track goals and review games."
          tone="supportive"
          frame={false}
          sticky={false}
          padding="none"
          className={cn(
            "relative isolate w-full overflow-hidden rounded-card r-card-lg bg-panel-tilt-strong px-[var(--space-6)] py-[var(--space-6)] text-foreground [box-shadow:var(--shadow-neon),var(--shadow-depth-inner)] md:px-[var(--space-7)] md:py-[var(--space-7)]",
          )}
          barClassName={styles.heroBar}
          bodyClassName={styles.heroBody}
          data-home-splash-hero=""
        >
          <HomeSplashIllustration aria-hidden />
          <div
            ref={statusRef}
            className={cn(styles.status, "text-label")}
            aria-live="polite"
            aria-labelledby={statusHeadingId}
            aria-describedby={statusMessageId}
            tabIndex={-1}
            data-home-splash-status=""
          >
            <Spinner size="lg" tone="accent" />
            <span className={styles.statusText}>
              <span className={styles.statusLabel} id={statusHeadingId}>
                {STATUS_LABEL}
              </span>
              <span className={styles.statusSupplemental} id={statusMessageId}>
                {STATUS_MESSAGE}
              </span>
            </span>
          </div>
        </Hero>
      </PageShell>
    </div>
  );
}
