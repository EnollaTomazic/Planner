"use client";

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
      "ring-2 ring-ring ring-offset-2 ring-offset-background shadow-[var(--shadow-glow-md)] outline-none",
    props: { children: "Focus" },
    code:
      "<Button className=\"ring-2 ring-ring ring-offset-2 ring-offset-background shadow-[var(--shadow-glow-md)] outline-none\">Focus</Button>",
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
    id: "static",
    name: "Static overlay",
    props: {
      children: "Static overlay",
      glitch: false,
      glitchIntensity: "glitch-overlay-button-opacity",
    },
    code: `<Button glitch={false} glitchIntensity="glitch-overlay-button-opacity">Static overlay</Button>`,
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
  const staticState = BUTTON_STATES.find((state) => state.id === "static");
  const standardStates = BUTTON_STATES.filter((state) => state.id !== "static");

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
      {staticState ? (
        <div className="space-y-[var(--space-1)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <ButtonStatePreview state={staticState} />
          </div>
          <p className="text-caption text-muted-foreground">
            Buttons render glitch overlays by default. Disable the overlay for
            static captures or long-running recordings—theme noise tokens clamp
            contrast in Noir and Hardstuck, so copy should stay on the default
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
        {
          name: "glitch",
          type: "boolean",
          defaultValue: "true",
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
              id === "static"
                ? "Disable the glitch overlay for static captures; default buttons render with overlay noise driven by --glitch-overlay-button-opacity."
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

export default ButtonGallery
