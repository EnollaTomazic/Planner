import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Input from "./Input";

const INPUT_STATES = [
  {
    label: "Default",
    className: undefined,
    props: { placeholder: "Default" },
  },
  {
    label: "Hover",
    className: "bg-[--hover]",
    props: { placeholder: "Hover" },
  },
  {
    label: "Focus",
    className: "ring-2 ring-[var(--focus)]",
    props: { placeholder: "Focus" },
  },
  {
    label: "Active",
    className: "bg-[--active]",
    props: { placeholder: "Active" },
  },
  {
    label: "Disabled",
    className: undefined,
    props: { placeholder: "Disabled", disabled: true },
  },
  {
    label: "Loading",
    className: undefined,
    props: { placeholder: "Loading", "data-loading": true },
  },
] satisfies ReadonlyArray<{
  label: string;
  className?: string;
  props: React.ComponentProps<typeof Input>;
}>;

function InputGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {INPUT_STATES.map(({ label, className, props }) => (
        <Input key={label} className={className} {...props} />
      ))}
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "input",
      name: "Input",
      description: "Standard text input with semantic states",
      kind: "primitive",
      tags: ["input", "text"],
      props: [
        { name: "placeholder", type: "string" },
        { name: "height", type: '"sm" | "md" | "lg"', defaultValue: '"md"' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "data-loading", type: "boolean", defaultValue: "false" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: INPUT_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:input:states",
        render: () => <InputGalleryPreview />,
      }),
      code: `<div className="flex flex-col gap-[var(--space-2)]">
  <Input placeholder="Default" />
  <Input placeholder="Hover" className="bg-[--hover]" />
  <Input placeholder="Focus" className="ring-2 ring-[var(--focus)]" />
  <Input placeholder="Active" className="bg-[--active]" />
  <Input placeholder="Disabled" disabled />
  <Input placeholder="Loading" data-loading />
</div>`,
    },
  ],
});
