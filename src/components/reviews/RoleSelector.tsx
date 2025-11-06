"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import { TabBar } from "@/components/ui";
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
export function RoleSelector({
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

  return (
    <div className={cn("w-full", className)}>
      <span aria-live="polite" className="sr-only" ref={liveRef} />

      <TabBar<Role>
        items={ROLE_OPTIONS.map(({ value: v, Icon, label }) => ({
          key: v,
          label,
          icon: <Icon className="size-[var(--icon-size-sm)]" />,
          className: "flex-1",
        }))}
        value={value}
        onValueChange={(next) => onChange(next as Role)}
        ariaLabel="Select lane/role"
        ariaLabelledBy={ariaLabelledby}
        variant="neo"
        size="sm"
        className="w-full"
        tablistClassName="w-full"
        linkPanels={false}
      />
    </div>
  );
}
