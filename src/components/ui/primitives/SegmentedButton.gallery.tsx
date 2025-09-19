import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import SegmentedButton from "./SegmentedButton";

const SEGMENTED_BUTTON_STATES = [
  { label: "Default", props: { children: "Default" } },
  { label: "Active", props: { children: "Active", isActive: true } },
  { label: "Disabled", props: { children: "Disabled", disabled: true } },
  { label: "Loading", props: { children: "Loading", loading: true } },
] satisfies ReadonlyArray<{
  label: string;
  props: React.ComponentProps<typeof SegmentedButton>;
}>;

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
        { name: "isActive", type: "boolean", defaultValue: "false" },
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
  <SegmentedButton isActive>Active</SegmentedButton>
  <SegmentedButton disabled>Disabled</SegmentedButton>
  <SegmentedButton loading>Loading</SegmentedButton>
</div>`,
    },
  ],
});
