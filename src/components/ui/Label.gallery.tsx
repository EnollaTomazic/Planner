import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { Input } from "@/components/ui";

import { Label } from "./Label";

type LabelState = {
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  code: string;
};

const LABEL_STATES: readonly LabelState[] = [
  {
    id: "default",
    name: "Default",
    label: "Email",
    code: `<div className="flex flex-col gap-[var(--space-1)]">
  <Label htmlFor="label-state-default">Email</Label>
  <Input id="label-state-default" placeholder="player@example.gg" />
</div>`,
  },
  {
    id: "hover",
    name: "Hover",
    label: "Email",
    labelClassName: "text-accent transition-colors",
    inputClassName: "border-primary/60",
    code: `<div className="flex flex-col gap-[var(--space-1)]">
  <Label htmlFor="label-state-hover" className="text-accent transition-colors">Email</Label>
  <Input
    id="label-state-hover"
    placeholder="player@example.gg"
    className="border-primary/60"
  />
</div>`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    label: "Email",
    labelClassName: "text-ring transition-colors",
    inputClassName:
      "ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]",
    code: `<div className="flex flex-col gap-[var(--space-1)]">
  <Label htmlFor="label-state-focus" className="text-ring transition-colors">Email</Label>
  <Input
    id="label-state-focus"
    placeholder="player@example.gg"
    className="ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]"
  />
</div>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    label: "Email",
    disabled: true,
    code: `<div className="flex flex-col gap-[var(--space-1)] opacity-80">
  <Label htmlFor="label-state-disabled">Email</Label>
  <Input id="label-state-disabled" placeholder="player@example.gg" disabled />
</div>`,
  },
];

function LabelStatePreview({ state }: { state: LabelState }) {
  const inputId = `label-state-${state.id}`;
  const containerClassName = state.disabled
    ? "flex flex-col gap-[var(--space-1)] opacity-80"
    : "flex flex-col gap-[var(--space-1)]";

  return (
    <div className={containerClassName}>
      <Label htmlFor={inputId} className={state.labelClassName}>
        {state.label}
      </Label>
      <Input
        id={inputId}
        placeholder="player@example.gg"
        disabled={state.disabled}
        className={state.inputClassName}
      />
    </div>
  );
}

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

export const LabelGallery = defineGallerySection({
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
            { value: "Hover" },
            { value: "Focus-visible" },
            { value: "Disabled" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:label:pairing",
        render: () => <LabelGalleryPreview />,
      }),
      states: LABEL_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:label:state:${state.id}`,
          render: () => <LabelStatePreview state={state} />,
        }),
      })),
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
})

export default LabelGallery
