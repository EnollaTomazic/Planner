"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import { GlitchSegmentedGroup, GlitchSegmentedButton } from "@/components/ui";
import styles from "./RoleSelector.module.css";
import type { Role } from "@/lib/types";

const PRESET_COMBO_MAX = 6;

type Props = {
  value: Role;
  onChange: (v: Role) => void;
  className?: string;
  ariaLabelledby?: string;
};

/**
 * Segmented control for role selection.
 * Uses glitch-styled segmented buttons with sliding indicator.
 */
export default function RoleSelector({
  value,
  onChange,
  className,
  ariaLabelledby,
}: Props) {
  const count = ROLE_OPTIONS.length;
  const activeIdx = Math.max(
    0,
    ROLE_OPTIONS.findIndex((r) => r.value === value),
  );
  const liveRef = React.useRef<HTMLSpanElement>(null);

  const dynamicStyles = React.useMemo<
    | {
        rootClassName: string;
        indicatorClassName: string;
        styleElement: React.ReactElement;
      }
    | null
  >(() => {
    if (count <= PRESET_COMBO_MAX) {
      return null;
    }

    const baseClass = `role-selector-${count}`;
    const rootClassName = `${baseClass}__root`;
    const indicatorClassName = `${baseClass}__indicator`;
    const translateRules = Array.from({ length: count }, (_, idx) => {
      const offset = `calc(${idx} * (100% + var(--segment-gap)))`;
      return `:global(.${rootClassName}[data-count="${count}"] .${indicatorClassName}[data-active-index="${idx}"]) { --indicator-translate: ${offset}; }`;
    }).join("\n");

    const css = [
      `:global(.${rootClassName}[data-count="${count}"]) { --segment-count: ${count}; }`,
      translateRules,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      rootClassName,
      indicatorClassName,
      styleElement: <style jsx>{css}</style>,
    };
  }, [count]);

  React.useEffect(() => {
    const { label } = ROLE_OPTIONS[activeIdx] ?? {};
    if (label && liveRef.current) {
      liveRef.current.textContent = `${label}, selected, ${activeIdx + 1} of ${count}`;
    }
  }, [activeIdx, count]);

  return (
    <>
      <div
        className={cn(
          "relative rounded-[var(--radius-full)] bg-[var(--btn-bg)] p-[var(--space-1)]",
          styles.root,
          dynamicStyles?.rootClassName,
          className,
        )}
        data-count={count}
      >
        <span aria-live="polite" className="sr-only" ref={liveRef} />

        <span
          aria-hidden
          className={cn(styles.indicator, dynamicStyles?.indicatorClassName)}
          data-active-index={activeIdx}
        />

        <GlitchSegmentedGroup
          value={value}
          onChange={(v) => onChange(v as Role)}
          ariaLabel="Select lane/role"
          ariaLabelledby={ariaLabelledby}
          className="relative w-full bg-transparent p-0"
        >
          {ROLE_OPTIONS.map(({ value: v, Icon, label }) => (
            <GlitchSegmentedButton
              key={v}
              value={v}
              icon={<Icon className="size-[var(--icon-size-sm)]" />}
            >
              {label}
            </GlitchSegmentedButton>
          ))}
        </GlitchSegmentedGroup>
      </div>
      {dynamicStyles?.styleElement ?? null}
    </>
  );
}
