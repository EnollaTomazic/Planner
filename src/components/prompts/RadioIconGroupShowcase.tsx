"use client";

import * as React from "react";

import { Button } from "@/components/ui";
import { RadioIconGroup } from "@/components/ui/radio/RadioIconGroup";
import {
  RADIO_ICON_GROUP_DEMO_OPTIONS,
  RADIO_ICON_GROUP_SIZES,
  RADIO_ICON_GROUP_TONES,
} from "@/components/ui/radio/RadioIconGroup.gallery";

export function RadioIconGroupShowcase() {
  const defaultValue = RADIO_ICON_GROUP_DEMO_OPTIONS[0]?.value ?? null;
  const [value, setValue] = React.useState<string | null>(defaultValue);
  const baseName = React.useId();

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
        <div className="flex items-center justify-between gap-[var(--space-2)]">
          <p className="text-label font-medium text-muted-foreground">Null selection</p>
          <Button
            variant="neo"
            size="sm"
            onClick={() => setValue(null)}
            className="shrink-0"
          >
            Clear
          </Button>
        </div>
        <RadioIconGroup
          name={`${baseName}-accent-primary`}
          options={RADIO_ICON_GROUP_DEMO_OPTIONS}
          value={value}
          onChange={setValue}
          tone="accent"
          size="md"
        />
      </div>
      <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
        {RADIO_ICON_GROUP_TONES.map((tone, toneIndex) => (
          <div
            key={tone}
            className="space-y-[var(--space-2)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]"
          >
            <p className="text-label font-medium capitalize text-muted-foreground">{tone} tone</p>
            <RadioIconGroup
              name={`${baseName}-${tone}`}
              options={RADIO_ICON_GROUP_DEMO_OPTIONS}
              value={value}
              onChange={setValue}
              tone={tone}
              size={RADIO_ICON_GROUP_SIZES[toneIndex % RADIO_ICON_GROUP_SIZES.length] ?? "md"}
            />
          </div>
        ))}
        <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
          <p className="text-label font-medium text-muted-foreground">Disabled</p>
          <RadioIconGroup
            name={`${baseName}-disabled`}
            options={RADIO_ICON_GROUP_DEMO_OPTIONS}
            value={value}
            tone="accent"
            disabled
            onChange={setValue}
          />
        </div>
        <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
          <p className="text-label font-medium text-muted-foreground">Loading</p>
          <RadioIconGroup
            name={`${baseName}-loading`}
            options={RADIO_ICON_GROUP_DEMO_OPTIONS}
            value={value}
            loading
            onChange={setValue}
          />
        </div>
      </div>
    </div>
  );
}
