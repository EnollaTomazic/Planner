import * as React from "react";
import { Plus } from "lucide-react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";

import Button from "./Button";

type ButtonStateSpec = {
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
    className: "ring-2 ring-[var(--focus)]",
    props: { children: "Focus" },
    code: "<Button className=\"ring-2 ring-[var(--focus)]\">Focus</Button>",
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
];

function ButtonStatePreview({ state }: { state: ButtonStateSpec }) {
  const { className, props } = state;
  return <Button className={className} {...props} />;
}

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
        {BUTTON_STATES.map((state) => (
          <ButtonStatePreview key={state.id} state={state} />
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
          values: BUTTON_STATES.map(({ name }) => ({ value: name })),
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
