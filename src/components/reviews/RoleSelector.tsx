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
};

/**
 * Segmented control for role selection.
 * Uses glitch-styled segmented buttons with sliding indicator.
 */
export default function RoleSelector({ value, onChange, className }: Props) {
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
        "relative rounded-full bg-[var(--btn-bg)] p-1",
        className,
      )}
      style={styleVars}
    >
      <span aria-live="polite" className="sr-only" ref={liveRef} />

      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-[var(--seg-active-grad)] shadow-[0_0_12px_var(--neon),0_0_24px_var(--neon-soft)] transition-transform duration-[var(--dur-quick)] ease-snap motion-reduce:transition-none"
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
        className="relative w-full bg-transparent p-0"
      >
        {ROLE_OPTIONS.map(({ value: v, Icon, label }) => (
          <GlitchSegmentedButton
            key={v}
            value={v}
            icon={<Icon className="h-4 w-4" />}
          >
            {label}
          </GlitchSegmentedButton>
        ))}
      </GlitchSegmentedGroup>
    </div>
  );
}
