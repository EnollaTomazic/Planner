"use client";

import * as React from "react";

import RadioIconGroup, {
  type RadioIconGroupTone,
} from "@/components/ui/toggles/RadioIconGroup";
import {
  RADIO_ICON_GROUP_DEMO_OPTIONS,
} from "@/components/ui/toggles/RadioIconGroup.gallery";

const TONES: readonly RadioIconGroupTone[] = [
  "accent",
  "primary",
  "info",
  "danger",
];

export default function RadioIconGroupShowcase() {
  const defaultValue = RADIO_ICON_GROUP_DEMO_OPTIONS[0]?.value ?? "";
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <RadioIconGroup
        options={RADIO_ICON_GROUP_DEMO_OPTIONS}
        value={value}
        onChange={setValue}
        tone="accent"
        size="md"
      />
      <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
        {TONES.map((tone) => (
          <div
            key={tone}
            className="space-y-[var(--space-2)] rounded-card border border-card-hairline/60 bg-card/70 p-[var(--space-3)] shadow-depth-soft"
          >
            <p className="text-label font-medium capitalize text-muted-foreground">{tone} tone</p>
            <RadioIconGroup
              options={RADIO_ICON_GROUP_DEMO_OPTIONS}
              value={value}
              onChange={setValue}
              tone={tone}
              size={tone === "danger" ? "lg" : tone === "info" ? "sm" : "md"}
            />
          </div>
        ))}
        <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline/60 bg-card/70 p-[var(--space-3)] shadow-depth-soft">
          <p className="text-label font-medium text-muted-foreground">Disabled</p>
          <RadioIconGroup
            options={RADIO_ICON_GROUP_DEMO_OPTIONS}
            value={value}
            tone="accent"
            disabled
          />
        </div>
        <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline/60 bg-card/70 p-[var(--space-3)] shadow-depth-soft">
          <p className="text-label font-medium text-muted-foreground">Loading</p>
          <RadioIconGroup
            options={RADIO_ICON_GROUP_DEMO_OPTIONS}
            value={value}
            loading
          />
        </div>
      </div>
    </div>
  );
}
