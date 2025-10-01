import * as React from "react";
import { Plus } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import IconButton from "./IconButton";

type IconButtonStateSpec = {
  id: string;
  name: string;
  className?: string;
  props: React.ComponentProps<typeof IconButton>;
  code?: string;
};

const ICON_BUTTON_STATES: readonly IconButtonStateSpec[] = [
  {
    id: "default",
    name: "Default",
    props: { "aria-label": "Default", children: <Plus aria-hidden /> },
    code: "<IconButton aria-label=\"Default\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "hover",
    name: "Hover",
    className: "bg-[--hover]",
    props: { "aria-label": "Hover", children: <Plus aria-hidden /> },
    code: "<IconButton className=\"bg-[--hover]\" aria-label=\"Hover\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "focus",
    name: "Focus",
    className:
      "ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]",
    props: { "aria-label": "Focus", children: <Plus aria-hidden /> },
    code:
      "<IconButton className=\"ring-2 ring-[var(--ring-contrast)] shadow-[var(--shadow-glow-md)] [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]\" aria-label=\"Focus\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "active",
    name: "Active",
    className: "bg-[--active]",
    props: {
      "aria-label": "Active",
      "aria-pressed": true,
      children: <Plus aria-hidden />,
    },
    code: "<IconButton\n  className=\"bg-[--active]\"\n  aria-label=\"Active\"\n  aria-pressed\n>\n  <Plus />\n</IconButton>",
  },
  {
    id: "disabled",
    name: "Disabled",
    props: {
      "aria-label": "Disabled",
      children: <Plus aria-hidden />,
      disabled: true,
    },
    code: "<IconButton disabled aria-label=\"Disabled\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "loading",
    name: "Loading",
    props: {
      "aria-label": "Loading",
      children: <Plus aria-hidden />,
      loading: true,
    },
    code: "<IconButton loading aria-label=\"Loading\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "glitch",
    name: "Glitch overlay",
    props: {
      "aria-label": "Glitch overlay",
      children: <Plus aria-hidden />,
      variant: "glitch",
      glitchIntensity: "glitch-overlay-button-opacity",
    },
    code: "<IconButton variant=\"glitch\" glitchIntensity=\"glitch-overlay-button-opacity\" aria-label=\"Glitch overlay\">\n  <Plus />\n</IconButton>",
  },
];

