"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { SegmentedButton } from "./SegmentedButton";

const SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME =
  "[--hover:var(--seg-hover-base)] bg-[--hover] text-[hsl(var(--foreground))] [text-shadow:0_0_calc(var(--space-2)-var(--spacing-0-5))_hsl(var(--accent)/0.25)]";

const SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME =
  "ring-2 ring-[--theme-ring] ring-offset-0 outline-none";

export type SegmentedButtonStateSpec = {
  id: string;
  name: string;
  props: React.ComponentProps<typeof SegmentedButton>;
  code?: string;
};

const SEGMENTED_BUTTON_STATES: readonly SegmentedButtonStateSpec[] = [
  {
    id: "default",
    name: "Default",
    props: { children: "Default" },
    code: "<SegmentedButton>Default</SegmentedButton>",
  },
  {
    id: "hover",
    name: "Hover",
    props: {
      children: "Hover",
      className: SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME,
    },
    code: `<SegmentedButton className="${SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME}">Hover</SegmentedButton>`,
  },
  {
    id: "active",
    name: "Active",
    props: { children: "Active", selected: true },
    code: "<SegmentedButton selected>Active</SegmentedButton>",
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    props: {
      children: "Focus-visible",
      className: SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME,
    },
    code: `<SegmentedButton className="${SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME}">Focus-visible</SegmentedButton>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { children: "Disabled", disabled: true },
    code: "<SegmentedButton disabled>Disabled</SegmentedButton>",
  },
  {
    id: "disabled-link",
    name: "Disabled link",
    props: { as: "a", href: "#", children: "Disabled link", disabled: true },
    code: "<SegmentedButton as=\"a\" href=\"#\" disabled>Disabled link</SegmentedButton>",
  },
  {
    id: "loading",
    name: "Loading",
    props: { children: "Loading", loading: true },
    code: "<SegmentedButton loading>Loading</SegmentedButton>",
  },
];

export const SEGMENTED_BUTTON_STATE_SPECS: readonly SegmentedButtonStateSpec[] =
  SEGMENTED_BUTTON_STATES;

function SegmentedButtonStatePreview({
  state,
}: {
  state: SegmentedButtonStateSpec;
}) {
  return <SegmentedButton {...state.props} />;
}

function SegmentedButtonGalleryPreview() {
  return (
    <div className="flex flex-wrap gap-[var(--space-2)]">
      {SEGMENTED_BUTTON_STATES.map((state) => (
        <SegmentedButtonStatePreview key={state.id} state={state} />
      ))}
    </div>
  );
}

export const SegmentedButtonGallery = defineGallerySection({
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
          values: SEGMENTED_BUTTON_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:segmented-button:states",
        render: () => <SegmentedButtonGalleryPreview />,
      }),
      states: SEGMENTED_BUTTON_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:segmented-button:state:${state.id}`,
          render: () => <SegmentedButtonStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-wrap gap-[var(--space-2)]">
  <SegmentedButton>Default</SegmentedButton>
  <SegmentedButton className="${SEGMENTED_BUTTON_HOVER_STATE_CLASSNAME}">Hover</SegmentedButton>
  <SegmentedButton selected>Active</SegmentedButton>
  <SegmentedButton className="${SEGMENTED_BUTTON_FOCUS_VISIBLE_STATE_CLASSNAME}">Focus-visible</SegmentedButton>
  <SegmentedButton disabled>Disabled</SegmentedButton>
  <SegmentedButton as="a" href="#" disabled>Disabled link</SegmentedButton>
  <SegmentedButton loading>Loading</SegmentedButton>
</div>`,
    },
  ],
})

export default SegmentedButtonGallery
