import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Input from "./Input";

type InputStateSpec = {
  id: string;
  name: string;
  className?: string;
  props: React.ComponentProps<typeof Input>;
  code?: string;
};

const INPUT_STATES: readonly InputStateSpec[] = [
  {
    id: "default",
    name: "Default",
    props: { placeholder: "Default" },
    code: "<Input placeholder=\"Default\" />",
  },
  {
    id: "hover",
    name: "Hover",
    className: "bg-[--hover]",
    props: { placeholder: "Hover" },
    code: "<Input className=\"bg-[--hover]\" placeholder=\"Hover\" />",
  },
  {
    id: "focus",
    name: "Focus",
    className:
      "ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]",
    props: { placeholder: "Focus" },
    code:
      "<Input className=\"ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]\" placeholder=\"Focus\" />",
  },
  {
    id: "active",
    name: "Active",
    className: "bg-[--active]",
    props: { placeholder: "Active" },
    code: "<Input className=\"bg-[--active]\" placeholder=\"Active\" />",
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { placeholder: "Disabled", disabled: true },
    code: "<Input placeholder=\"Disabled\" disabled />",
  },
  {
    id: "loading",
    name: "Loading",
    props: { placeholder: "Loading", "data-loading": true },
    code: "<Input placeholder=\"Loading\" data-loading />",
  },
  {
    id: "custom-ring",
    name: "Custom ring",
    props: { placeholder: "Custom ring", ringTone: "danger" },
    code: "<Input placeholder=\"Custom ring\" ringTone=\"danger\" />",
  },
];

function InputStatePreview({ state }: { state: InputStateSpec }) {
  const { className, props } = state;
  return <Input className={className} {...props} />;
}

function InputGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {INPUT_STATES.map((state) => (
        <InputStatePreview key={state.id} state={state} />
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
        { name: "height", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"md"' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "data-loading", type: "boolean", defaultValue: "false" },
        {
          name: "ringTone",
          type: '"accent" | "danger" | "primary" | "success" | "warning"',
          defaultValue: "undefined",
        },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: INPUT_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:input:states",
        render: () => <InputGalleryPreview />,
      }),
      states: INPUT_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:input:state:${state.id}`,
          render: () => <InputStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-col gap-[var(--space-2)]">
  <Input placeholder="Default" />
  <Input placeholder="Hover" className="bg-[--hover]" />
  <Input placeholder="Focus" className="ring-2 ring-[var(--focus)]" />
  <Input placeholder="Active" className="bg-[--active]" />
  <Input placeholder="Disabled" disabled />
  <Input placeholder="Loading" data-loading />
  <Input placeholder="Custom ring" ringTone="danger" />
</div>`,
    },
  ],
});
