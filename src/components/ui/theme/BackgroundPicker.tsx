"use client";

import * as React from "react";
import AnimatedSelect, { DropItem } from "@/components/ui/selects/AnimatedSelect";
import { BG_CLASSES, Background } from "@/lib/theme";
import { cn } from "@/lib/utils";

const BG_NAMES = ["Default", "Alt 1", "Alt 2", "Light", "VHS", "Streak"];

function Swatch({ className }: { className: string }) {
  return (
    <div className={cn("flex items-center gap-1 rounded-full p-1", className)}>
      <span className="h-3 w-3 rounded-full bg-background" />
      <span className="h-3 w-3 rounded-full bg-card" />
      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-accent to-accent-2" />
    </div>
  );
}

export type BackgroundPickerProps = {
  bg: Background;
  onBgChange: (bg: Background) => void;
  className?: string;
};

export default function BackgroundPicker({ bg, onBgChange, className = "" }: BackgroundPickerProps) {
  const items: DropItem[] = React.useMemo(
    () =>
      BG_CLASSES.map((cls, idx) => ({
        value: String(idx),
        label: (
          <div className="flex items-center gap-2">
            <Swatch className={cls} />
            <span>{BG_NAMES[idx]}</span>
          </div>
        ),
      })),
    [],
  );
  return (
    <AnimatedSelect
      ariaLabel="Background"
      prefixLabel="Background"
      items={items}
      value={String(bg)}
      onChange={v => onBgChange(Number(v) as Background)}
      buttonClassName="!h-9 !px-3 !rounded-full !text-sm !shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris] focus-visible:ring-2 focus-visible:ring-[--edge-iris]"
      matchTriggerWidth={false}
      className={className}
    />
  );
}
