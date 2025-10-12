import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { Badge } from "./Badge";

const ROLE_BADGES = [
  { tone: "top", label: "Top lane" },
  { tone: "jungle", label: "Jungle" },
  { tone: "mid", label: "Mid lane" },
  { tone: "bot", label: "Bot lane" },
  { tone: "support", label: "Support" },
] as const;

const SIZE_OPTIONS = [
  { token: "sm", label: "Small" },
  { token: "md", label: "Medium" },
  { token: "lg", label: "Large" },
  { token: "xl", label: "Extra large" },
] as const;

function BadgeGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex flex-col gap-[var(--space-1)]">
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {SIZE_OPTIONS.map(({ token, label }) => (
            <Badge key={token} size={token}>
              {label}
            </Badge>
          ))}
        </div>
        <p className="text-caption text-muted-foreground">
          <code>xs</code> is available as an alias of <code>sm</code> for legacy badges.
        </p>
      </div>
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
      <p className="text-caption text-muted-foreground">
        Glitch rail tokens hue-shift per theme; Noir + Hardstuck clamp the
        overlay alpha so these role badges keep ≥3:1 text contrast across the
        noise.
      </p>
    </div>
  );
}

export const BadgeGallery = defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "badge",
      name: "Badge",
      description:
        "Compact pill with tone-driven styles. Accent tones now meet ≥4.5:1 contrast for white content",
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
          type: '"sm" | "md" | "lg" | "xl"',
          defaultValue: '"md"',
          description: 'Use "xs" as an alias for "sm" when migrating legacy code.',
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
          id: "size",
          label: "Size",
          type: "variant",
          values: SIZE_OPTIONS.map(({ label }) => ({ value: label })),
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
            {
              value: "Glitch overlay",
              description:
                "Glitch rail uses theme hue/alpha clamps so Noir + Hardstuck preserve ≥3:1 text contrast.",
            },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:badge:tones",
        render: () => <BadgeGalleryPreview />,
      }),
      code: `<div className="flex flex-col gap-[var(--space-3)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Badge size="sm">Small</Badge>
    <Badge size="md">Medium</Badge>
    <Badge size="lg">Large</Badge>
    <Badge size="xl">Extra large</Badge>
  </div>
  <p className="text-caption text-muted-foreground">
    <code>xs</code> is available as an alias of <code>sm</code> for legacy badges.
  </p>
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
})

export default BadgeGallery
