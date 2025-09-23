"use client";

import * as React from "react";
import { AnimatedSelect, NativeSelect, Select } from "@/components/ui";

const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

export default function SelectShowcase() {
  const [value, setValue] = React.useState<string>();
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <AnimatedSelect
        items={items}
        value={value}
        onChange={setValue}
        placeholder="Animated"
      />
      <NativeSelect items={items} value={value} onChange={setValue} />
      <Select items={items} disabled placeholder="Disabled" />
    </div>
  );
}
