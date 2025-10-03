"use client";

import * as React from "react";

import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import Field from "@/components/ui/primitives/Field";
import { FIELD_STATE_SPECS } from "@/components/ui/primitives/Field.gallery";
import Input from "@/components/ui/primitives/Input";
import {
  INPUT_STATE_SPECS,
  type InputStateSpec,
} from "@/components/ui/primitives/Input.gallery";
import RadioIconGroup from "@/components/ui/radio/RadioIconGroup";
import {
  RADIO_ICON_GROUP_DEMO_OPTIONS,
  RADIO_ICON_GROUP_STATE_SPECS,
  type RadioIconGroupStateSpec,
} from "@/components/ui/radio/RadioIconGroup.gallery";
import { cn } from "@/lib/utils";

type FormStateId = "default" | "hover" | "focus" | "active" | "disabled" | "loading";

export const FORM_PREVIEW_REQUIRED_STATE_IDS: readonly FormStateId[] = [
  "default",
  "hover",
  "focus",
  "active",
  "disabled",
  "loading",
];

const filterInputStates = (states: readonly InputStateSpec[]) => {
  const allowed = new Set(FORM_PREVIEW_REQUIRED_STATE_IDS);
  return states.filter((state) => allowed.has(state.id as FormStateId));
};

const inputStates = filterInputStates(INPUT_STATE_SPECS);

const normalizeFormStateId = (id: string): FormStateId | null => {
  if (id === "focus-visible") {
    return "focus";
  }
  const formId = id as FormStateId;
  if (FORM_PREVIEW_REQUIRED_STATE_IDS.includes(formId)) {
    return formId;
  }
  return null;
};

const radioIconGroupStates: Array<
  RadioIconGroupStateSpec & { id: FormStateId }
> = RADIO_ICON_GROUP_STATE_SPECS.flatMap((state) => {
  const normalizedId = normalizeFormStateId(state.id);
  if (!normalizedId) {
    return [] as const;
  }
  return [
    {
      ...state,
      id: normalizedId,
    },
  ] as const;
});

function renderInputState(state: InputStateSpec) {
  const { className, props } = state;
  return <Input className={cn(className, props.className)} {...props} />;
}

function renderRadioIconGroupState(state: RadioIconGroupStateSpec & { id: FormStateId }) {
  const { className, props } = state;
  const {
    className: propClassName,
    value,
    options,
    onChange,
    name,
    ...restProps
  } = props ?? {};
  const resolvedOptions =
    options ?? (RADIO_ICON_GROUP_DEMO_OPTIONS.length > 0 ? RADIO_ICON_GROUP_DEMO_OPTIONS : []);
  const resolvedValue =
    value === null
      ? null
      : typeof value === "string"
        ? value
        : resolvedOptions[0]?.value ?? RADIO_ICON_GROUP_DEMO_OPTIONS[0]?.value ?? "";
  const resolvedName = name ?? `forms-radio-icon-group-${state.id}`;
  const handleChange = onChange ?? (() => {});

  return (
    <RadioIconGroup
      options={resolvedOptions}
      value={resolvedValue}
      name={resolvedName}
      onChange={handleChange}
      {...restProps}
      className={cn(className, propClassName)}
    />
  );
}

const fieldStateEntries = FIELD_STATE_SPECS.map(
  (state) => [state.id, state] as const,
);
const fieldStateMap = new Map(fieldStateEntries);

const HoverFieldState: React.FC = () => (
  <Field.Root className="bg-interaction-focus-surfaceHover" helper="Hover tokens preview">
    <Field.Input placeholder="Hover field" />
  </Field.Root>
);

const ActiveFieldState: React.FC = () => (
  <Field.Root
    className="bg-interaction-focus-surfaceActive ring-2 ring-[color:var(--theme-ring,var(--focus))] ring-offset-2 ring-offset-[color:var(--surface-2)]"
    helper="Pressed state"
    helperId="field-active-helper"
    counter="64 / 100"
    counterId="field-active-counter"
  >
    <Field.Input
      aria-describedby="field-active-helper field-active-counter"
      placeholder="Active field"
    />
  </Field.Root>
);

