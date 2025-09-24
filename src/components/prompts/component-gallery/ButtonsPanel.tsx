"use client";

import * as React from "react";
import {
  AnimationToggle,
  Button,
  Card,
  CheckCircle,
  GlitchSegmentedButton,
  GlitchSegmentedGroup,
  SideSelector,
  TabBar,
  TabList,
  TabPanel,
  Tabs,
  ThemeToggle,
  Toggle,
} from "@/components/ui";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import { cn } from "@/lib/utils";
import GalleryItem from "../GalleryItem";
import IconButtonShowcase from "../IconButtonShowcase";
import type { ButtonsPanelData } from "./useComponentGalleryState";

interface ButtonsPanelProps {
  data: ButtonsPanelData;
}

const GRID_CLASS =
  "grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 md:grid-cols-12 md:gap-[var(--space-8)]";
type PanelItem = { label: string; element: React.ReactNode; className?: string };

export default function ButtonsPanel({ data }: ButtonsPanelProps) {
  const items = React.useMemo<PanelItem[]>(
    () =>
      [
        { label: "Button", element: <Button className="w-56">Click me</Button> },
        { label: "IconButton", element: <IconButtonShowcase /> },
        {
          label: "SegmentedButton",
          element: (
            <div className="w-56 flex gap-[var(--space-2)]">
              <SegmentedButton>Default</SegmentedButton>
              <SegmentedButton selected>Active</SegmentedButton>
              <SegmentedButton disabled>Disabled</SegmentedButton>
            </div>
          ),
        },
        {
          label: "GlitchSegmented",
          element: (
            <GlitchSegmentedGroup
              value={data.segmented.value}
              onChange={data.segmented.onChange}
              className="w-56"
            >
              <GlitchSegmentedButton value="one">One</GlitchSegmentedButton>
              <GlitchSegmentedButton value="two">Two</GlitchSegmentedButton>
              <GlitchSegmentedButton value="three">Three</GlitchSegmentedButton>
            </GlitchSegmentedGroup>
          ),
        },
        {
          label: "ThemeToggle",
          element: (
            <div className="w-56 flex justify-center">
              <ThemeToggle />
            </div>
          ),
        },
        {
          label: "Button (tactile toggle)",
          element: (
            <div className="w-56 flex flex-col gap-[var(--space-2)]">
              <Button
                size="sm"
                variant="primary"
                tactile
                aria-pressed={data.tactile.primary.active}
                onClick={data.tactile.primary.onToggle}
              >
                {data.tactile.primary.active ? "Primary active" : "Primary idle"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                tone="accent"
                tactile
                aria-pressed={data.tactile.secondary.active}
                onClick={data.tactile.secondary.onToggle}
              >
                {data.tactile.secondary.active ? "Accent active" : "Accent idle"}
              </Button>
            </div>
          ),
        },
        {
          label: "AnimationToggle",
          element: (
            <div className="w-56 flex justify-center">
              <AnimationToggle />
            </div>
          ),
        },
        {
          label: "CheckCircle",
          element: (
            <div className="w-56 flex justify-center gap-[var(--space-2)]">
              <CheckCircle
                checked={data.checkCircle.checked}
                onChange={data.checkCircle.onChange}
                size="sm"
              />
              <CheckCircle
                checked={data.checkCircle.checked}
                onChange={data.checkCircle.onChange}
                size="md"
              />
              <CheckCircle
                checked={data.checkCircle.checked}
                onChange={data.checkCircle.onChange}
                size="lg"
              />
            </div>
          ),
        },
        {
          label: "Toggle",
          element: (
            <Toggle value={data.toggle.value} onChange={data.toggle.onChange} className="w-56" />
          ),
        },
        {
          label: "TabBar (default)",
          element: (
            <TabBar
              items={[
                { key: "one", label: "One" },
                { key: "two", label: "Two" },
                { key: "three", label: "Three" },
              ]}
              className="w-56"
              ariaLabel="Sample tabs"
              linkPanels={false}
            />
          ),
        },
        {
          label: "Tabs primitive",
          element: (
            <Tabs defaultValue="chat" className="max-w-md">
              <TabList
                items={[
                  { key: "chat", label: "Chat" },
                  { key: "codex", label: "Codex" },
                  { key: "notes", label: "Notes" },
                ]}
                ariaLabel="Tabs primitive demo"
                showBaseline
              />
              <TabPanel value="chat">
                <Card className="p-[var(--space-4)] text-ui">Compose prompts</Card>
              </TabPanel>
              <TabPanel value="codex">
                <Card className="p-[var(--space-4)] text-ui">Review checklists</Card>
              </TabPanel>
              <TabPanel value="notes">
                <Card className="p-[var(--space-4)] text-ui">Autosave notes</Card>
              </TabPanel>
            </Tabs>
          ),
        },
        {
          label: "TabBar (app nav)",
          element: (
            <TabBar
              items={[
                { key: "reviews", label: "Reviews" },
                { key: "planner", label: "Planner" },
                { key: "goals", label: "Goals" },
              ]}
              value={data.appTabs.value}
              onValueChange={data.appTabs.onValueChange}
              ariaLabel="Component gallery sections"
              className="w-56"
              linkPanels={false}
            />
          ),
        },
        {
          label: "TabBar (filters)",
          element: (
            <TabBar
              items={[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "done", label: "Done" },
              ]}
              value={data.filterTabs.value}
              onValueChange={data.filterTabs.onValueChange}
              ariaLabel="Filter items"
              className="w-56"
              linkPanels={false}
            />
          ),
        },
        {
          label: "TabBar (glitch)",
          element: (
            <TabBar
              items={[
                { key: "overview", label: "Overview" },
                { key: "tasks", label: "Tasks" },
                { key: "notes", label: "Notes" },
              ]}
              defaultValue="tasks"
              variant="glitch"
              ariaLabel="Glitch demo tabs"
              linkPanels={false}
              renderItem={({ item, active, props, ref, disabled }) => {
                const { className: baseClassName, onClick, ...restProps } = props;
                const className = cn(
                  "btn-like-segmented font-mono text-ui",
                  baseClassName,
                  active && "btn-glitch is-active",
                  disabled && "pointer-events-none opacity-disabled",
                );
                const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
                  onClick?.(event);
                };
                return (
                  <button
                    type="button"
                    {...restProps}
                    ref={ref as React.Ref<HTMLButtonElement>}
                    className={className}
                    disabled={disabled}
                    onClick={(event) => {
                      if (disabled) {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                      }
                      handleClick(event);
                    }}
                  >
                    <span className="relative z-10 truncate">{item.label}</span>
                    {active && (
                      <span className="pointer-events-none absolute left-[var(--space-2)] right-[var(--space-2)] -bottom-[var(--space-1)] h-px underline-gradient" />
                    )}
                  </button>
                );
              }}
            />
          ),
        },
        {
          label: "SideSelector",
          element: (
            <SideSelector
              value={data.sideSelector.value}
              onChange={data.sideSelector.onChange}
              className="w-56"
            />
          ),
        },
      ],
    [
      data.segmented.value,
      data.segmented.onChange,
      data.appTabs.value,
      data.appTabs.onValueChange,
      data.filterTabs.value,
      data.filterTabs.onValueChange,
      data.checkCircle.checked,
      data.checkCircle.onChange,
      data.toggle.value,
      data.toggle.onChange,
      data.sideSelector.value,
      data.sideSelector.onChange,
      data.tactile.primary.active,
      data.tactile.primary.onToggle,
      data.tactile.secondary.active,
      data.tactile.secondary.onToggle,
    ],
  );

  return (
    <div className={GRID_CLASS}>
      {items.map((item) => (
        <GalleryItem
          key={item.label}
          label={item.label}
          className={cn("md:col-span-4", item.className)}
        >
          {item.element}
        </GalleryItem>
      ))}
    </div>
  );
}
