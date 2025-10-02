"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Field from "./Field";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

export type FieldStateSpec = {
  id: string;
  name: string;
  Component: React.ComponentType;
  code?: string;
};

const DefaultFieldState: React.FC = () => (
  <Field.Root helper="Compose primitives">
    <Field.Input placeholder="Default field" />
  </Field.Root>
);

const FocusVisibleFieldState: React.FC = () => (
  <Field.Root
    className="ring-2 ring-[hsl(var(--ring))]"
    helper="Helper text aligns with counter"
    helperId="field-focus-helper"
    counter="64 / 100"
    counterId="field-focus-counter"
  >
    <Field.Input
      aria-describedby="field-focus-helper field-focus-counter"
      placeholder="Forced focus ring"
    />
  </Field.Root>
);

const InvalidFieldState: React.FC = () => (
  <Field.Root invalid helper="Incorrect format" helperTone="danger">
    <Field.Input placeholder="Invalid field" aria-invalid />
  </Field.Root>
);

const LoadingFieldState: React.FC = () => (
  <Field.Root loading helper="Loading state">
    <Field.Input placeholder="Loading field" />
  </Field.Root>
);

const DisabledFieldState: React.FC = () => (
  <Field.Root disabled helper="Disabled field">
    <Field.Input placeholder="Disabled field" disabled />
  </Field.Root>
);

const FieldWithCounterState: React.FC = () => (
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
);

const SelectFieldState: React.FC = () => (
  <Field.Root>
    <Field.Select defaultValue="one">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Field.Select>
  </Field.Root>
);

const SearchFieldState: React.FC = () => {
  const [search, setSearch] = React.useState("Scouting");

  return (
    <Field.Root>
      <Field.Search
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search fields"
        clearLabel="Clear search"
      />
    </Field.Root>
  );
};

const GlitchFieldState: React.FC = () => (
  <Field.Root
    glitch
    glitchText="Player lookup"
    helper="Overlay pulls from accent + ring tokens"
    helperId="field-glitch-helper"
  >
    <Field.Input
      aria-describedby="field-glitch-helper"
      placeholder="Glitch overlay"
      indent
    />
  </Field.Root>
);

const FIELD_STATES: readonly FieldStateSpec[] = [
  {
    id: "default",
    name: "Default",
    Component: DefaultFieldState,
    code: `<Field.Root helper="Compose primitives">
  <Field.Input placeholder="Default field" />
</Field.Root>`,
  },
  {
    id: "focus-visible",
    name: "Focus visible",
    Component: FocusVisibleFieldState,
    code: `<Field.Root
  className="ring-2 ring-[hsl(var(--ring))]"
  helper="Helper text aligns with counter"
  helperId="field-focus-helper"
  counter="64 / 100"
  counterId="field-focus-counter"
>
  <Field.Input
    aria-describedby="field-focus-helper field-focus-counter"
    placeholder="Forced focus ring"
  />
</Field.Root>`,
  },
  {
    id: "invalid",
    name: "Invalid",
    Component: InvalidFieldState,
    code: `<Field.Root invalid helper="Incorrect format" helperTone="danger">
  <Field.Input placeholder="Invalid field" aria-invalid />
</Field.Root>`,
  },
  {
    id: "loading",
    name: "Loading",
    Component: LoadingFieldState,
    code: `<Field.Root loading helper="Loading state">
  <Field.Input placeholder="Loading field" />
</Field.Root>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    Component: DisabledFieldState,
    code: `<Field.Root disabled helper="Disabled field">
  <Field.Input placeholder="Disabled field" disabled />
</Field.Root>`,
  },
  {
    id: "with-counter",
    name: "With counter",
    Component: FieldWithCounterState,
    code: `<Field.Root
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
</Field.Root>`,
  },
  {
    id: "select",
    name: "Select",
    Component: SelectFieldState,
    code: `const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

<Field.Root>
  <Field.Select defaultValue="one">
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </Field.Select>
</Field.Root>`,
  },
  {
    id: "search",
    name: "Search",
    Component: SearchFieldState,
    code: `const [search, setSearch] = React.useState("Scouting");

<Field.Root>
  <Field.Search
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Search fields"
    clearLabel="Clear search"
  />
</Field.Root>`,
  },
  {
    id: "glitch",
    name: "Glitch overlay",
    Component: GlitchFieldState,
    code: `<Field.Root glitch glitchText="Player lookup" helper="Overlay pulls from accent + ring tokens" helperId="field-glitch-helper">\n  <Field.Input aria-describedby="field-glitch-helper" placeholder="Glitch overlay" indent />\n</Field.Root>`,
  },
];

export const FIELD_STATE_SPECS: readonly FieldStateSpec[] = FIELD_STATES;

function FieldGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {FIELD_STATES.filter((state) => state.id !== "glitch").map(
        ({ id, Component }) => (
          <Component key={id} />
        ),
      )}
      <div className="space-y-[var(--space-1)]">
        <GlitchFieldState />
        <p className="text-caption text-muted-foreground">
          Glitch fields default to{" "}
          <code className="mx-[var(--space-1)]">
            --glitch-overlay-button-opacity-reduced
          </code>
          so Noir and Hardstuck keep helper/counter copy legible while the
          chroma noise animates.
        </p>
      </div>
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
          values: FIELD_STATES.map(({ name, id }) => ({
            value: name,
            description:
              id === "glitch"
                ? "Glitch overlay rides reduced opacity + hue tokens to keep helper/counter text readable in Noir + Hardstuck."
                : undefined,
          })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:field:states",
        render: () => <FieldGalleryPreview />,
      }),
      states: FIELD_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:field:state:${state.id}`,
          render: () => <state.Component />,
        }),
      })),
      code: `const [search, setSearch] = React.useState("Scouting");

<Field.Root helper="Compose primitives">
  <Field.Input placeholder="Default field" />
</Field.Root>
<Field.Root
  className="ring-2 ring-[hsl(var(--ring))]"
  helper="Helper text aligns with counter"
  helperId="field-focus-helper"
  counter="64 / 100"
  counterId="field-focus-counter"
>
  <Field.Input
    aria-describedby="field-focus-helper field-focus-counter"
    placeholder="Forced focus ring"
  />
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
