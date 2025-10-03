import * as React from "react";
import { Flame, MoonStar, ShieldHalf, Sun } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { cn } from "@/lib/utils";

import RadioIconGroup, {
  type RadioIconGroupOption,
  type RadioIconGroupProps,
  type RadioIconGroupSize,
  type RadioIconGroupTone,
} from "./RadioIconGroup";

export const RADIO_ICON_GROUP_DEMO_OPTIONS: readonly RadioIconGroupOption[] = [
  { id: "radio-icon-sun", value: "sun", label: "Sun", icon: <Sun /> },
  { id: "radio-icon-moon", value: "moon", label: "Moon", icon: <MoonStar /> },
  { id: "radio-icon-flame", value: "flame", label: "Flame", icon: <Flame /> },
  { id: "radio-icon-shield", value: "shield", label: "Shield", icon: <ShieldHalf /> },
] as const;

export type RadioIconGroupStateSpec = {
  readonly id: string;
  readonly name: string;
  readonly className?: string;
  readonly props?: Partial<RadioIconGroupProps>;
  readonly code: string;
};

const RADIO_GROUP_BASE_PROPS: Pick<RadioIconGroupProps, "options" | "value"> = {
  options: RADIO_ICON_GROUP_DEMO_OPTIONS,
  value: "sun",
};

export const RADIO_ICON_GROUP_STATE_SPECS: readonly RadioIconGroupStateSpec[] = [
  {
    id: "default",
    name: "Default",
    code: `<RadioIconGroup name="tone" options={options} value="sun" onChange={() => {}} />`,
  },
  {
    id: "hover",
    name: "Hover",
    className: cn(
      "[&>div:first-child>label>span:first-child]:bg-accent/12",
      "[&>div:first-child>label>span:first-child]:text-foreground",
    ),
    code: `<RadioIconGroup
  name="tone"
  options={options}
  value="sun"
  className="[&>div:first-child>label>span:first-child]:bg-accent/12 [&>div:first-child>label>span:first-child]:text-foreground"
  onChange={() => {}}
/>`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    className: cn(
      "[&>div:first-child>label>span:first-child]:ring-2",
      "[&>div:first-child>label>span:first-child]:ring-accent",
      "[&>div:first-child>label>span:first-child]:ring-offset-2",
      "[&>div:first-child>label>span:first-child]:ring-offset-[color:var(--surface-2)]",
    ),
    code: `<RadioIconGroup
  name="tone"
  options={options}
  value="sun"
  className="[&>div:first-child>label>span:first-child]:ring-2 [&>div:first-child>label>span:first-child]:ring-accent [&>div:first-child>label>span:first-child]:ring-offset-2 [&>div:first-child>label>span:first-child]:ring-offset-[color:var(--surface-2)]"
  onChange={() => {}}
/>`,
  },
  {
    id: "active",
    name: "Active",
    props: { value: "moon" },
    code: `<RadioIconGroup name="tone" options={options} value="moon" onChange={() => {}} />`,
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { disabled: true },
    code: `<RadioIconGroup name="tone" options={options} value="sun" disabled onChange={() => {}} />`,
  },
  {
    id: "loading",
    name: "Loading",
    props: { loading: true },
    code: `<RadioIconGroup name="tone" options={options} value="sun" loading onChange={() => {}} />`,
  },
] as const;

function RadioIconGroupStatePreview({ state }: { readonly state: RadioIconGroupStateSpec }) {
  const { className, props } = state;

  return (
    <RadioIconGroup
      {...RADIO_GROUP_BASE_PROPS}
      name={`radio-icon-group-${state.id}`}
      onChange={() => {}}
      {...props}
      className={cn(className, props?.className)}
    />
  );
}

function RadioIconGroupGalleryPreview() {
  const [value, setValue] = React.useState(RADIO_GROUP_BASE_PROPS.value);
  const [tone, setTone] = React.useState<RadioIconGroupTone>("accent");
  const [size, setSize] = React.useState<RadioIconGroupSize>("md");
  const instanceId = React.useId();

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <RadioIconGroup
        options={RADIO_ICON_GROUP_DEMO_OPTIONS}
        value={value}
        tone={tone}
        size={size}
        name={`radio-icon-group-${instanceId}`}
        onChange={setValue}
      />
      <div className="flex flex-wrap items-center gap-[var(--space-3)] text-caption text-muted-foreground">
        <label className="flex items-center gap-[var(--space-1)]">
          <span className="text-label text-foreground">Tone</span>
          <select
            className="rounded-[var(--radius-sm)] border border-card-hairline/60 bg-card px-[var(--space-2)] py-[var(--space-1)] text-label"
            value={tone}
            onChange={(event) => setTone(event.target.value as RadioIconGroupTone)}
          >
            <option value="accent">Accent</option>
            <option value="primary">Primary</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </label>
        <label className="flex items-center gap-[var(--space-1)]">
          <span className="text-label text-foreground">Size</span>
          <select
            className="rounded-[var(--radius-sm)] border border-card-hairline/60 bg-card px-[var(--space-2)] py-[var(--space-1)] text-label"
            value={size}
            onChange={(event) => setSize(event.target.value as RadioIconGroupSize)}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
      <div className="flex flex-col gap-[var(--space-2)]">
        <p className="text-caption text-muted-foreground">States</p>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {RADIO_ICON_GROUP_STATE_SPECS.map((state) => (
            <RadioIconGroupStatePreview key={state.id} state={state} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "toggles",
  entries: [
    {
      id: "radio-icon-group",
      name: "RadioIconGroup",
      description: "Icon-based radio selector with tone-aware focus, hover, and loading states.",
      kind: "primitive",
      tags: ["radio", "toggle", "icon"],
      props: [
        { name: "name", type: "string" },
        { name: "options", type: "readonly RadioIconGroupOption[]" },
        { name: "value", type: "string | null" },
        { name: "onChange", type: "(value: string) => void" },
        {
          name: "tone",
          type: '"accent" | "primary" | "success" | "warning" | "danger"',
          defaultValue: '"accent"',
        },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"' },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "loading", type: "boolean", defaultValue: "false" },
        { name: "className", type: "string" },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: RADIO_ICON_GROUP_STATE_SPECS.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:radio-icon-group:interactive",
        render: () => <RadioIconGroupGalleryPreview />,
      }),
      states: RADIO_ICON_GROUP_STATE_SPECS.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:radio-icon-group:state:${state.id}`,
          render: () => <RadioIconGroupStatePreview state={state} />,
        }),
      })),
      code: `<RadioIconGroup
  name="tone"
  options={options}
  value={value}
  tone={tone}
  size={size}
  onChange={setValue}
/>`,
    },
  ],
});
