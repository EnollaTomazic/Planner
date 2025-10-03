import * as React from "react";
import { Flame, MoonStar, ShieldHalf, Sun } from "lucide-react";

import ThemeToggle from "@/components/ui/theme/ThemeToggle";
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

export const RADIO_ICON_GROUP_TONES: readonly RadioIconGroupTone[] = [
  "accent",
  "primary",
  "success",
  "warning",
  "danger",
] as const;

export const RADIO_ICON_GROUP_SIZES: readonly RadioIconGroupSize[] = [
  "sm",
  "md",
  "lg",
] as const;

export type RadioIconGroupStateSpec = {
  readonly id: string;
  readonly name: string;
  readonly className?: string;
  readonly props?: Partial<RadioIconGroupProps>;
  readonly code: string;
};

const RADIO_GROUP_BASE_PROPS: Pick<RadioIconGroupProps, "options" | "tone" | "size"> = {
  options: RADIO_ICON_GROUP_DEMO_OPTIONS,
  tone: "accent",
  size: "md",
};

const firstControlSelector = "[&>div:first-child_[data-part=control]]";

const hoverPreviewClassName = cn(
  `${firstControlSelector}:bg-interaction-accent-surfaceHover`,
  `${firstControlSelector}:text-foreground`,
);

const focusPreviewClassName = cn(
  `${firstControlSelector}:ring-2`,
  `${firstControlSelector}:ring-[color:var(--theme-ring,var(--focus))]`,
  `${firstControlSelector}:ring-offset-2`,
  `${firstControlSelector}:ring-offset-[color:var(--surface-2)]`,
);

const activePreviewClassName = cn(
  `${firstControlSelector}:bg-interaction-accent-surfaceActive`,
  `${firstControlSelector}:text-foreground`,
);

export const RADIO_ICON_GROUP_STATE_SPECS: readonly RadioIconGroupStateSpec[] = [
  {
    id: "default",
    name: "Checked",
    props: { value: "sun" },
    code: `<RadioIconGroup name="tone" options={options} value="sun" onChange={() => {}} />`,
  },
  {
    id: "unselected",
    name: "Unselected",
    props: { value: null },
    code: `<RadioIconGroup name="tone" options={options} value={null} onChange={() => {}} />`,
  },
  {
    id: "hover",
    name: "Hover",
    className: hoverPreviewClassName,
    props: { value: "sun" },
    code: `<RadioIconGroup
  name="tone"
  options={options}
  value="sun"
  className="${hoverPreviewClassName}"
  onChange={() => {}}
/>`,
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    className: focusPreviewClassName,
    props: { value: "sun" },
    code: `<RadioIconGroup
  name="tone"
  options={options}
  value="sun"
  className="${focusPreviewClassName}"
  onChange={() => {}}
/>`,
  },
  {
    id: "active",
    name: "Active",
    className: activePreviewClassName,
    props: { value: "moon" },
    code: `<RadioIconGroup
  name="tone"
  options={options}
  value="moon"
  className="${activePreviewClassName}"
  onChange={() => {}}
/>`,
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { value: "sun", disabled: true },
    code: `<RadioIconGroup name="tone" options={options} value="sun" disabled onChange={() => {}} />`,
  },
  {
    id: "loading",
    name: "Loading",
    props: { value: "sun", loading: true },
    code: `<RadioIconGroup name="tone" options={options} value="sun" loading onChange={() => {}} />`,
  },
] as const;

function RadioIconGroupStatePreview({ state }: { readonly state: RadioIconGroupStateSpec }) {
  const { className, props } = state;

  return (
    <RadioIconGroup
      {...RADIO_GROUP_BASE_PROPS}
      name={`radio-icon-group-${state.id}`}
      value="sun"
      onChange={() => {}}
      {...props}
      className={cn(className, props?.className)}
    />
  );
}

