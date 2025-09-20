import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { Input } from "@/components/ui";

import Label from "./Label";

function LabelGalleryPreview() {
  return (
    <div className="flex w-[calc(var(--space-8)*4)] flex-col gap-[var(--space-3)]">
      <div>
        <Label htmlFor="label-default">Email</Label>
        <Input id="label-default" placeholder="player@example.gg" />
      </div>
      <div className="opacity-80">
        <Label htmlFor="label-disabled">Disabled</Label>
        <Input id="label-disabled" placeholder="Disabled input" disabled />
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "label",
      name: "Label",
      description: "Text label paired with inputs for accessible forms",
      kind: "primitive",
      tags: ["label", "input"],
      props: [
        { name: "htmlFor", type: "string" },
        { name: "className", type: "string" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: [
            { value: "Default" },
            { value: "Disabled" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:label:pairing",
        render: () => <LabelGalleryPreview />,
      }),
      code: `<div className="w-[calc(var(--space-8)*4)] space-y-[var(--space-3)]">
  <div>
    <Label htmlFor="label-default">Email</Label>
    <Input id="label-default" placeholder="player@example.gg" />
  </div>
  <div className="opacity-80">
    <Label htmlFor="label-disabled">Disabled</Label>
    <Input id="label-disabled" placeholder="Disabled input" disabled />
  </div>
</div>`,
    },
  ],
});
