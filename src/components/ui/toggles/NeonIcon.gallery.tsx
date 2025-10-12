import * as React from "react";
import { Zap } from "lucide-react";

import {
  createGalleryPreview,
  defineGallerySection,
} from "@/components/gallery/registry";

import { NeonIcon } from "./NeonIcon";

type NeonIconProps = React.ComponentProps<typeof NeonIcon>;

type NeonIconState = {
  readonly id: string;
  readonly name: string;
  readonly props: Partial<NeonIconProps>;
  readonly code: string;
};

const BASE_PROPS: Pick<NeonIconProps, "icon" | "on"> = {
  icon: Zap,
  on: true,
};

const NEON_ICON_STATES: readonly NeonIconState[] = [
  {
    id: "accent",
    name: "Accent (lit)",
    props: { tone: "accent" },
    code: `<NeonIcon icon={Zap} on tone="accent" />`,
  },
  {
    id: "danger",
    name: "Danger (lit)",
    props: { tone: "danger" },
    code: `<NeonIcon icon={Zap} on tone="danger" />`,
  },
  {
    id: "danger-off",
    name: "Danger (powerdown)",
    props: { tone: "danger", on: false },
    code: `<NeonIcon icon={Zap} on={false} tone="danger" />`,
  },
  {
    id: "accent-2xl",
    name: "Accent 2xl",
    props: { tone: "accent", size: "2xl" },
    code: `<NeonIcon icon={Zap} on tone="accent" size="2xl" />`,
  },
] as const;

function NeonIconStatePreview({ state }: { readonly state: NeonIconState }) {
  return <NeonIcon {...BASE_PROPS} {...state.props} />;
}

function NeonIconGalleryPreview() {
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-4)]">
      <NeonIcon {...BASE_PROPS} tone="accent" />
      <NeonIcon {...BASE_PROPS} tone="primary" />
      <NeonIcon {...BASE_PROPS} tone="ring" />
      <NeonIcon {...BASE_PROPS} tone="success" />
      <NeonIcon {...BASE_PROPS} tone="warning" />
      <NeonIcon {...BASE_PROPS} tone="danger" />
      <NeonIcon {...BASE_PROPS} tone="danger" on={false} />
      <NeonIcon {...BASE_PROPS} tone="accent" size="2xl" />
    </div>
  );
}

export const NeonIconGallery = defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "neon-icon",
      name: "NeonIcon",
      description: "Animated neon glyph with tone-driven glow ramps and power states.",
      kind: "primitive",
      tags: ["icon", "toggle", "glow"],
      props: [
        {
          name: "icon",
          type: "React.ComponentType<React.SVGProps<SVGSVGElement>>",
        },
        { name: "on", type: "boolean" },
        {
          name: "tone",
          type:
            '"accent" | "primary" | "ring" | "success" | "warning" | "danger" | "info"',
          defaultValue: '"accent"',
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
          defaultValue: '"md"',
        },
        { name: "scanlines", type: "boolean", defaultValue: "true" },
        { name: "aura", type: "boolean", defaultValue: "true" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: NEON_ICON_STATES.map((state) => ({ value: state.name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:neon-icon:gallery",
        render: () => <NeonIconGalleryPreview />,
      }),
      states: NEON_ICON_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:neon-icon:state:${state.id}`,
          render: () => <NeonIconStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-wrap items-center gap-[var(--space-4)]">
  <NeonIcon icon={Zap} on tone="accent" />
  <NeonIcon icon={Zap} on tone="primary" />
  <NeonIcon icon={Zap} on tone="ring" />
  <NeonIcon icon={Zap} on tone="success" />
  <NeonIcon icon={Zap} on tone="warning" />
  <NeonIcon icon={Zap} on tone="danger" />
  <NeonIcon icon={Zap} on={false} tone="danger" />
  <NeonIcon icon={Zap} on tone="accent" size="2xl" />
</div>`,
    },
  ],
})

export default NeonIconGallery
