"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import { GlitchSegmentedGroup, GlitchSegmentedButton } from "@/components/ui";
import styles from "./RoleSelector.module.css";
import type { Role } from "@/lib/types";

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

  const rootStyle = React.useMemo<
    (React.CSSProperties & Record<string, string>) | undefined
  >(() => {
    if (count <= 0) {
      return undefined;
    }
    return {
      "--segment-count": String(count),
    };
  }, [count]);

  const indicatorStyle = React.useMemo<
    (React.CSSProperties & Record<string, string>) | undefined
  >(() => ({
    "--indicator-index": String(activeIdx),
  }), [activeIdx]);

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
          className,
        )}
        data-count={count}
        style={rootStyle}
      >
        <span aria-live="polite" className="sr-only" ref={liveRef} />

        <span
          aria-hidden
          className={styles.indicator}
          data-active-index={activeIdx}
          style={indicatorStyle}
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
    </>
  );
}
