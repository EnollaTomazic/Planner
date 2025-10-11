"use client";

import * as React from "react";
import type { SelectItem } from "@/components/ui";
import { BG_CLASSES, Background } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { SettingsSelect } from "./SettingsSelect";

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
  buttonClassName?: string;
  disabled?: boolean;
  loadingBackground?: Background | null;
};

export function BackgroundPicker({
  bg,
  onBgChange,
  className = "",
  buttonClassName,
  disabled = false,
  loadingBackground = null,
}: BackgroundPickerProps) {
  const items: SelectItem[] = React.useMemo(
    () =>
      BG_CLASSES.map((cls, idx) => {
        const background = idx as Background;
        return {
          value: String(idx),
          label: (
            <div className="flex items-center gap-[var(--space-2)]">
              <Swatch className={cls} />
              <span>{BG_NAMES[idx]}</span>
            </div>
          ),
          loading: loadingBackground === background,
        } satisfies SelectItem;
      }),
    [loadingBackground],
  );
  return (
    <SettingsSelect
      ariaLabel="Background"
      prefixLabel="Background"
      items={items}
      value={String(bg)}
      onChange={(v) => onBgChange(Number(v) as Background)}
      className={className}
      buttonClassName={buttonClassName}
      disabled={disabled}
    />
  );
}
