"use client";

import * as React from "react";
import OutlineGlowDemo from "./OutlineGlowDemo";
import SectionLabel from "@/components/reviews/SectionLabel";
import {
  Card,
  Input,
  Select,
  Textarea,
  FieldShell,
  Button,
  Label,
  Badge,
  Snackbar,
  Spinner,
  SectionCard,
  TitleBar,
  SideSelector,
  PillarBadge,
  PillarSelector,
  SearchBar,
  AnimatedSelect,
  ThemeToggle,
  AnimationToggle,
  CheckCircle,
  Toggle,
} from "@/components/ui";
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
  return (
    <>
      <OutlineGlowDemo />
      <SectionLabel>Section Label</SectionLabel>
      <p className="text-sm text-muted-foreground">Divider used in reviews</p>

      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Input</h3>
        <p className="text-sm text-muted-foreground">
          Customize focus rings with the <code>--theme-ring</code> variable.
        </p>
        <div className="space-y-3">
          <Input height="sm" placeholder="Small" />
          <Input placeholder="Medium" />
          <Input height="lg" placeholder="Large" />
          <Input height={12} placeholder="h-12" />
          <Input placeholder="Pill" tone="pill" />
          <Input placeholder="Error" aria-invalid="true" />
          <Input
            placeholder="Custom ring"
            style={{ '--theme-ring': 'hsl(var(--danger))' } as React.CSSProperties}
          />
          <Input placeholder="With action">
            <button
              type="button"
              aria-label="Confirm"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center border border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/0.25)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.22)]"
            >
              <CheckIcon className="size-4" />
            </button>
          </Input>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Select</h3>
        <div className="space-y-3">
          <Select aria-label="Default">
            <option value="">Choose…</option>
            <option value="a">A</option>
          </Select>
          <Select aria-label="Pill" tone="pill">
            <option value="">Choose…</option>
            <option value="a">A</option>
          </Select>
          <Select aria-label="Error" errorText="Error">
            <option value="">Choose…</option>
            <option value="a">A</option>
          </Select>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Textarea</h3>
        <div className="space-y-3">
          <Textarea placeholder="Default" resize="resize-y" />
          <Textarea placeholder="Pill" tone="pill" resize="resize-y" />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Label</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="label-demo">Label</Label>
            <Input id="label-demo" placeholder="With spacing" />
          </div>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">FieldShell</h3>
        <p className="type-body">
          Shared wrapper that provides consistent borders, background, and focus
          states for inputs. <code>Input</code>, <code>Select</code>, and
          <code>Textarea</code> all use this wrapper internally. Extend styles
          with the <code>className</code> prop on each component; use
          <code>inputClassName</code>, <code>selectClassName</code>, or
          <code>textareaClassName</code> to target the inner element.
        </p>
        <FieldShell>
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Custom content
          </div>
        </FieldShell>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Button</h3>
        <div className="space-x-3">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Card</h3>
        <div className="space-y-3">
          <Card>Card content</Card>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">IconButton</h3>
        <div className="space-x-3">
          <IconButton aria-label="Scroll to top" size="md">
            <ArrowUp />
          </IconButton>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Feedback</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Spinner />
          <Badge>Badge</Badge>
          <Snackbar message="Saved" />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Toggles</h3>
        <div className="flex flex-wrap items-center gap-4">
          <AnimationToggle />
          <ThemeToggle />
          <CheckCircle checked={false} onChange={() => {}} />
          <Toggle value="Left" onChange={() => {}} />
          <SideSelector value="Blue" onChange={() => {}} />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Pillars</h3>
        <div className="flex flex-wrap items-center gap-4">
          <PillarBadge pillar="Wave" />
          <PillarSelector value={[]} onChange={() => {}} />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Inputs</h3>
        <div className="space-y-3">
          <SearchBar value="" onValueChange={() => {}} />
          <AnimatedSelect
            items={[{ value: "a", label: "Apple" }]}
            value="a"
            onChange={() => {}}
          />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Layout</h3>
        <SectionCard>
          <SectionCard.Header>
            <TitleBar label="TitleBar" />
          </SectionCard.Header>
          <SectionCard.Body />
        </SectionCard>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Shadows</h3>
        <div className="flex flex-wrap gap-4">
          <div className="size-16 rounded-2xl bg-panel/80 shadow-neo" />
          <div className="size-16 rounded-2xl bg-panel/80 shadow-neo-strong" />
          <div className="size-16 rounded-2xl bg-panel/80 shadow-neo-inset" />
          <div className="size-16 rounded-2xl bg-panel/80 shadow-ring" />
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Task Tile Text</h3>
        <div className="space-y-2">
          <button type="button" className="task-tile__text">
            Editable task
          </button>
          <button
            type="button"
            className="task-tile__text line-through-soft"
          >
            Completed task
          </button>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Design Tokens</h3>
        <div>
          <h4 className="type-subtitle">Colors</h4>
          <div className="flex gap-2">
            {colorTokens.map((c) => (
              <div key={c} className={`size-6 rounded ${c}`} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="type-subtitle">Spacing</h4>
          <p className="type-body">{spacingTokens.join(', ')}</p>
        </div>
        <div>
          <h4 className="type-subtitle">Glow</h4>
          <p className="type-body">{glowTokens.join(', ')}</p>
        </div>
        <div>
          <h4 className="type-subtitle">Focus Ring</h4>
          <p className="type-body">{focusRingToken} for theme-aware ring color</p>
        </div>
        <div>
          <h4 className="type-subtitle">Radius</h4>
          <p className="type-body">{radiusTokens.join(', ')}</p>
          <div className="mt-2 flex gap-2">
            {radiusClasses.map((cls) => (
              <div
                key={cls}
                className={`size-6 bg-panel/80 ${cls}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="type-subtitle">Type Ramp</h4>
          <p className="type-body">{typeRamp.join(', ')}</p>
        </div>
      </Card>
      <Card className="mt-8 space-y-4">
        <h3 className="type-title">Motion</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded bg-[hsl(var(--accent)/0.2)] transition-opacity duration-420 hover:opacity-60"
          >
            Slow fade
          </button>
        </div>
      </Card>
    </>
  );
}