function RadioIconGroupMatrix({
  value,
  onChange,
  instanceId,
}: {
  readonly value: string | null;
  readonly onChange: (next: string) => void;
  readonly instanceId: string;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
        <div className="grid auto-cols-fr grid-cols-[max-content_repeat(3,minmax(0,1fr))] gap-[var(--space-3)]">
          <div className="text-caption font-medium uppercase tracking-[0.18em] text-muted-foreground">Tone × Size</div>
          {RADIO_ICON_GROUP_SIZES.map((size) => (
            <div
              key={size}
              className="text-center text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {size}
            </div>
          ))}
          {RADIO_ICON_GROUP_TONES.map((tone) => (
            <React.Fragment key={tone}>
              <div className="flex items-center text-label font-medium capitalize text-muted-foreground">
                {tone}
              </div>
              {RADIO_ICON_GROUP_SIZES.map((size) => (
                <RadioIconGroup
                  key={`${tone}-${size}`}
                  name={`${instanceId}-${tone}-${size}`}
                  options={RADIO_ICON_GROUP_DEMO_OPTIONS}
                  value={value}
                  tone={tone}
                  size={size}
                  onChange={onChange}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadioIconGroupGalleryPreview() {
  const [value, setValue] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState<RadioIconGroupTone>("accent");
  const [size, setSize] = React.useState<RadioIconGroupSize>("md");
  const instanceId = React.useId();
  const handleValueChange = React.useCallback((next: string) => {
    setValue(next);
  }, []);

  return (
    <div className="space-y-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <p className="max-w-xl text-caption text-muted-foreground">
          Press Tab to enter the group, use arrow keys to move focus, and press Space to select the highlighted icon.
        </p>
        <ThemeToggle ariaLabel="Preview theme" className="shrink-0" />
      </div>
      <RadioIconGroupMatrix value={value} onChange={handleValueChange} instanceId={instanceId} />
      <div className="grid gap-[var(--space-3)] md:grid-cols-2">
        <div className="space-y-[var(--space-2)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
          <p className="text-label font-medium text-muted-foreground">Interactive controls</p>
          <RadioIconGroup
            name={`${instanceId}-interactive`}
            options={RADIO_ICON_GROUP_DEMO_OPTIONS}
            value={value}
            tone={tone}
            size={size}
            onChange={handleValueChange}
          />
          <div className="flex flex-wrap items-center gap-[var(--space-2)] text-caption text-muted-foreground">
            <label className="flex items-center gap-[var(--space-1)]">
              <span className="text-label text-foreground">Tone</span>
              <select
                className="rounded-[var(--radius-sm)] border border-card-hairline-60 bg-surface px-[var(--space-2)] py-[var(--space-1)] text-label"
                value={tone}
                onChange={(event) => setTone(event.target.value as RadioIconGroupTone)}
              >
                {RADIO_ICON_GROUP_TONES.map((toneOption) => (
                  <option key={toneOption} value={toneOption} className="capitalize">
                    {toneOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-[var(--space-1)]">
              <span className="text-label text-foreground">Size</span>
              <select
                className="rounded-[var(--radius-sm)] border border-card-hairline-60 bg-surface px-[var(--space-2)] py-[var(--space-1)] text-label"
                value={size}
                onChange={(event) => setSize(event.target.value as RadioIconGroupSize)}
              >
                {RADIO_ICON_GROUP_SIZES.map((sizeOption) => (
                  <option key={sizeOption} value={sizeOption} className="capitalize">
                    {sizeOption}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setValue(null)}
              className="inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-sm)] border border-card-hairline-60 bg-surface px-[var(--space-2)] py-[var(--space-1)] text-label text-muted-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme-ring,var(--focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-2)]"
            >
              Clear selection
            </button>
          </div>
        </div>
        <div className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
            <p className="text-label font-medium text-muted-foreground">Disabled</p>
            <RadioIconGroup
              name={`${instanceId}-disabled`}
              options={RADIO_ICON_GROUP_DEMO_OPTIONS}
              value={value}
              tone={tone}
              size={size}
              disabled
              onChange={handleValueChange}
            />
          </div>
          <div className="space-y-[var(--space-1)] rounded-card border border-card-hairline-60 bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]">
            <p className="text-label font-medium text-muted-foreground">Loading</p>
            <RadioIconGroup
              name={`${instanceId}-loading`}
              options={RADIO_ICON_GROUP_DEMO_OPTIONS}
              value={value}
              tone={tone}
              size={size}
              loading
              onChange={handleValueChange}
            />
          </div>
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
      description:
        "Icon-based radio selector with tone-aware focus, hover, loading, and disabled states across Planner themes.",
      kind: "primitive",
      tags: ["radio", "toggle", "icon"],
      props: [
        { name: "name", type: "string", required: true },
        { name: "options", type: "readonly RadioIconGroupOption[]", required: true },
        { name: "value", type: "string | null", required: true },
        { name: "onChange", type: "(value: string) => void", required: true },
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
          id: "tone",
          label: "Tone",
          type: "variant",
          values: RADIO_ICON_GROUP_TONES.map((tone) => ({ value: tone })),
        },
        {
          id: "size",
          label: "Size",
          type: "variant",
          values: RADIO_ICON_GROUP_SIZES.map((size) => ({ value: size })),
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: RADIO_ICON_GROUP_STATE_SPECS.map(({ name }) => ({ value: name })),
        },
      ],
      usage: [
        {
          title: "Keyboard navigation",
          description:
            "Tab into the group, use arrow keys to move focus, and press Space or Enter to commit the highlighted icon.",
          kind: "do",
        },
        {
          title: "Theme parity",
          description:
            "Pair with ThemeToggle when QA-ing to confirm glow spacing, contrast, and motion across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir, and Hardstuck themes.",
          kind: "do",
        },
      ],
      preview: createGalleryPreview({
        id: "ui:radio-icon-group:matrix",
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
  name="appearance"
  options={options}
  value={value}
  tone={tone}
  size={size}
  onChange={setValue}
/>`,
    },
  ],
});
