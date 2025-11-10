"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { Input } from "./Input";

export type InputStateSpec = {
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
      "ring-2 ring-ring ring-offset-2 ring-offset-background shadow-[var(--shadow-glow-md)] outline-none",
    props: { placeholder: "Focus" },
    code:
      "<Input className=\"ring-2 ring-ring ring-offset-2 ring-offset-background shadow-[var(--shadow-glow-md)] outline-none\" placeholder=\"Focus\" />",
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
  {
    id: "sunken",
    name: "Sunken",
    props: {
      placeholder: "Sunken inset",
      variant: "sunken",
    },
    code: "<Input placeholder=\"Sunken inset\" variant=\"sunken\" />",
  },
  {
    id: "glitch",
    name: "Glitch overlay",
    props: {
      placeholder: "Glitch overlay",
      variant: "sunken",
      glitch: true,
      glitchText: "Summoner search",
    },
    code: `<Input glitch glitchText="Summoner search" placeholder="Glitch overlay" variant="sunken" />`,
  },
];

export const INPUT_STATE_SPECS: readonly InputStateSpec[] = INPUT_STATES;

function InputStatePreview({ state }: { state: InputStateSpec }) {
  const { className, props } = state;
  return <Input className={className} {...props} />;
}

function InputGalleryPreview() {
  const glitchState = INPUT_STATES.find((state) => state.id === "glitch");
  const standardStates = INPUT_STATES.filter((state) => state.id !== "glitch");

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {standardStates.map((state) => (
        <InputStatePreview key={state.id} state={state} />
      ))}
      {glitchState ? (
        <div className="space-y-[var(--space-1)]">
          <InputStatePreview state={glitchState} />
          <p className="text-caption text-muted-foreground">
            Sunken shells use{" "}
            <code className="mx-[var(--space-1)]">
              --glitch-overlay-button-opacity-reduced
            </code>
            so Noir and Hardstuck maintain ≥4.5:1 placeholder contrast while the
            overlay animates.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export const InputGallery = defineGallerySection({
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
          values: INPUT_STATES.map(({ name, id }) => ({
            value: name,
            description:
              id === "glitch"
                ? "Glitch overlay inherits Field's reduced opacity token so Noir + Hardstuck stay above 4.5:1."
                : undefined,
          })),
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
})

export default InputGallery
