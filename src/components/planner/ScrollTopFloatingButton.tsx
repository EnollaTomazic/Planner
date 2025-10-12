"use client";

import * as React from "react";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { ArrowUp } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type ScrollTopFloatingButtonProps = {
  watchRef: React.RefObject<HTMLElement | null>;
  forceVisible?: boolean;
};

export function ScrollTopFloatingButton({
  watchRef,
  forceVisible = false,
}: ScrollTopFloatingButtonProps) {
  const [visible, setVisible] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const [target, setTarget] = React.useState<HTMLElement | null>(
    () => watchRef.current,
  );

  const watchedElement = watchRef.current;

  const supportsIntersectionObserver =
    typeof window !== "undefined" && "IntersectionObserver" in window;

  React.useEffect(() => {
    if (watchedElement !== target) {
      setTarget(watchedElement ?? null);
    }
  }, [watchedElement, target]);

  React.useEffect(() => {
    if (!supportsIntersectionObserver) {
      setVisible(true);
      return undefined;
    }

    if (!target) {
      return undefined;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => setVisible(!e.isIntersecting));
    });

    obs.observe(target);

    return () => {
      obs.unobserve(target);
      obs.disconnect();
    };
  }, [supportsIntersectionObserver, target]);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior });
    }
  };

  if (!visible && !forceVisible) return null;

  return (
    <IconButton
      aria-label="Scroll to top"
      onClick={scrollTop}
      className="fixed bottom-[var(--space-8)] right-[max(var(--space-2),calc((var(--viewport-width) - var(--shell-max, var(--shell-width))) / 2 + var(--space-2)))] z-50"
    >
      <ArrowUp />
    </IconButton>
  );
}
