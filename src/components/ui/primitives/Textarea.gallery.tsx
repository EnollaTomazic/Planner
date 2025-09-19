import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Textarea from "./Textarea";

const TEXTAREA_STATES = [
  { label: "Default", props: { placeholder: "Share your thoughts" } },
  {
    label: "Invalid",
    props: { placeholder: "Needs attention", "aria-invalid": true },
  },
  {
    label: "Read only",
    props: { placeholder: "Read only", readOnly: true },
  },
  {
    label: "Disabled",
    props: { placeholder: "Disabled", disabled: true },
  },
] satisfies ReadonlyArray<{
  label: string;
  props: React.ComponentProps<typeof Textarea>;
}>;

function TextareaGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {TEXTAREA_STATES.map(({ label, props }) => (
        <Textarea key={label} {...props} />
      ))}
      <Textarea
        placeholder="Resizable textarea"
        resize="resize-y"
        aria-label="Resizable textarea"
      />
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "textarea",
      name: "Textarea",
      description: "Multi-line text input with Field styling",
      kind: "primitive",
      tags: ["textarea", "input"],
      props: [
        { name: "placeholder", type: "string" },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "readOnly", type: "boolean", defaultValue: "false" },
        {
          name: "aria-invalid",
          type: 'boolean | "grammar" | "spelling" | undefined',
        },
        { name: "resize", type: "string" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: TEXTAREA_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:textarea:states",
        render: () => <TextareaGalleryPreview />,
      }),
      code: `<Textarea placeholder="Share your thoughts" />
<Textarea placeholder="Needs attention" aria-invalid />
<Textarea placeholder="Read only" readOnly />
<Textarea placeholder="Disabled" disabled />
<Textarea placeholder="Resizable textarea" resize="resize-y" aria-label="Resizable textarea" />`,
    },
  ],
});
