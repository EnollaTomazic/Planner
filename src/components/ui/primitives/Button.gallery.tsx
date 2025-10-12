import * as React from "react";
import { Plus } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import { buttonSizes, type ButtonSize, Button } from "./Button";

export type ButtonStateSpec = {
  id: string;
  name: string;
  className?: string;
  props: React.ComponentProps<typeof Button>;
  code?: string;
};

const BUTTON_STATES: readonly ButtonStateSpec[] = [
  {
    id: "default",
    name: "Default",
    props: { children: "Default" },
    code: "<Button>Default</Button>",
  },
  {
    id: "hover",
    name: "Hover",
    className: "bg-[--hover]",
    props: { children: "Hover" },
    code: "<Button className=\"bg-[--hover]\">Hover</Button>",
  },
  {
    id: "focus",
    name: "Focus",
    className:
      "ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]",
    props: { children: "Focus" },
    code:
      "<Button className=\"ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]\">Focus</Button>",
  },
  {
    id: "active",
    name: "Active",
    className: "bg-[--active]",
    props: { children: "Active" },
    code: "<Button className=\"bg-[--active]\">Active</Button>",
  },
  {
    id: "disabled",
    name: "Disabled",
    props: { children: "Disabled", disabled: true },
    code: "<Button disabled>Disabled</Button>",
  },
  {
    id: "loading",
    name: "Loading",
    props: { children: "Loading", loading: true },
    code: "<Button loading>Loading</Button>",
  },
  {
    id: "glitch",
    name: "Glitch overlay",
    props: {
      children: "Glitch overlay",
      glitch: true,
      glitchIntensity: "glitch-overlay-button-opacity",
    },
    code: `<Button glitch glitchIntensity="glitch-overlay-button-opacity">Glitch overlay</Button>`,
  },
];

export const BUTTON_STATE_SPECS: readonly ButtonStateSpec[] = BUTTON_STATES;

const BUTTON_SIZE_ORDER: readonly ButtonSize[] = ["sm", "md", "lg", "xl"];

const BUTTON_SIZE_LABELS: Record<ButtonSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

const ICON_VARIANTS = [
  { id: "leading", label: "Leading icon" },
  { id: "trailing", label: "Trailing icon" },
] as const;

function ButtonStatePreview({ state }: { state: ButtonStateSpec }) {
  const { className, props } = state;
  return <Button className={className} {...props} />;
}

