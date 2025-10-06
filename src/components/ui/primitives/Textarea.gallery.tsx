import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Textarea from "./Textarea";

type TextareaStateSpec = {
  id: string;
  name: string;
  className?: string;
  textareaClassName?: string;
  props: React.ComponentProps<typeof Textarea>;
  code?: string;
};

const TEXTAREA_STATES: readonly TextareaStateSpec[] = [
  {
    id: "default",
    name: "Default",
    props: { placeholder: "Share your thoughts" },
    code: "<Textarea placeholder=\"Share your thoughts\" />",
  },
  {
    id: "hover",
    name: "Hover",
    className: "bg-[--hover]",
    props: { placeholder: "Hover" },
    code: "<Textarea className=\"bg-[--hover]\" placeholder=\"Hover\" />",
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    className:
      "ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]",
    props: { placeholder: "Focus-visible" },
    code:
      "<Textarea className=\"ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]\" placeholder=\"Focus-visible\" />",
  },
  {
    id: "active",
    name: "Active",
    className: "bg-[--active]",
    props: { placeholder: "Active" },
    code: "<Textarea className=\"bg-[--active]\" placeholder=\"Active\" />",
  },
  {
    id: "invalid",
    name: "Invalid",
    className:
      "ring-2 ring-[hsl(var(--danger))] ring-offset-0 ring-offset-[hsl(var(--bg))]",
    props: { placeholder: "Needs attention", "aria-invalid": true },
    code:
      "<Textarea\n  className=\"ring-2 ring-[hsl(var(--danger))] ring-offset-0 ring-offset-[hsl(var(--bg))]\"\n  placeholder=\"Needs attention\"\n  aria-invalid\n/>",
  },
  {
    id: "read-only",
    name: "Read-only",
    className: "bg-[hsl(var(--card)/0.72)]",
    textareaClassName: "text-muted-foreground",
    props: { placeholder: "Read-only", readOnly: true },
    code: "<Textarea\n  className=\"bg-[hsl(var(--card)/0.72)]\"\n  textareaClassName=\"text-muted-foreground\"\n  readOnly\n  placeholder=\"Read-only\"\n/>",
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { placeholder: "Disabled", disabled: true },
    code: "<Textarea placeholder=\"Disabled\" disabled />",
  },
  {
    id: "loading",
    name: "Loading",
    props: { placeholder: "Loading", "data-loading": true },
    code: "<Textarea placeholder=\"Loading\" data-loading />",
  },
];

function TextareaStatePreview({ state }: { state: TextareaStateSpec }) {
  const { className, textareaClassName, props } = state;
  return (
    <Textarea
      className={className}
      textareaClassName={textareaClassName}
      {...props}
    />
  );
}

function TextareaGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {TEXTAREA_STATES.map((state) => (
        <TextareaStatePreview key={state.id} state={state} />
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
          values: TEXTAREA_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:textarea:states",
        render: () => <TextareaGalleryPreview />,
      }),
      states: TEXTAREA_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:textarea:state:${state.id}`,
          render: () => <TextareaStatePreview state={state} />,
        }),
      })),
      code: `<Textarea placeholder="Share your thoughts" />
<Textarea placeholder="Hover" className="bg-[--hover]" />
<Textarea placeholder="Focus-visible" className="ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]" />
<Textarea placeholder="Active" className="bg-[--active]" />
<Textarea
  placeholder="Needs attention"
  className="ring-2 ring-[hsl(var(--danger))] ring-offset-0 ring-offset-[hsl(var(--bg))]"
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
