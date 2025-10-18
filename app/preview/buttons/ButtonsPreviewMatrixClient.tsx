"use client";

import * as React from "react";

import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import {
  type ButtonStateSpec,
  BUTTON_STATE_SPECS,
} from "@/components/ui/primitives/Button.gallery";
import {
  type IconButtonStateSpec,
  ICON_BUTTON_STATE_SPECS,
} from "@/components/ui/primitives/IconButton.gallery";
import {
  type SegmentedButtonStateSpec,
  SEGMENTED_BUTTON_STATE_SPECS,
} from "@/components/ui/primitives/SegmentedButton.gallery";
import { Button, IconButton } from "@/components/ui";
import { SegmentedButton } from "@/components/ui/primitives/SegmentedButton";
import { cn } from "@/lib/utils";

type PreviewStateId =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "loading";

export const BUTTON_PREVIEW_REQUIRED_STATE_IDS: readonly PreviewStateId[] = [
  "default",
  "hover",
  "focus",
  "active",
  "disabled",
  "loading",
];

const SEGMENTED_STATE_ALIAS: Record<string, PreviewStateId | undefined> = {
  default: "default",
  hover: "hover",
  active: "active",
  "focus-visible": "focus",
  disabled: "disabled",
  "disabled-link": "disabled",
  loading: "loading",
};

const filterStates = <T extends { id: string }>(
  states: readonly T[],
  aliases: Record<string, PreviewStateId | undefined> | null = null,
) => {
  const allowed = new Set(BUTTON_PREVIEW_REQUIRED_STATE_IDS);
  return states.filter((state) => {
    if (allowed.has(state.id as PreviewStateId)) {
      return true;
    }
    if (!aliases) {
      return false;
    }
    const mapped = aliases[state.id];
    return mapped ? allowed.has(mapped) : false;
  });
};

const buttonStates = filterStates<ButtonStateSpec>(BUTTON_STATE_SPECS);
const iconButtonStates = filterStates<IconButtonStateSpec>(
  ICON_BUTTON_STATE_SPECS,
);
const segmentedButtonStates = filterStates<SegmentedButtonStateSpec>(
  SEGMENTED_BUTTON_STATE_SPECS,
  SEGMENTED_STATE_ALIAS,
);

const stateFigureClassName =
  "flex flex-col items-center gap-[var(--space-2)] text-center";
const stateSurfaceClassName = cn(
  "flex min-h-[var(--space-12)] min-w-[var(--space-12)] items-center justify-center",
  "rounded-card border border-card-hairline/70 bg-card/70 p-[var(--space-3)]",
  "shadow-depth-soft",
);

function renderButtonState(state: ButtonStateSpec) {
  const { className, props } = state;
  return (
    <Button
      className={cn("w-full justify-center", className, props.className)}
      {...props}
    />
  );
}

function renderIconButtonState(state: IconButtonStateSpec) {
  const { className, props } = state;
  return (
    <IconButton
      className={cn(className, props.className)}
      {...props}
    />
  );
}

function renderSegmentedButtonState(state: SegmentedButtonStateSpec) {
  const { props } = state;
  return <SegmentedButton {...props} />;
}

export const BUTTON_CONTROL_STATE_IDS: Record<string, readonly string[]> = {
  button: buttonStates.map((state) => state.id),
  "icon-button": iconButtonStates.map((state) => state.id),
  "segmented-button": segmentedButtonStates.map(
    (state) => SEGMENTED_STATE_ALIAS[state.id] ?? state.id,
  ),
};

function ButtonsPreview() {
  return (
    <div className="space-y-[var(--space-6)]">
      <section aria-labelledby="buttons-preview-primary">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="buttons-preview-primary"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Button
          </h2>
          <p className="text-label text-muted-foreground">
            Default trigger variants across default, hover, focus, active,
            disabled, and loading states.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {buttonStates.map((state) => (
            <figure key={state.id} className={stateFigureClassName}>
              <div className={stateSurfaceClassName}>{renderButtonState(state)}</div>
              <figcaption className="text-label text-muted-foreground">
                {state.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section aria-labelledby="buttons-preview-icon">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="buttons-preview-icon"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Icon button
          </h2>
          <p className="text-label text-muted-foreground">
            Icon-only affordances maintain contrast and focus treatments per
            Planner state tokens.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {iconButtonStates.map((state) => (
            <figure key={state.id} className={stateFigureClassName}>
              <div className={stateSurfaceClassName}>
                {renderIconButtonState(state)}
              </div>
              <figcaption className="text-label text-muted-foreground">
                {state.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section aria-labelledby="buttons-preview-segmented">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="buttons-preview-segmented"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Segmented button
          </h2>
          <p className="text-label text-muted-foreground">
            Inline segment controls cover pressed, disabled, and async loading
            affordances.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {segmentedButtonStates.map((state) => (
            <figure key={state.id} className={stateFigureClassName}>
              <div className={stateSurfaceClassName}>
                {renderSegmentedButtonState(state)}
              </div>
              <figcaption className="text-label text-muted-foreground">
                {state.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ButtonsPreviewMatrixClient() {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => <ButtonsPreview />;
    Renderer.displayName = "ButtonsPreviewRenderer";
    return Renderer;
  }, []);

  return (
    <div className="space-y-[var(--space-5)]">
      <ThemeMatrix
        entryId="gallery-buttons-preview"
        previewRenderer={previewRenderer}
      />
    </div>
  );
}
