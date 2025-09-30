import * as React from "react";

import { Star } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { NeonIcon, type NeonIconSize, type NeonIconTone } from "./NeonIcon";

const NEON_ICON_SIZES: readonly NeonIconSize[] = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

const NEON_ICON_SIZE_LABELS: Record<NeonIconSize, string> = {
  xs: "XS",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "XL",
  "2xl": "2XL",
};

interface NeonIconSizeState {
  readonly id: string;
  readonly name: string;
  readonly size: NeonIconSize;
  readonly description?: string;
  readonly code: string;
}

const NEON_ICON_SIZE_STATES: readonly NeonIconSizeState[] = NEON_ICON_SIZES.map((size) => ({
  id: `size-${size}`,
  name: NEON_ICON_SIZE_LABELS[size],
  size,
  description:
    size === "2xl"
      ? "Anchors to --icon-size-2xl so large toggles stay aligned with the space-9-plus rhythm."
      : undefined,
  code: `<NeonIcon icon={Star} on size=\"${size}\" />`,
}));

const NEON_ICON_TONES: readonly NeonIconTone[] = [
  "accent",
  "primary",
  "ring",
  "success",
  "warning",
  "danger",
  "info",
];

const NEON_ICON_TONE_LABELS: Record<NeonIconTone, string> = {
  accent: "Accent",
  primary: "Primary",
  ring: "Ring",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
};

function NeonIconStatePreview({ state }: { readonly state: NeonIconSizeState }) {
  const testId = state.size === "2xl" ? "neon-icon-2xl" : undefined;

  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] rounded-card border border-border/35 bg-surface/35 p-[var(--space-3)]">
      <NeonIcon icon={Star} on size={state.size} data-testid={testId} />
      <span className="text-label text-muted-foreground">{state.name}</span>
    </div>
  );
}

function NeonIconGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(calc(var(--space-9-plus)*2),1fr))] gap-[var(--space-3)]">
        {NEON_ICON_SIZE_STATES.map((state) => (
          <NeonIconStatePreview key={state.id} state={state} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
        {NEON_ICON_TONES.map((tone) => (
          <div
            key={tone}
            className="flex flex-col items-center gap-[var(--space-1)] rounded-full bg-muted/18 px-[var(--space-3)] py-[var(--space-2)]"
          >
            <NeonIcon icon={Star} on size="2xl" tone={tone} />
            <span className="text-caption font-medium tracking-[0.02em] text-muted-foreground">
              {NEON_ICON_TONE_LABELS[tone]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "neon-icon",
      name: "NeonIcon",
      description:
        "Animated neon glyph used for toggle affordances and scoreboard highlights. Glow layers respect tone tokens and reduced-motion preferences.",
      kind: "primitive",
      tags: ["icon", "glow", "toggle"],
      props: [
        { name: "icon", type: "React.ComponentType<React.SVGProps<SVGSVGElement>>" },
        { name: "on", type: "boolean", defaultValue: "false" },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"', defaultValue: '"md"' },
        { name: "tone", type: '"accent" | "primary" | "ring" | "success" | "warning" | "danger" | "info"', defaultValue: '"accent"' },
        { name: "colorVar", type: "string", description: "CSS variable override such as \"--primary\"." },
        { name: "scanlines", type: "boolean", defaultValue: "true" },
        { name: "aura", type: "boolean", defaultValue: "true" },
        { name: "className", type: "string" },
      ],
      axes: [
        {
          id: "size",
          label: "Size",
          type: "state",
          values: NEON_ICON_SIZE_STATES.map((state) => ({
            value: state.name,
            description: state.description,
          })),
        },
        {
          id: "tone",
          label: "Tone",
          type: "variant",
          values: NEON_ICON_TONES.map((tone) => ({
            value: NEON_ICON_TONE_LABELS[tone],
          })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:neon-icon:matrix",
        render: () => <NeonIconGalleryPreview />,
      }),
      states: NEON_ICON_SIZE_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        description: state.description,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:neon-icon:state:${state.id}`,
          render: () => <NeonIconStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-col gap-[var(--space-4)]">\n  <div className="grid grid-cols-[repeat(auto-fit,minmax(calc(var(--space-9-plus)*2),1fr))] gap-[var(--space-3)]">\n    <NeonIcon icon={Star} on size=\"xs\" />\n    <NeonIcon icon={Star} on size=\"sm\" />\n    <NeonIcon icon={Star} on size=\"md\" />\n    <NeonIcon icon={Star} on size=\"lg\" />\n    <NeonIcon icon={Star} on size=\"xl\" />\n    <NeonIcon icon={Star} on size=\"2xl\" />\n  </div>\n  <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"accent\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"primary\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"ring\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"success\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"warning\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"danger\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"info\" />\n  </div>\n</div>`,
    },
  ],
});