const defaultFieldState = fieldStateMap.get("default");
const focusFieldState = fieldStateMap.get("focus-visible");
const loadingFieldState = fieldStateMap.get("loading");
const disabledFieldState = fieldStateMap.get("disabled");

const resolvedFieldStates: Array<{
  id: FormStateId;
  name: string;
  Component: React.ComponentType;
}> = [];

if (defaultFieldState) {
  resolvedFieldStates.push({
    id: "default",
    name: defaultFieldState.name,
    Component: defaultFieldState.Component,
  });
}

resolvedFieldStates.push({ id: "hover", name: "Hover", Component: HoverFieldState });

if (focusFieldState) {
  resolvedFieldStates.push({
    id: "focus",
    name: "Focus-visible",
    Component: focusFieldState.Component,
  });
}

resolvedFieldStates.push({ id: "active", name: "Active", Component: ActiveFieldState });

if (disabledFieldState) {
  resolvedFieldStates.push({
    id: "disabled",
    name: disabledFieldState.name,
    Component: disabledFieldState.Component,
  });
}

if (loadingFieldState) {
  resolvedFieldStates.push({
    id: "loading",
    name: loadingFieldState.name,
    Component: loadingFieldState.Component,
  });
}

export const FORM_CONTROL_STATE_IDS: Record<string, readonly FormStateId[]> = {
  input: inputStates.map((state) => state.id as FormStateId),
  field: resolvedFieldStates.map((state) => state.id),
  "radio-icon-group": radioIconGroupStates.map((state) => state.id),
};

const stateFigureClassName =
  "flex flex-col items-center gap-[var(--space-2)] text-center";
const surfaceClassName = cn(
  "flex w-full items-center justify-center rounded-card border border-card-hairline-60",
  "bg-surface-2/60 p-[var(--space-3)] shadow-[var(--shadow-inset-hairline)]",
);

function FormsPreview() {
  return (
    <div className="space-y-[var(--space-6)]">
      <section aria-labelledby="forms-preview-input">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="forms-preview-input"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Input
          </h2>
          <p className="text-label text-muted-foreground">
            Text input tokens cover hover, focus, active, disabled, and loading treatments.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {inputStates.map((state) => (
            <figure key={state.id} className={stateFigureClassName}>
              <div className={surfaceClassName}>{renderInputState(state)}</div>
              <figcaption className="text-label text-muted-foreground">
                {state.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section aria-labelledby="forms-preview-field">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="forms-preview-field"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Field wrapper
          </h2>
          <p className="text-label text-muted-foreground">
            Field.Root aligns helper text, counters, and async affordances across Planner forms.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {resolvedFieldStates.map(({ id, name, Component }) => (
            <figure key={id} className={stateFigureClassName}>
              <div className={surfaceClassName}>
                <Component />
              </div>
              <figcaption className="text-label text-muted-foreground">
                {name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section aria-labelledby="forms-preview-radio-icon-group">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="forms-preview-radio-icon-group"
            className="text-subhead font-semibold tracking-[-0.01em]"
          >
            Radio icon group
          </h2>
          <p className="text-label text-muted-foreground">
            Tone-aware icon radios mirror toggle interactions and expose hover, focus-visible, active, disabled, and loading
            tokens.
          </p>
        </header>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {radioIconGroupStates.map((state) => (
            <figure key={state.id} className={stateFigureClassName}>
              <div className={surfaceClassName}>{renderRadioIconGroupState(state)}</div>
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

export default function FormsPreviewMatrixClient() {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => <FormsPreview />;
    Renderer.displayName = "FormsPreviewRenderer";
    return Renderer;
  }, []);

  return (
    <div className="space-y-[var(--space-5)]">
      <ThemeMatrix
        entryId="gallery-forms-preview"
        previewRenderer={previewRenderer}
      />
    </div>
  );
}
