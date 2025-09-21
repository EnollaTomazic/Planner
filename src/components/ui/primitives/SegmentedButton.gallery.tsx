import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import SegmentedButton from "./SegmentedButton";

const SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME =
  "[--hover:var(--seg-hover-base)] bg-[--hover] text-[hsl(var(--foreground))] [text-shadow:0_0_calc(var(--space-2)-var(--spacing-0-5))_hsl(var(--accent)/0.25)]";

const SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME =
  "ring-2 ring-[--theme-ring] ring-offset-0 outline-none";

const SEGMENTED_BUTTON_STATES: ReadonlyArray<{
  label: string;
  props: React.ComponentProps<typeof SegmentedButton>;
}> = [
  { label: "Default", props: { children: "Default" } },
  {
    label: "Hover",
    props: {
      children: "Hover",
      className: SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME,
    },
  },
  { label: "Active", props: { children: "Active", selected: true } },
  {
    label: "Focus-visible",
    props: {
      children: "Focus-visible",
      className: SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME,
    },
  },
  { label: "Disabled", props: { children: "Disabled", disabled: true } },
  { label: "Loading", props: { children: "Loading", loading: true } },
];

function SegmentedButtonGalleryPreview() {
  return (
    <div className="flex flex-wrap gap-[var(--space-2)]">
      {SEGMENTED_BUTTON_STATES.map(({ label, props }) => (
        <SegmentedButton key={label} {...props} />
      ))}
    </div>
  );
}

export default defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "segmented-button",
      name: "SegmentedButton",
      description: "Inline segmented action with pressed and loading states",
      kind: "primitive",
      tags: ["button", "segmented"],
      props: [
        { name: "as", type: "React.ElementType" },
        { name: "href", type: "string" },
        { name: "selected", type: "boolean", defaultValue: "false" },
        { name: "loading", type: "boolean", defaultValue: "false" },
        { name: "disabled", type: "boolean", defaultValue: "false" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: SEGMENTED_BUTTON_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:segmented-button:states",
        render: () => <SegmentedButtonGalleryPreview />,
      }),
      code: `<div className="flex flex-wrap gap-[var(--space-2)]">
  <SegmentedButton>Default</SegmentedButton>
  <SegmentedButton className="${SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME}">Hover</SegmentedButton>
  <SegmentedButton selected>Active</SegmentedButton>
  <SegmentedButton className="${SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME}">Focus-visible</SegmentedButton>
  <SegmentedButton disabled>Disabled</SegmentedButton>
  <SegmentedButton loading>Loading</SegmentedButton>
</div>`,
    },
  ],
});
