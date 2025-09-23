"use client";

import * as React from "react";
import { Toggle } from "@/components/ui";

export default function ToggleShowcase() {
  const [value, setValue] = React.useState<"Left" | "Right">("Left");
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Toggle value={value} onChange={setValue} />
      <Toggle disabled />
      <Toggle loading />
    </div>
  );
}
