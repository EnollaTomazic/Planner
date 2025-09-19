import * as React from "react";
import { Plus } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery";

import IconButton from "./IconButton";

const ICON_BUTTON_STATES = [
  {
    label: "Default",
    className: undefined,
    props: { "aria-label": "Default", children: <Plus aria-hidden /> },
  },
  {
    label: "Hover",
    className: "bg-[--hover]",
    props: { "aria-label": "Hover", children: <Plus aria-hidden /> },
  },
  {
    label: "Focus",
    className: "ring-2 ring-[var(--focus)]",
    props: { "aria-label": "Focus", children: <Plus aria-hidden /> },
  },
  {
    label: "Active",
    className: "bg-[--active]",
    props: {
      "aria-label": "Active",
      "aria-pressed": true,
      children: <Plus aria-hidden />,
    },
  },
  {
    label: "Disabled",
    className: undefined,
    props: {
      "aria-label": "Disabled",
      children: <Plus aria-hidden />,
      disabled: true,
    },
  },
  {
    label: "Loading",
    className: undefined,
    props: {
      "aria-label": "Loading",
      children: <Plus aria-hidden />,
      loading: true,
    },
  },
] satisfies ReadonlyArray<{
  label: string;
  className?: string;
  props: React.ComponentProps<typeof IconButton>;
}>;

const ICON_BUTTON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

function IconButtonGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ICON_BUTTON_SIZES.map((size) => (
          <IconButton
            key={size}
            size={size}
            variant="ring"
            aria-label={`Add item ${size}`}
          >
            <Plus aria-hidden />
          </IconButton>
        ))}
        <IconButton size="md" variant="glow" aria-label="Add item glow">
          <Plus aria-hidden />
        </IconButton>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ICON_BUTTON_STATES.map(({ label, className, props }) => (
          <IconButton key={label} className={className} {...props} />
        ))}
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "icon-button",
      name: "IconButton",
      description: "Size, variant, and state coverage",
      kind: "primitive",
      tags: ["button", "icon"],
      props: [
        {
          name: "variant",
          type: '"ring" | "glow"',
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl"',
        },
        {
          name: "loading",
          type: "boolean",
          defaultValue: "false",
        },
      ],
      axes: [
        {
          id: "variant",
          label: "Variant",
          type: "variant",
          values: [
            { value: "Ring" },
            { value: "Glow" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: ICON_BUTTON_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:icon-button:matrix",
        render: () => <IconButtonGalleryPreview />,
      }),
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <IconButton size="xs" variant="ring" aria-label="Add item xs">
      <Plus />
    </IconButton>
    <IconButton size="sm" variant="ring" aria-label="Add item sm">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="ring" aria-label="Add item md">
      <Plus />
    </IconButton>
    <IconButton size="lg" variant="ring" aria-label="Add item lg">
      <Plus />
    </IconButton>
    <IconButton size="xl" variant="ring" aria-label="Add item xl">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="glow" aria-label="Add item glow">
      <Plus />
    </IconButton>
  </div>
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <IconButton aria-label="Default">
      <Plus />
    </IconButton>
    <IconButton className="bg-[--hover]" aria-label="Hover">
      <Plus />
    </IconButton>
    <IconButton className="ring-2 ring-[var(--focus)]" aria-label="Focus">
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--active]"
      aria-pressed
      aria-label="Active"
    >
      <Plus />
    </IconButton>
    <IconButton disabled aria-label="Disabled">
      <Plus />
    </IconButton>
    <IconButton loading aria-label="Loading">
      <Plus />
    </IconButton>
  </div>
</div>`,
    },
  ],
});
