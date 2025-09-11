"use client";

import * as React from "react";
import { Select, type SelectItem } from "@/components/ui";
import { VARIANTS, Variant } from "@/lib/theme";

export type ThemePickerProps = {
  variant: Variant;
  onVariantChange: (v: Variant) => void;
  className?: string;
};

export default function ThemePicker({ variant, onVariantChange, className = "" }: ThemePickerProps) {
  const items: SelectItem[] = React.useMemo(() => VARIANTS.map(v => ({ value: v.id, label: v.label })), []);
  return (
    <Select
      variant="animated"
      ariaLabel="Theme"
      prefixLabel="Theme"
      items={items}
      value={variant}
      onChange={v => onVariantChange(v as Variant)}
      buttonClassName="!h-9 !px-3 !rounded-full !text-sm !shadow-neo-inset hover:ring-2 hover:ring-[--edge-iris] focus-visible:ring-2 focus-visible:ring-[--edge-iris]"
      matchTriggerWidth={false}
      className={className}
    />
  );
}
