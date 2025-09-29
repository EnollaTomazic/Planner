"use client";

import * as React from "react";
import Image from "next/image";
import { PageShell, SectionCard, Spinner } from "@/components/ui";
import { cn, withBasePath } from "@/lib/utils";
import styles from "./HomeSplash.module.css";

type HomeSplashProps = {
  active: boolean;
  onExited?: () => void;
};

const LOGO_SRC = withBasePath("/planner-logo.svg");
const STATUS_MESSAGE = "Preparing your planner…";

export default function HomeSplash({ active, onExited }: HomeSplashProps) {
  const statusHeadingId = React.useId();
  const exitNotifiedRef = React.useRef(false);

  React.useEffect(() => {
    exitNotifiedRef.current = false;
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
      aria-hidden={active ? undefined : true}
      onTransitionEnd={handleTransitionEnd}
    >
      <PageShell className={styles.shell} aria-labelledby={statusHeadingId}>
        <SectionCard aria-labelledby={statusHeadingId}>
          <SectionCard.Body className={styles.cardBody}>
            <span className="sr-only" id={statusHeadingId}>
              Planner is loading
            </span>
            <span className={styles.logoFrame} aria-hidden="true">
              <span className={cn("glitch", styles.logoMotion)}>
                <Image
                  src={LOGO_SRC}
                  alt="Planner logo"
                  fill
                  priority
                  sizes="(max-width: 640px) 160px, 192px"
                  className={styles.logoImage}
                />
              </span>
            </span>
            <p className={cn("text-body text-muted-foreground", styles.tagline)}>
              Plan your day, track goals, and review games.
            </p>
            <div className={cn(styles.status, "text-label")}
              aria-live="polite"
            >
              <Spinner size="lg" tone="accent" />
              <span className={styles.statusText}>{STATUS_MESSAGE}</span>
            </div>
          </SectionCard.Body>
        </SectionCard>
      </PageShell>
    </div>
  );
}
