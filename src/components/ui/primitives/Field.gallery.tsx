import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Field from "./Field";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

function FieldGalleryPreview() {
  const [search, setSearch] = React.useState("Scouting");

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Field.Root helper="Compose primitives">
        <Field.Input placeholder="Default field" />
      </Field.Root>

      <Field.Root invalid helper="Incorrect format" helperTone="danger">
        <Field.Input placeholder="Invalid field" aria-invalid />
      </Field.Root>

      <Field.Root loading helper="Loading state">
        <Field.Input placeholder="Loading field" />
      </Field.Root>

      <Field.Root disabled helper="Disabled field">
        <Field.Input placeholder="Disabled field" disabled />
      </Field.Root>

      <Field.Root
        counter="120 / 200"
        counterId="field-counter"
        helper="Helper with counter"
        helperId="field-helper"
      >
        <Field.Textarea
          aria-describedby="field-helper field-counter"
          placeholder="Textarea within a field"
          rows={3}
        />
      </Field.Root>

      <Field.Root>
        <Field.Select defaultValue="one">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field.Select>
      </Field.Root>

      <Field.Root>
        <Field.Search
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search fields"
          clearLabel="Clear search"
        />
      </Field.Root>
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "field",
      name: "Field",
      description: "Composable shell for custom inputs, search, and selects",
      kind: "primitive",
      tags: ["field", "input"],
      props: [
        { name: "height", type: '"sm" | "md" | "lg" | "xl" | number', defaultValue: '"md"' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "invalid", type: "boolean", defaultValue: "false" },
        { name: "loading", type: "boolean", defaultValue: "false" },
        { name: "readOnly", type: "boolean", defaultValue: "false" },
        { name: "helper", type: "React.ReactNode" },
        { name: "helperTone", type: '"muted" | "danger" | "success"' },
        { name: "counter", type: "React.ReactNode" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: [
            { value: "Default" },
            { value: "Invalid" },
            { value: "Loading" },
            { value: "Disabled" },
            { value: "With counter" },
            { value: "Search" },
            { value: "Select" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:field:states",
        render: () => <FieldGalleryPreview />,
      }),
      code: `const [search, setSearch] = React.useState("Scouting");

<Field.Root helper="Compose primitives">
  <Field.Input placeholder="Default field" />
</Field.Root>
<Field.Root invalid helper="Incorrect format" helperTone="danger">
  <Field.Input placeholder="Invalid field" aria-invalid />
</Field.Root>
<Field.Root loading helper="Loading state">
  <Field.Input placeholder="Loading field" />
</Field.Root>
<Field.Root disabled helper="Disabled field">
  <Field.Input placeholder="Disabled field" disabled />
</Field.Root>
<Field.Root
  counter="120 / 200"
  counterId="field-counter"
  helper="Helper with counter"
  helperId="field-helper"
>
  <Field.Textarea
    aria-describedby="field-helper field-counter"
    placeholder="Textarea within a field"
    rows={3}
  />
</Field.Root>
<Field.Root>
  <Field.Select defaultValue="one">
    <option value="one">One</option>
    <option value="two">Two</option>
  </Field.Select>
</Field.Root>
<Field.Root>
  <Field.Search
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Search fields"
    clearLabel="Clear search"
  />
</Field.Root>`,
    },
  ],
});
