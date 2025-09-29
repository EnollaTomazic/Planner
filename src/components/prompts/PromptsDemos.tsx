"use client";

import * as React from "react";
import OutlineGlowDemo from "./OutlineGlowDemo";
import SectionLabel from "@/components/reviews/SectionLabel";
import {
  Card,
  Input,
  Select,
  Textarea,
  Field,
  Button,
  Label,
  Snackbar,
  Spinner,
  SectionCard,
  TitleBar,
  SideSelector,
  PillarBadge,
  PillarSelector,
  SearchBar,
  ThemeToggle,
  AnimationToggle,
  CheckCircle,
  Toggle,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import IconButton from "@/components/ui/primitives/IconButton";
// Prompts components: GalleryItem, PromptsComposePanel, PromptsHeader
import { ArrowUp, Check as CheckIcon } from "lucide-react";
import {
  colorTokens,
  spacingTokens,
  glowTokens,
  focusRingToken,
  radiusTokens,
  radiusClasses,
  typeRamp,
} from "./demoData";

export default function PromptsDemos() {
  const labelDemoId = React.useId();

  return (
    <>
      <OutlineGlowDemo />
      <SectionLabel>Section Label</SectionLabel>
      <p className="text-ui text-muted-foreground">Divider used in reviews</p>

      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Input</h3>
        <p className="text-ui text-muted-foreground">
          Customize focus rings with the <code>--theme-ring</code> variable.
        </p>
        <div className="space-y-[var(--space-3)]">
          <Input height="sm" placeholder="Small" />
          <Input placeholder="Medium" />
          <Input height="lg" placeholder="Large" />
          <Input height="xl" placeholder="Extra large" />
          <Input className="rounded-full" placeholder="Rounded" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Error" aria-invalid="true" />
          <Input placeholder="Custom ring" ringTone="danger" />
          <Input placeholder="With action">
            <IconButton
              size="sm"
              aria-label="Confirm"
              className="absolute right-[var(--space-2)] top-1/2 -translate-y-1/2"
            >
              <CheckIcon aria-hidden />
            </IconButton>
          </Input>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Select</h3>
        <div className="space-y-[var(--space-3)]">
          <Select
            variant="native"
            aria-label="Default"
            items={[
              { value: "", label: "Choose…" },
              { value: "a", label: "A" },
            ]}
            value=""
          />
          <Select
            variant="native"
            aria-label="Error"
            errorText="Error"
            items={[
              { value: "", label: "Choose…" },
              { value: "a", label: "A" },
            ]}
            value=""
          />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Textarea</h3>
        <div className="space-y-[var(--space-3)]">
          <Textarea placeholder="Default" resize="resize-y" />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Label</h3>
        <div className="space-y-[var(--space-3)]">
          <div>
            <Label htmlFor={labelDemoId}>Label</Label>
            <Input id={labelDemoId} placeholder="With spacing" />
          </div>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Field</h3>
        <p className="type-body">
          The Field primitive centralizes spacing, shadows, and interactive
          states for our inputs. Pair <code>Field.Root</code> with
          <code>Field.Input</code>, <code>Field.Textarea</code>, or
          <code>Field.Select</code> to compose custom controls while staying on
          token.
        </p>
        <Field.Root className="w-full max-w-[calc(var(--space-8)*5)]">
          <Field.Input placeholder="Compose primitives" />
        </Field.Root>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Button</h3>
        <div className="space-x-[var(--space-3)]">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Card</h3>
        <div className="space-y-[var(--space-3)]">
          <Card>Card content</Card>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">IconButton</h3>
        <div className="space-x-[var(--space-3)]">
          <IconButton aria-label="Scroll to top" size="md">
            <ArrowUp />
          </IconButton>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Feedback</h3>
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <Spinner />
          <Badge>Badge</Badge>
          <Snackbar message="Saved" />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Toggles</h3>
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <AnimationToggle />
          <ThemeToggle />
          <CheckCircle checked={false} onChange={() => {}} size="md" />
          <Toggle value="Left" onChange={() => {}} />
          <SideSelector value="Blue" onChange={() => {}} />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Pillars</h3>
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <PillarBadge pillar="Wave" />
          <PillarSelector value={[]} onChange={() => {}} />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Inputs</h3>
        <div className="space-y-[var(--space-3)]">
          <SearchBar value="" onValueChange={() => {}} />
          <Select
            variant="animated"
            items={[{ value: "a", label: "Apple" }]}
            value="a"
            onChange={() => {}}
          />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Layout</h3>
        <SectionCard>
          <SectionCard.Header>
            <TitleBar label="TitleBar" />
          </SectionCard.Header>
          <SectionCard.Body />
        </SectionCard>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Shadows</h3>
        <div className="flex flex-wrap gap-[var(--space-4)]">
          <div className="size-16 rounded-card r-card-lg bg-panel/80 shadow-neo" />
          <div className="size-16 rounded-card r-card-lg bg-panel/80 shadow-neo-strong" />
          <div className="size-16 rounded-card r-card-lg bg-panel/80 shadow-neo-inset" />
          <div className="size-16 rounded-card r-card-lg bg-panel/80 shadow-ring" />
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Task Tile Text</h3>
        <div className="space-y-[var(--space-2)]">
          <button type="button" className="task-tile__text">
            Editable task
          </button>
          <button type="button" className="task-tile__text line-through-soft">
            Completed task
          </button>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Design Tokens</h3>
        <div>
          <h4 className="type-subtitle">Colors</h4>
          <div className="flex gap-[var(--space-2)]">
            {colorTokens.map((c) => (
              <div
                key={c}
                className={`size-6 rounded-[var(--radius-md)] ${c}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="type-subtitle">Spacing</h4>
          <p className="type-body">{spacingTokens.join(", ")}</p>
        </div>
        <div>
          <h4 className="type-subtitle">Glow</h4>
          <p className="type-body">{glowTokens.join(", ")}</p>
        </div>
        <div>
          <h4 className="type-subtitle">Focus Ring</h4>
          <p className="type-body">
            {focusRingToken} for theme-aware ring color
          </p>
        </div>
        <div>
          <h4 className="type-subtitle">Radius</h4>
          <p className="type-body">{radiusTokens.join(", ")}</p>
          <div className="mt-[var(--space-2)] flex gap-[var(--space-2)]">
            {radiusClasses.map((cls) => (
              <div key={cls} className={`size-6 bg-panel/80 ${cls}`} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="type-subtitle">Type Ramp</h4>
          <p className="type-body">{typeRamp.join(", ")}</p>
        </div>
      </Card>
      <Card className="mt-[var(--space-8)] space-y-[var(--space-4)]">
        <h3 className="type-title">Motion</h3>
        <div className="flex gap-[var(--space-2)]">
          <button
            type="button"
            className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--control-radius)] bg-accent/20 text-foreground transition-colors duration-slow hover:bg-accent/30 hover:text-foreground"
          >
            Slow fade
          </button>
        </div>
      </Card>
    </>
  );
}
