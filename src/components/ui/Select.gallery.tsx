import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Select from "./Select";
import type { AnimatedSelectProps } from "./select/shared";

type SelectStateConfig = {
  label: string;
  buttonClassName?: string;
  className?: string;
  props?:
    | (Partial<Omit<AnimatedSelectProps, "items">> & {
        items?: AnimatedSelectProps["items"];
      })
    | undefined;
};

const SELECT_STATES: ReadonlyArray<SelectStateConfig> = [
  {
    label: "Default",
  },
  {
    label: "Hover",
    buttonClassName: "bg-[--hover]",
  },
  {
    label: "Focus-visible",
    className:
      "rounded-[var(--control-radius)] ring-2 ring-[var(--theme-ring)] ring-offset-0",
  },
  {
    label: "Active",
    buttonClassName: "bg-[--active]",
  },
  {
    label: "Disabled",
    props: { disabled: true },
  },
  {
    label: "Loading",
    buttonClassName: "pointer-events-none opacity-[var(--loading)]",
  },
];

const ITEMS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

type ItemValue = (typeof ITEMS)[number]["value"];

function SelectGalleryPreview() {
  const [value, setValue] = React.useState<ItemValue>(ITEMS[0]?.value ?? "one");

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        <Select
          items={[...ITEMS]}
          value={value}
          onChange={(next) => setValue(next as ItemValue)}
          placeholder="Animated select"
          className="w-full sm:w-auto"
        />
        <Select
          items={[...ITEMS]}
          variant="native"
          value={value}
          onChange={(next) => setValue(next as ItemValue)}
          aria-label="Native select"
          className="w-full sm:w-auto"
        />
      </div>
      <div className="flex flex-col gap-[var(--space-2)]">
        <p className="text-caption text-muted-foreground">States</p>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {SELECT_STATES.map(({ label, buttonClassName, className, props }) => {
            const { items: stateItems, ...restProps } = props ?? {};
            const sampleItems = stateItems ?? ITEMS;
            const baseClassName = "w-full sm:w-auto";
            const finalClassName = className
              ? `${baseClassName} ${className}`
              : baseClassName;

            return (
              <Select
                key={label}
                items={[...sampleItems]}
                placeholder={label}
                ariaLabel={label}
                buttonClassName={buttonClassName}
                className={finalClassName}
                {...restProps}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "select",
      name: "Select",
      description: "Animated trigger with native fallback",
      kind: "primitive",
      tags: ["select", "input"],
      props: [
        {
          name: "items",
          type: "readonly { value: string; label: React.ReactNode }[]",
          required: true,
        },
        { name: "value", type: "string | undefined" },
        { name: "onChange", type: "(value: string) => void" },
        { name: "placeholder", type: "string" },
        { name: "variant", type: '"animated" | "native"', defaultValue: '"animated"' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
      ],
      axes: [
        {
          id: "variant",
          label: "Variant",
          type: "variant",
          values: [
            { value: "Animated" },
            { value: "Native" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: SELECT_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:select:variants",
        render: () => <SelectGalleryPreview />,
      }),
      code: `const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
];

const SELECT_STATES = [
  { label: "Default" },
  { label: "Hover", buttonClassName: "bg-[--hover]" },
  {
    label: "Focus-visible",
    className: "rounded-[var(--control-radius)] ring-2 ring-[var(--theme-ring)] ring-offset-0",
  },
  { label: "Active", buttonClassName: "bg-[--active]" },
  { label: "Disabled", props: { disabled: true } },
  {
    label: "Loading",
    buttonClassName: "pointer-events-none opacity-[var(--loading)]",
  },
];

const [value, setValue] = React.useState(items[0]?.value ?? "");

<div className="flex flex-col gap-[var(--space-4)]">
  <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
    <Select
      items={items}
      value={value}
      onChange={setValue}
      placeholder="Animated select"
      className="w-full sm:w-auto"
    />
    <Select
      items={items}
      variant="native"
      value={value}
      onChange={setValue}
      aria-label="Native select"
      className="w-full sm:w-auto"
    />
  </div>
  <div className="flex flex-col gap-[var(--space-2)]">
    <p className="text-caption text-muted-foreground">States</p>
    <div className="flex flex-wrap gap-[var(--space-2)]">
      {SELECT_STATES.map(({ label, buttonClassName, className, props }) => {
        const { items: stateItems, ...restProps } = props ?? {};
        const sampleItems = stateItems ?? items;
        const baseClassName = "w-full sm:w-auto";
        const finalClassName = className
          ? baseClassName + " " + className
          : baseClassName;

        return (
          <Select
            key={label}
            items={[...sampleItems]}
            placeholder={label}
            ariaLabel={label}
            buttonClassName={buttonClassName}
            className={finalClassName}
            {...restProps}
          />
        );
      })}
    </div>
  </div>
</div>`,
    },
  ],
});
