import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Textarea from "./Textarea";

const TEXTAREA_STATES = [
  {
    label: "Default",
    className: undefined,
    textareaClassName: undefined,
    props: { placeholder: "Share your thoughts" },
  },
  {
    label: "Hover",
    className: "bg-[--hover]",
    textareaClassName: undefined,
    props: { placeholder: "Hover" },
  },
  {
    label: "Focus-visible",
    className: "ring-2 ring-[hsl(var(--ring))]",
    textareaClassName: undefined,
    props: { placeholder: "Focus-visible" },
  },
  {
    label: "Active",
    className: "bg-[--active]",
    textareaClassName: undefined,
    props: { placeholder: "Active" },
  },
  {
    label: "Invalid",
    className: "ring-2 ring-[hsl(var(--danger))]",
    textareaClassName: undefined,
    props: { placeholder: "Needs attention", "aria-invalid": true },
  },
  {
    label: "Read-only",
    className: "bg-[hsl(var(--card)/0.72)]",
    textareaClassName: "text-muted-foreground",
    props: { placeholder: "Read-only", readOnly: true },
  },
  {
    label: "Disabled",
    className: undefined,
    textareaClassName: undefined,
    props: { placeholder: "Disabled", disabled: true },
  },
  {
    label: "Loading",
    className: undefined,
    textareaClassName: undefined,
    props: { placeholder: "Loading", "data-loading": true },
  },
] satisfies ReadonlyArray<{
  label: string;
  className?: string;
  textareaClassName?: string;
  props: React.ComponentProps<typeof Textarea>;
}>;

function TextareaGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {TEXTAREA_STATES.map(({ label, className, textareaClassName, props }) => (
        <Textarea
          key={label}
          className={className}
          textareaClassName={textareaClassName}
          {...props}
        />
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
        { name: "data-loading", type: "boolean", defaultValue: "false" },
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
<Textarea placeholder="Hover" className="bg-[--hover]" />
<Textarea placeholder="Focus-visible" className="ring-2 ring-[hsl(var(--ring))]" />
<Textarea placeholder="Active" className="bg-[--active]" />
<Textarea
  placeholder="Needs attention"
  className="ring-2 ring-[hsl(var(--danger))]"
  aria-invalid
/> 
<Textarea
  placeholder="Read-only"
  className="bg-[hsl(var(--card)/0.72)]"
  textareaClassName="text-muted-foreground"
  readOnly
/> 
<Textarea placeholder="Disabled" disabled />
<Textarea placeholder="Loading" data-loading />
<Textarea placeholder="Resizable textarea" resize="resize-y" aria-label="Resizable textarea" />`,
    },
  ],
});
