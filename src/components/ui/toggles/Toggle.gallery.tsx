"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { cn } from "@/lib/utils";

import { Toggle } from "./Toggle";

type ToggleProps = React.ComponentProps<typeof Toggle>;

type ToggleState = {
  id: string;
  name: string;
  className?: string;
  props?: Partial<ToggleProps>;
  code: string;
};

const TOGGLE_STATES: readonly ToggleState[] = [
  {
    id: "default",
    name: "Default",
    code: `<Toggle leftLabel="Left" rightLabel="Right" />`,
  },
  {
    id: "hover",
    name: "Hover",
    className: "bg-[--toggle-hover-surface]",
    code: `<Toggle leftLabel="Left" rightLabel="Right" className="bg-[--toggle-hover-surface]" />`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    className:
      "ring-2 ring-[var(--toggle-focus-ring)] ring-offset-2 ring-offset-[var(--surface-2)] shadow-[var(--toggle-focus-glow)] focus-visible:ring-2 focus-visible:ring-[var(--toggle-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]",
    code: `<Toggle
  leftLabel="Left"
  rightLabel="Right"
  className="ring-2 ring-[var(--toggle-focus-ring)] ring-offset-2 ring-offset-[var(--surface-2)] shadow-[var(--toggle-focus-glow)] focus-visible:ring-2 focus-visible:ring-[var(--toggle-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]"
/>`,
  },
  {
    id: "active",
    name: "Active",
    className: "bg-[--toggle-active-surface]",
    code: `<Toggle leftLabel="Left" rightLabel="Right" className="bg-[--toggle-active-surface]" />`,
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { disabled: true },
    code: `<Toggle leftLabel="Left" rightLabel="Right" disabled />`,
  },
  {
    id: "loading",
    name: "Loading",
    props: { loading: true },
    code: `<Toggle leftLabel="Left" rightLabel="Right" loading />`,
  },
] as const;

function ToggleStatePreview({ state }: { state: ToggleState }) {
  const { className, props } = state;
  const mergedClassName = cn(className, props?.className);

  return (
    <Toggle
      leftLabel={props?.leftLabel ?? "Left"}
      rightLabel={props?.rightLabel ?? "Right"}
      {...props}
      className={mergedClassName}
    />
  );
}

function ToggleGalleryPreview() {
  const [value, setValue] = React.useState<ToggleProps["value"]>("Left");

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Toggle
        leftLabel="Strategy"
        rightLabel="Execute"
        value={value}
        onChange={(next) => setValue(next)}
      />
      <div className="flex flex-col gap-[var(--space-2)]">
        <p className="text-caption text-muted-foreground">States</p>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {TOGGLE_STATES.map((state) => (
            <ToggleStatePreview key={state.id} state={state} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const ToggleGallery = defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "toggle",
      name: "Toggle",
      description: "Binary switch with hover, focus, active, disabled, and loading states",
      kind: "primitive",
      tags: ["toggle", "switch"],
      props: [
        { name: "leftLabel", type: "string" },
        { name: "rightLabel", type: "string" },
        { name: "value", type: '"Left" | "Right"', defaultValue: '"Left"' },
        { name: "onChange", type: '(value: "Left" | "Right") => void' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "loading", type: "boolean", defaultValue: "false" },
        { name: "className", type: "string" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: TOGGLE_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:toggle:interactive",
        render: () => <ToggleGalleryPreview />,
      }),
      states: TOGGLE_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:toggle:state:${state.id}`,
          render: () => <ToggleStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <Toggle leftLabel="Strategy" rightLabel="Execute" />
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Toggle leftLabel="Left" rightLabel="Right" />
    <Toggle leftLabel="Left" rightLabel="Right" className="bg-[--toggle-hover-surface]" />
    <Toggle
      leftLabel="Left"
      rightLabel="Right"
      className="ring-2 ring-[var(--toggle-focus-ring)] ring-offset-2 ring-offset-[var(--surface-2)] shadow-[var(--toggle-focus-glow)] focus-visible:ring-2 focus-visible:ring-[var(--toggle-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]"
    />
    <Toggle leftLabel="Left" rightLabel="Right" className="bg-[--toggle-active-surface]" />
    <Toggle leftLabel="Left" rightLabel="Right" disabled />
    <Toggle leftLabel="Left" rightLabel="Right" loading />
  </div>
</div>`,
    },
  ],
})

export default ToggleGallery