const DEFAULT_ICON_BUTTON_STATES: readonly IconButtonStateSpec[] = [
  {
    id: "default-variant",
    name: "Default variant",
    props: {
      "aria-label": "Default variant",
      variant: "default",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton variant=\"default\" aria-label=\"Default variant\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "default-hover",
    name: "Default hover",
    className: "bg-[--hover] shadow-[var(--shadow-neon-strong)]",
    props: {
      "aria-label": "Default hover",
      variant: "default",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton\n  className=\"bg-[--hover] shadow-[var(--shadow-neon-strong)]\"\n  variant=\"default\"\n  aria-label=\"Default hover\"\n>\n  <Plus />\n</IconButton>",
  },
  {
    id: "default-active",
    name: "Default active",
    className:
      "bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]",
    props: {
      "aria-label": "Default active",
      "aria-pressed": true,
      variant: "default",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton\n  className=\"bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]\"\n  variant=\"default\"\n  aria-label=\"Default active\"\n  aria-pressed\n>\n  <Plus />\n</IconButton>",
  },
];

function IconButtonStatePreview({ state }: { state: IconButtonStateSpec }) {
  const { className, props } = state;
  return <IconButton className={className} {...props} />;
}

const ICON_BUTTON_SIZES = ["sm", "md", "lg", "xl"] as const;

function IconButtonGalleryPreview() {
  const glitchState = ICON_BUTTON_STATES.find((state) => state.id === "glitch");
  const standardIconStates = ICON_BUTTON_STATES.filter(
    (state) => state.id !== "glitch",
  );

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ICON_BUTTON_SIZES.map((size) => (
          <IconButton
            key={size}
            size={size}
            variant="ghost"
            aria-label={`Add item ${size}`}
          >
            <Plus aria-hidden />
          </IconButton>
        ))}
        <IconButton
          size="md"
          variant="neo"
          aria-label="Add item neo"
        >
          <Plus aria-hidden />
        </IconButton>
        <IconButton
          size="md"
          variant="default"
          aria-label="Add item default"
        >
          <Plus aria-hidden />
        </IconButton>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {standardIconStates.map((state) => (
          <IconButtonStatePreview key={state.id} state={state} />
        ))}
      </div>
      {glitchState ? (
        <div className="space-y-[var(--space-1)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <IconButtonStatePreview state={glitchState} />
          </div>
          <p className="text-caption text-muted-foreground">
            Default variant glitch tokens hue-shift per theme; Noir and
            Hardstuck thin the ring/halo alpha to hold ≥3:1 contrast around the
            control silhouette.
          </p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {DEFAULT_ICON_BUTTON_STATES.map((state) => (
          <IconButtonStatePreview key={state.id} state={state} />
        ))}
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "icon-button",
      name: "IconButton",
      description: "Size, variant, and state coverage",
      kind: "primitive",
      tags: ["button", "icon"],
      props: [
        {
          name: "variant",
          type: '"default" | "neo" | "ghost" | "glitch"',
          description:
            'Visual treatment of the button. "default" is solid, "neo" applies the soft depth treatment, and "glitch" enables the overlay. Legacy aliases map to "default"/"neo" automatically.',
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
          id: "variant",
          label: "Variant",
          type: "variant",
          values: [
            { value: "Ghost" },
            { value: "Neo" },
            { value: "Default" },
            { value: "Glitch" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: [...ICON_BUTTON_STATES, ...DEFAULT_ICON_BUTTON_STATES].map(
            ({ name, id }) => ({
              value: name,
              description:
                id === "glitch"
                  ? "Glitch overlay uses theme hue + alpha adjustments so Noir and Hardstuck keep the halo readable."
                  : undefined,
            }),
          ),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:icon-button:matrix",
        render: () => <IconButtonGalleryPreview />,
      }),
      states: [...ICON_BUTTON_STATES, ...DEFAULT_ICON_BUTTON_STATES].map(
        (state) => ({
          id: state.id,
          name: state.name,
          code: state.code,
          preview: createGalleryPreview({
            id: `ui:icon-button:state:${state.id}`,
            render: () => <IconButtonStatePreview state={state} />,
          }),
        }),
      ),
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <IconButton size="sm" variant="ghost" aria-label="Add item sm">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="ghost" aria-label="Add item md">
      <Plus />
    </IconButton>
    <IconButton size="lg" variant="ghost" aria-label="Add item lg">
      <Plus />
    </IconButton>
    <IconButton size="xl" variant="ghost" aria-label="Add item xl">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="neo" aria-label="Add item neo">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="default" aria-label="Add item default">
      <Plus />
    </IconButton>
  </div>
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <IconButton aria-label="Default">
      <Plus />
    </IconButton>
    <IconButton className="bg-[--hover]" aria-label="Hover">
      <Plus />
    </IconButton>
    <IconButton className="ring-2 ring-[var(--focus)]" aria-label="Focus">
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--active]"
      aria-pressed
      aria-label="Active"
    >
      <Plus />
    </IconButton>
    <IconButton disabled aria-label="Disabled">
      <Plus />
    </IconButton>
    <IconButton loading aria-label="Loading">
      <Plus />
    </IconButton>
  </div>
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <IconButton variant="default" aria-label="Default variant">
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--hover] shadow-[var(--shadow-neon-strong)]"
      variant="default"
      aria-label="Default hover"
    >
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]"
      variant="default"
      aria-label="Default active"
      aria-pressed
    >
      <Plus />
    </IconButton>
  </div>
</div>`,
    },
  ],
});
