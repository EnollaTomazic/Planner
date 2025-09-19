import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Badge from "./Badge";

const ROLE_BADGES = [
  { tone: "top", label: "Top lane" },
  { tone: "jungle", label: "Jungle" },
  { tone: "mid", label: "Mid lane" },
  { tone: "bot", label: "Bot lane" },
  { tone: "support", label: "Support" },
] as const;

function BadgeGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="primary" interactive selected>
          Selected
        </Badge>
        <Badge tone="accent" interactive disabled>
          Disabled
        </Badge>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ROLE_BADGES.map(({ tone, label }) => (
          <Badge key={tone} tone={tone} glitch>
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "misc",
  entries: [
    {
      id: "badge",
      name: "Badge",
      description: "Compact pill with tone-driven styles",
      kind: "primitive",
      tags: ["badge", "pill"],
      props: [
        {
          name: "tone",
          type:
            '"neutral" | "primary" | "accent" | "top" | "jungle" | "mid" | "bot" | "support"',
          defaultValue: '"neutral"',
        },
        {
          name: "size",
          type: '"xs" | "sm"',
          defaultValue: '"sm"',
        },
        { name: "interactive", type: "boolean", defaultValue: "false" },
        { name: "selected", type: "boolean", defaultValue: "false" },
        { name: "glitch", type: "boolean", defaultValue: "false" },
      ],
      axes: [
        {
          id: "tone",
          label: "Tone",
          type: "variant",
          values: [
            { value: "Neutral" },
            { value: "Accent" },
            { value: "Primary" },
            { value: "Top lane" },
            { value: "Jungle" },
            { value: "Mid lane" },
            { value: "Bot lane" },
            { value: "Support" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: [
            { value: "Default" },
            { value: "Interactive" },
            { value: "Selected" },
            { value: "Disabled" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:badge:tones",
        render: () => <BadgeGalleryPreview />,
      }),
      code: `<div className="flex flex-col gap-[var(--space-3)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Badge tone="neutral">Neutral</Badge>
    <Badge tone="accent">Accent</Badge>
    <Badge tone="primary">Primary</Badge>
    <Badge tone="primary" interactive selected>
      Selected
    </Badge>
    <Badge tone="accent" interactive disabled>
      Disabled
    </Badge>
  </div>
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Badge tone="top" glitch>
      Top lane
    </Badge>
    <Badge tone="jungle" glitch>
      Jungle
    </Badge>
    <Badge tone="mid" glitch>
      Mid lane
    </Badge>
    <Badge tone="bot" glitch>
      Bot lane
    </Badge>
    <Badge tone="support" glitch>
      Support
    </Badge>
  </div>
</div>`,
    },
  ],
});
