"use client";

import * as React from "react";
import { Select, type SelectItem } from "@/components/ui";
import { BG_CLASSES, Background } from "@/lib/theme";
import { cn } from "@/lib/utils";

const BG_NAMES = ["Default", "Alt 1", "Alt 2", "VHS", "Streak"];

function Swatch({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-[var(--space-1)] rounded-full p-[var(--space-1)]",
        className,
      )}
    >
      <span className="h-[var(--space-3)] w-[var(--space-3)] rounded-full bg-background" />
      <span className="h-[var(--space-3)] w-[var(--space-3)] rounded-full bg-card" />
      <span className="h-[var(--space-3)] w-[var(--space-3)] rounded-full bg-gradient-to-br from-accent to-accent-2" />
    </div>
  );
}

export type BackgroundPickerProps = {
  bg: Background;
  onBgChange: (bg: Background) => void;
  className?: string;
};

export default function BackgroundPicker({
  bg,
  onBgChange,
  className = "",
}: BackgroundPickerProps) {
  const items: SelectItem[] = React.useMemo(
    () =>
      BG_CLASSES.map((cls, idx) => ({
        value: String(idx),
        label: (
          <div className="flex items-center gap-[var(--space-2)]">
            <Swatch className={cls} />
            <span>{BG_NAMES[idx]}</span>
          </div>
        ),
      })),
    [],
  );
  return (
    <Select
      variant="animated"
      ariaLabel="Background"
      prefixLabel="Background"
      items={items}
      value={String(bg)}
      onChange={(v) => onBgChange(Number(v) as Background)}
      size="sm"
      buttonClassName="!rounded-full !text-ui !shadow-neo-inset hover:ring-2 hover:ring-[var(--edge-iris)] focus-visible:ring-2 focus-visible:ring-[var(--edge-iris)]"
      matchTriggerWidth={false}
      className={className}
    />
  );
}