function ButtonGalleryPreview() {
  const glitchState = BUTTON_STATES.find((state) => state.id === "glitch");
  const standardStates = BUTTON_STATES.filter((state) => state.id !== "glitch");

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button tone="primary" variant="default">
          Primary tone
        </Button>
        <Button tone="accent" variant="default">
          Accent tone
        </Button>
        <Button tone="info" variant="quiet">
          Info ghost
        </Button>
        <Button tone="danger" variant="default">
          Danger primary
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="space-y-[var(--space-2)]">
        <div className="grid grid-cols-[max-content_repeat(2,minmax(0,1fr))] gap-[var(--space-3)] text-label text-muted-foreground">
          <span className="sr-only">Size</span>
          {ICON_VARIANTS.map((variant) => (
            <span key={variant.id}>{variant.label}</span>
          ))}
        </div>
        {BUTTON_SIZE_ORDER.map((size) => (
          <div
            key={size}
            className={`grid grid-cols-1 items-center sm:grid-cols-[max-content_repeat(2,minmax(0,1fr))] ${buttonSizes[size].gap}`}
          >
            <span className="text-label text-muted-foreground sm:text-ui">
              {BUTTON_SIZE_LABELS[size]}
            </span>
            {ICON_VARIANTS.map((variant) => (
              <Button key={variant.id} size={size}>
                {variant.id === "leading" ? <Plus aria-hidden /> : null}
                {BUTTON_SIZE_LABELS[size]}
                {variant.id === "trailing" ? <Plus aria-hidden /> : null}
              </Button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {standardStates.map((state) => (
          <ButtonStatePreview key={state.id} state={state} />
        ))}
      </div>
      {glitchState ? (
        <div className="space-y-[var(--space-1)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <ButtonStatePreview state={glitchState} />
          </div>
          <p className="text-caption text-muted-foreground">
            Glitch overlay uses theme noise tokens so Noir and Hardstuck clamp
            the static mix for ≥3:1 contrast—keep copy on the default{" "}
            <code className="ml-[var(--space-1)]">text-foreground</code> tone.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export const ButtonGallery = defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "button",
      name: "Button",
      description: "Tone, size, icon placement, and interaction states",
      kind: "primitive",
      tags: ["button", "action"],
      props: [
        {
          name: "variant",
          type: '"default" | "neo" | "quiet" | "glitch"',
          description:
            'Canonical variants. Legacy aliases map as: "primary" → "default", "secondary"/"soft" → "neo", "ghost"/"minimal" → "quiet".',
        },
        {
          name: "tone",
          type: '"primary" | "accent" | "info" | "danger"',
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg" | "xl"',
        },
        {
          name: "loading",
          type: "boolean",
          defaultValue: "false",
        },
      ],
      axes: [
        {
          id: "tone",
          label: "Tone",
          type: "variant",
          values: [
            { value: "Primary" },
            { value: "Accent" },
            { value: "Info" },
            { value: "Danger" },
          ],
        },
        {
          id: "size",
          label: "Size & icons",
          type: "variant",
          values: BUTTON_SIZE_ORDER.map((size) => ({
            value: BUTTON_SIZE_LABELS[size],
            description: `Leading and trailing icons align to the ${BUTTON_SIZE_LABELS[size].toLowerCase()} control gap.`,
          })),
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: BUTTON_STATES.map(({ name, id }) => ({
            value: name,
            description:
              id === "glitch"
                ? "Glitch overlay relies on --glitch-overlay-button-opacity and theme noise tokens; Noir + Hardstuck clamp intensity for ≥3:1 contrast."
                : undefined,
          })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:button:matrix",
        render: () => <ButtonGalleryPreview />,
      }),
      states: BUTTON_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:button:state:${state.id}`,
          render: () => <ButtonStatePreview state={state} />,
        }),
      })),
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Button tone="primary" variant="default">
      Primary tone
    </Button>
    <Button tone="accent" variant="default">
      Accent tone
    </Button>
    <Button tone="info" variant="quiet">
      Info ghost
    </Button>
    <Button tone="danger" variant="default">
      Danger primary
    </Button>
    <Button disabled>Disabled</Button>
  </div>
  <div className="space-y-[var(--space-2)]">
    <div className="grid grid-cols-[max-content_repeat(2,minmax(0,1fr))] gap-[var(--space-3)] text-label text-muted-foreground">
      <span className="sr-only">Size</span>
      <span>Leading icon</span>
      <span>Trailing icon</span>
    </div>
    <div className="grid grid-cols-1 items-center gap-[var(--space-1)] sm:grid-cols-[max-content_repeat(2,minmax(0,1fr))]">
      <span className="text-label text-muted-foreground sm:text-ui">Small</span>
      <Button size="sm">
        <Plus aria-hidden />
        Small
      </Button>
      <Button size="sm">
        Small
        <Plus aria-hidden />
      </Button>
    </div>
    <div className="grid grid-cols-1 items-center gap-[var(--space-2)] sm:grid-cols-[max-content_repeat(2,minmax(0,1fr))]">
      <span className="text-label text-muted-foreground sm:text-ui">Medium</span>
      <Button size="md">
        <Plus aria-hidden />
        Medium
      </Button>
      <Button size="md">
        Medium
        <Plus aria-hidden />
      </Button>
    </div>
    <div className="grid grid-cols-1 items-center gap-[var(--space-4)] sm:grid-cols-[max-content_repeat(2,minmax(0,1fr))]">
      <span className="text-label text-muted-foreground sm:text-ui">Large</span>
      <Button size="lg">
        <Plus aria-hidden />
        Large
      </Button>
      <Button size="lg">
        Large
        <Plus aria-hidden />
      </Button>
    </div>
    <div className="grid grid-cols-1 items-center gap-[calc(var(--control-h-xl)/3)] sm:grid-cols-[max-content_repeat(2,minmax(0,1fr))]">
      <span className="text-label text-muted-foreground sm:text-ui">Extra large</span>
      <Button size="xl">
        <Plus aria-hidden />
        Extra large
      </Button>
      <Button size="xl">
        Extra large
        <Plus aria-hidden />
      </Button>
    </div>
  </div>
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Button>Default</Button>
    <Button className="bg-[--hover]">Hover</Button>
    <Button className="ring-2 ring-[var(--focus)]">Focus</Button>
    <Button className="bg-[--active]">Active</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </div>
</div>`,
    },
  ],
})
