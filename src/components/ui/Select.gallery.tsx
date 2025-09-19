import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Select from "./Select";

const ITEMS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

type ItemValue = (typeof ITEMS)[number]["value"];

function SelectGalleryPreview() {
  const [value, setValue] = React.useState<ItemValue>(ITEMS[0]?.value ?? "one");

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Select
        items={[...ITEMS]}
        value={value}
        onChange={(next) => setValue(next as ItemValue)}
        placeholder="Animated select"
      />
      <Select
        items={[...ITEMS]}
        variant="native"
        value={value}
        onChange={(next) => setValue(next as ItemValue)}
        aria-label="Native select"
      />
      <Select items={[...ITEMS]} disabled placeholder="Disabled select" />
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
          values: [
            { value: "Default" },
            { value: "Disabled" },
          ],
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
const [value, setValue] = React.useState(items[0]?.value ?? "");

<Select items={items} value={value} onChange={setValue} placeholder="Animated select" />
<Select items={items} variant="native" value={value} onChange={setValue} />
<Select items={items} disabled placeholder="Disabled select" />`,
    },
  ],
});
