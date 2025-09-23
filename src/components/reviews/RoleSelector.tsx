"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import { GlitchSegmentedGroup, GlitchSegmentedButton } from "@/components/ui";
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

  React.useEffect(() => {
    const { label } = ROLE_OPTIONS[activeIdx] ?? {};
    if (label && liveRef.current) {
      liveRef.current.textContent = `${label}, selected, ${activeIdx + 1} of ${count}`;
    }
  }, [activeIdx, count]);

  const styleVars: React.CSSProperties = {
    "--count": count,
    "--idx": activeIdx,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-full)] bg-[var(--btn-bg)] p-[var(--space-1)]",
        className,
      )}
      style={styleVars}
    >
      <span aria-live="polite" className="sr-only" ref={liveRef} />

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[var(--space-1)] left-[var(--space-1)] top-[var(--space-1)] rounded-[var(--radius-full)] bg-[var(--seg-active-grad)] shadow-neon-strong transition-transform duration-[var(--dur-quick)] ease-snap motion-reduce:transition-none"
        style={{
          width:
            "calc((100% - (var(--count) - 1) * var(--space-1) - 2 * var(--space-1)) / var(--count))",
          transform:
            "translateX(calc(var(--idx) * (100% + var(--space-1))))",
        }}
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
  );
}
