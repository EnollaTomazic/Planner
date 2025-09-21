"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Field,
  Input,
  Label,
  SearchBar,
  Select,
  SettingsSelect,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import GalleryItem from "../GalleryItem";
import { selectItems } from "./ComponentGallery.demoData";
import type { InputsPanelData } from "./useComponentGalleryState";

const GRID_CLASS =
  "grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 md:grid-cols-12 md:gap-[var(--space-8)]";
const fieldStoryHref = "/storybook/?path=/story/primitives-field--state-gallery";
type PanelItem = { label: string; element: React.ReactNode; className?: string };

interface InputsPanelProps {
  data: InputsPanelData;
}

export default function InputsPanel({ data }: InputsPanelProps) {
  const items = React.useMemo<PanelItem[]>(
    () =>
      [
        {
          label: "Input",
          element: (
            <Input aria-label="Demo input" placeholder="Type here" className="w-56" />
          ),
        },
        {
          label: "Textarea",
          element: (
            <Textarea aria-label="Demo textarea" placeholder="Write here" className="w-56" />
          ),
        },
        {
          label: "Field",
          element: (
            <div className="w-56 space-y-[var(--space-2)]">
              <Field.Root>
                <Field.Input aria-label="Field input demo" placeholder="Primitive input" />
              </Field.Root>
              <a
                href={fieldStoryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[var(--space-1)] text-label font-medium text-accent-foreground transition-colors duration-[var(--dur-quick)] ease-out hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Explore Field states
              </a>
            </div>
          ),
        },
        {
          label: "Label",
          element: (
            <div className="w-56">
              <Label htmlFor={data.labelId}>Label</Label>
              <Input id={data.labelId} placeholder="With spacing" />
            </div>
          ),
        },
        {
          label: "SearchBar",
          element: (
            <SearchBar
              value={data.searchBar.value}
              onValueChange={data.searchBar.onValueChange}
              className="w-56"
            />
          ),
        },
        {
          label: "SearchBar (loading)",
          element: (
            <SearchBar
              value={data.searchBar.value}
              onValueChange={data.searchBar.onValueChange}
              className="w-56"
              loading
            />
          ),
        },
        {
          label: "Select",
          element: (
            <Select
              variant="native"
              aria-label="Fruit"
              className="w-56"
              items={[
                { value: "", label: "Choose…" },
                { value: "apple", label: "Apple" },
                { value: "orange", label: "Orange" },
                { value: "pear", label: "Pear" },
              ]}
              value={data.selects.native.value}
              onChange={data.selects.native.onChange}
            />
          ),
        },
        {
          label: "SettingsSelect",
          element: (
            <SettingsSelect
              ariaLabel="Theme"
              prefixLabel="Theme"
              items={selectItems}
              value={data.selects.settings.value}
              onChange={data.selects.settings.onChange}
              className="w-56"
            />
          ),
        },
        {
          label: "Select Variants",
          element: (
            <div className="w-56 space-y-[var(--space-2)]">
              <Select
                variant="native"
                items={[
                  { value: "", label: "Choose…" },
                  { value: "a", label: "A" },
                  { value: "b", label: "B" },
                ]}
                value={data.selects.defaultVariant.value}
                onChange={data.selects.defaultVariant.onChange}
                aria-label="Default native select demo"
              />
              <Select
                variant="native"
                success
                items={[
                  { value: "", label: "Choose…" },
                  { value: "a", label: "A" },
                ]}
                value={data.selects.successVariant.value}
                onChange={data.selects.successVariant.onChange}
                aria-label="Success native select demo"
              />
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "Textarea Variants",
          element: (
            <div className="w-56 space-y-[var(--space-2)]">
              <Textarea aria-label="Default textarea demo" placeholder="Default" />
            </div>
          ),
        },
        {
          label: "Input Variants",
          element: (
            <div className="w-56 space-y-[var(--space-2)]">
              <Input aria-label="Small input demo" height="sm" placeholder="Small" />
              <Input aria-label="Medium input demo" placeholder="Medium" />
              <Input aria-label="Large input demo" height="lg" placeholder="Large" />
              <Input aria-label="Tall input demo" height="xl" placeholder="Extra large" />
              <Input aria-label="Input with icon demo" placeholder="With icon" hasEndSlot>
                <Plus className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </Input>
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
        {
          label: "AnimatedSelect",
          element: (
            <div className="w-56 space-y-[var(--space-2)]">
              <Select
                variant="animated"
                size="sm"
                items={selectItems}
                value={data.selects.settings.value}
                onChange={data.selects.settings.onChange}
                className="w-full"
                hideLabel
                placeholder="Small"
                ariaLabel="Small animated select demo"
              />
              <Select
                variant="animated"
                items={selectItems}
                value={data.selects.settings.value}
                onChange={data.selects.settings.onChange}
                className="w-full"
                hideLabel
                placeholder="Medium"
                ariaLabel="Medium animated select demo"
              />
              <Select
                variant="animated"
                size="lg"
                items={selectItems}
                value={data.selects.settings.value}
                onChange={data.selects.settings.onChange}
                className="w-full"
                hideLabel
                placeholder="Large"
                ariaLabel="Large animated select demo"
              />
            </div>
          ),
        },
      ],
    [
      data.searchBar.value,
      data.searchBar.onValueChange,
      data.labelId,
      data.selects.native.value,
      data.selects.native.onChange,
      data.selects.settings.value,
      data.selects.settings.onChange,
      data.selects.defaultVariant.value,
      data.selects.defaultVariant.onChange,
      data.selects.successVariant.value,
      data.selects.successVariant.onChange,
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
