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
      "ring-2 ring-[var(--ring-contrast)] shadow-glow-md [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]",
    props: { "aria-label": "Focus", children: <Plus aria-hidden /> },
    code:
      "<IconButton className=\"ring-2 ring-[var(--ring-contrast)] shadow-glow-md [outline:var(--spacing-0-5)_solid_var(--ring-contrast)] [outline-offset:var(--spacing-0-5)]\" aria-label=\"Focus\">\n  <Plus />\n</IconButton>",
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
];

const PRIMARY_ICON_BUTTON_STATES: readonly IconButtonStateSpec[] = [
  {
    id: "primary",
    name: "Primary",
    props: {
      "aria-label": "Primary",
      variant: "primary",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton variant=\"primary\" aria-label=\"Primary\">\n  <Plus />\n</IconButton>",
  },
  {
    id: "primary-hover",
    name: "Primary Hover",
    className: "bg-[--hover] shadow-neon-strong",
    props: {
      "aria-label": "Primary hover",
      variant: "primary",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton\n  className=\"bg-[--hover] shadow-neon-strong\"\n  variant=\"primary\"\n  aria-label=\"Primary hover\"\n>\n  <Plus />\n</IconButton>",
  },
  {
    id: "primary-active",
    name: "Primary Active",
    className:
      "bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]",
    props: {
      "aria-label": "Primary active",
      "aria-pressed": true,
      variant: "primary",
      children: <Plus aria-hidden />,
    },
    code: "<IconButton\n  className=\"bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]\"\n  variant=\"primary\"\n  aria-label=\"Primary active\"\n  aria-pressed\n>\n  <Plus />\n</IconButton>",
  },
];

function IconButtonStatePreview({ state }: { state: IconButtonStateSpec }) {
  const { className, props } = state;
  return <IconButton className={className} {...props} />;
}

const ICON_BUTTON_SIZES = ["sm", "md", "lg", "xl"] as const;

function IconButtonGalleryPreview() {
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
          variant="secondary"
          aria-label="Add item secondary"
        >
          <Plus aria-hidden />
        </IconButton>
        <IconButton
          size="md"
          variant="primary"
          aria-label="Add item primary"
        >
          <Plus aria-hidden />
        </IconButton>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ICON_BUTTON_STATES.map((state) => (
          <IconButtonStatePreview key={state.id} state={state} />
        ))}
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {PRIMARY_ICON_BUTTON_STATES.map((state) => (
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
          type: '"primary" | "secondary" | "ghost"',
          description:
            'Visual treatment of the button. Choose "ghost", "secondary", or "primary".',
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
            { value: "Secondary" },
            { value: "Primary" },
          ],
        },
        {
          id: "state",
          label: "State",
          type: "state",
          values: [...ICON_BUTTON_STATES, ...PRIMARY_ICON_BUTTON_STATES].map(
            ({ name }) => ({ value: name }),
          ),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:icon-button:matrix",
        render: () => <IconButtonGalleryPreview />,
      }),
      states: [...ICON_BUTTON_STATES, ...PRIMARY_ICON_BUTTON_STATES].map(
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
    <IconButton size="md" variant="secondary" aria-label="Add item secondary">
      <Plus />
    </IconButton>
    <IconButton size="md" variant="primary" aria-label="Add item primary">
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
    <IconButton variant="primary" aria-label="Primary">
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--hover] shadow-neon-strong"
      variant="primary"
      aria-label="Primary hover"
    >
      <Plus />
    </IconButton>
    <IconButton
      className="bg-[--active] shadow-[var(--shadow-inset-contrast),var(--shadow-neon-soft)]"
      variant="primary"
      aria-label="Primary active"
      aria-pressed
    >
      <Plus />
    </IconButton>
  </div>
</div>`,
    },
  ],
});
