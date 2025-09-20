import * as React from "react";
import { Plus } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Button from "./Button";

const BUTTON_STATES = [
  { label: "Default", className: undefined, props: { children: "Default" } },
  {
    label: "Hover",
    className: "bg-[--hover]",
    props: { children: "Hover" },
  },
  {
    label: "Focus",
    className: "ring-2 ring-[var(--focus)]",
    props: { children: "Focus" },
  },
  {
    label: "Active",
    className: "bg-[--active]",
    props: { children: "Active" },
  },
  {
    label: "Disabled",
    className: undefined,
    props: { children: "Disabled", disabled: true },
  },
  {
    label: "Loading",
    className: undefined,
    props: { children: "Loading", loading: true },
  },
] satisfies ReadonlyArray<{
  label: string;
  className?: string;
  props: React.ComponentProps<typeof Button>;
}>;

function ButtonGalleryPreview() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button tone="primary">Primary tone</Button>
        <Button tone="accent">Accent tone</Button>
        <Button tone="info" variant="ghost">
          Info ghost
        </Button>
        <Button tone="danger" variant="primary">
          Danger primary
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <Button size="sm">
          <Plus aria-hidden />
          Small
        </Button>
        <Button size="md">
          <Plus aria-hidden />
          Medium
        </Button>
        <Button size="lg">
          <Plus aria-hidden />
          Large
        </Button>
        <Button size="xl">
          <Plus aria-hidden />
          Extra large
        </Button>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {BUTTON_STATES.map(({ label, className, props }) => (
          <Button key={label} className={className} {...props} />
        ))}
      </div>
    </div>
  );
}

export default defineGallerySection({
  id: "buttons",
  entries: [
    {
      id: "button",
      name: "Button",
      description: "Tone, size, and interaction states",
      kind: "primitive",
      tags: ["button", "action"],
      props: [
        {
          name: "variant",
          type: '"primary" | "secondary" | "ghost"',
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
          id: "state",
          label: "State",
          type: "state",
          values: BUTTON_STATES.map(({ label }) => ({ value: label })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:button:matrix",
        render: () => <ButtonGalleryPreview />,
      }),
      code: `<div className="flex flex-col gap-[var(--space-4)]">
  <div className="flex flex-wrap gap-[var(--space-2)]">
    <Button tone="primary">Primary tone</Button>
    <Button tone="accent">Accent tone</Button>
    <Button tone="info" variant="ghost">
      Info ghost
    </Button>
    <Button tone="danger" variant="primary">
      Danger primary
    </Button>
    <Button disabled>Disabled</Button>
  </div>
  <div className="flex flex-wrap items-center gap-[var(--space-2)]">
    <Button size="sm">
      <Plus />
      Small
    </Button>
    <Button size="md">
      <Plus />
      Medium
    </Button>
    <Button size="lg">
      <Plus />
      Large
    </Button>
    <Button size="xl">
      <Plus />
      Extra large
    </Button>
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
});
