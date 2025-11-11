"use client";

import * as React from "react";
import { Copy } from "lucide-react";

import type {
  GallerySerializableEntry,
  GallerySerializableStateDefinition,
} from "@/components/gallery/registry";
import { getGalleryPreview } from "@/components/prompts/constants";
import { Toast } from "@/components/ui/Toast";
import { IconButton } from "@/components/ui/primitives/IconButton";
import segmentedButtonStyles from "@/components/ui/primitives/SegmentedButton.module.css";
import { copyText } from "@/lib/clipboard";
import { defaultTheme, applyTheme, VARIANTS, type Variant } from "@/lib/theme";
import { useOptionalTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const DEFAULT_STATE_KEY = "__default__";

type ComponentPreviewProps = {
  readonly entry: GallerySerializableEntry;
  readonly onCodeChange?: (code: string | null) => void;
};

const previewStateToggles = [
  { key: DEFAULT_STATE_KEY, label: "Default", stateId: null },
  { key: "hover", label: "Hover", stateId: "hover" },
  { key: "focus", label: "Focus", stateId: "focus" },
  { key: "active", label: "Active", stateId: "active" },
  { key: "disabled", label: "Disabled", stateId: "disabled" },
  { key: "loading", label: "Loading", stateId: "loading" },
] as const;

const themeToggleHelpText = "Select a preview theme";

export const componentPreviewFrameClassName = cn(
  "relative isolate rounded-card r-card-md border border-card-hairline-60",
  "bg-[hsl(var(--surface-1)/0.92)] p-[var(--space-4)]",
  "shadow-[var(--shadow-inset-hairline)]",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-glitch-overlay before:opacity-20 before:mix-blend-soft-light",
  "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[var(--spacing-0-5)] after:rounded-[inherit] after:bg-[var(--gradient-glitch-rail)] after:opacity-80",
);

export function ComponentPreviewFallback(): JSX.Element {
  return (
    <div
      aria-busy="true"
      className="flex min-h-[var(--space-24)] items-center justify-center text-label text-muted-foreground [--space-24:calc(var(--space-8)*3)]"
    >
      Loading preview…
    </div>
  );
}

function getToggleLabel(stateId: string | null): string {
  return stateId === null
    ? "Default"
    : previewStateToggles.find((toggle) => toggle.stateId === stateId)?.label ?? "State";
}

export function ComponentPreview({ entry, onCodeChange }: ComponentPreviewProps): JSX.Element {
  const themeContext = useOptionalTheme();
  const fallbackTheme = React.useMemo(() => defaultTheme(), []);
  const baseTheme = themeContext?.[0] ?? fallbackTheme;
  const [activeVariant, setActiveVariant] = React.useState<Variant>(
    () => themeContext?.[0].variant ?? "lg",
  );

  const [activeStateId, setActiveStateId] = React.useState<string | null>(null);
  const stateDefinitions = React.useMemo(
    () => entry.states ?? [],
    [entry.states],
  );
  const stateLookup = React.useMemo(() => {
    return stateDefinitions.reduce((map, state) => {
      map.set(state.id, state);
      return map;
    }, new Map<string, GallerySerializableStateDefinition>());
  }, [stateDefinitions]);

  React.useEffect(() => {
    setActiveStateId(null);
  }, [entry.id]);

  React.useEffect(() => {
    if (!themeContext) {
      return;
    }
    const [theme] = themeContext;
    setActiveVariant(theme.variant);
  }, [themeContext]);

  React.useEffect(() => {
    if (themeContext) {
      return;
    }
    applyTheme({ variant: activeVariant, bg: baseTheme.bg });
    return () => {
      applyTheme(baseTheme);
    };
  }, [activeVariant, baseTheme, themeContext]);

  const handleThemeChange = React.useCallback(
    (nextVariant: Variant) => {
      if (themeContext) {
        const [, setTheme] = themeContext;
        setTheme((current) => {
          if (current.variant === nextVariant) {
            return current;
          }
          return { ...current, variant: nextVariant };
        });
        return;
      }
      setActiveVariant(nextVariant);
    },
    [themeContext],
  );

  const activeState = activeStateId ? stateLookup.get(activeStateId) ?? null : null;
  const activeStateKey = activeStateId ?? DEFAULT_STATE_KEY;
  const activeStateLabel = getToggleLabel(activeStateId);

  const previewId = activeState?.preview.id ?? entry.preview.id;
  const previewRenderer = React.useMemo(
    () => getGalleryPreview(previewId),
    [previewId],
  );

  const previewNode = React.useMemo(() => {
    if (!previewRenderer) {
      return <div className="text-ui text-muted-foreground">Preview unavailable</div>;
    }
    return (
      <React.Suspense fallback={<ComponentPreviewFallback />}>
        {previewRenderer()}
      </React.Suspense>
    );
  }, [previewRenderer]);

  const activeCode = React.useMemo(() => {
    if (activeState) {
      return activeState.code ?? null;
    }
    return entry.code ?? null;
  }, [activeState, entry.code]);

  React.useEffect(() => {
    if (!onCodeChange) {
      return;
    }
    onCodeChange(activeCode);
  }, [activeCode, onCodeChange]);

  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleCopy = React.useCallback(async () => {
    if (!activeCode) {
      return;
    }
    try {
      await copyText(activeCode);
      setToastMessage(`${activeStateLabel} code copied to clipboard.`);
    } catch {
      setToastMessage("Copy failed. Try again.");
    }
    setToastOpen(true);
  }, [activeCode, activeStateLabel]);

  React.useEffect(() => {
    if (!toastOpen) {
      setToastMessage(null);
    }
  }, [toastOpen]);

  const availableStateIds = React.useMemo(() => {
    return new Set(stateDefinitions.map((state) => state.id));
  }, [stateDefinitions]);

  const themeControlLabelId = React.useId();
  const stateControlLabelId = React.useId();

  const themeButtonRefs = React.useRef(new Map<Variant, HTMLButtonElement>());
  const stateButtonRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const registerThemeButton = React.useCallback(
    (variant: Variant, node: HTMLButtonElement | null) => {
      const refs = themeButtonRefs.current;
      if (!node) {
        refs.delete(variant);
        return;
      }
      refs.set(variant, node);
    },
    [],
  );

  const registerStateButton = React.useCallback((key: string, node: HTMLButtonElement | null) => {
    const refs = stateButtonRefs.current;
    if (!node) {
      refs.delete(key);
      return;
    }
    refs.set(key, node);
  }, []);

  const handleThemeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      if (!VARIANTS.length) {
        return;
      }
      if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
        return;
      }
      event.preventDefault();
      const currentIndex = VARIANTS.findIndex(({ id }) => id === activeVariant);
      const delta = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + delta + VARIANTS.length) % VARIANTS.length;
      const nextVariant = VARIANTS[nextIndex];
      if (!nextVariant) {
        return;
      }
      handleThemeChange(nextVariant.id);
      const ref = themeButtonRefs.current.get(nextVariant.id);
      ref?.focus();
    },
    [activeVariant, handleThemeChange],
  );

  const enabledStateToggles = React.useMemo(() => {
    return previewStateToggles.filter((toggle) => {
      if (toggle.stateId === null) {
        return true;
      }
      return availableStateIds.has(toggle.stateId);
    });
  }, [availableStateIds]);

  const handleStateKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      if (!enabledStateToggles.length) {
        return;
      }
      if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
        return;
      }
      event.preventDefault();
      const currentIndex = enabledStateToggles.findIndex(
        (toggle) => (toggle.stateId ?? DEFAULT_STATE_KEY) === activeStateKey,
      );
      const delta = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + delta + enabledStateToggles.length) % enabledStateToggles.length;
      const nextToggle = enabledStateToggles[nextIndex];
      if (!nextToggle) {
        return;
      }
      setActiveStateId(nextToggle.stateId);
      const refKey = nextToggle.stateId ?? DEFAULT_STATE_KEY;
      const ref = stateButtonRefs.current.get(refKey);
      ref?.focus();
    },
    [activeStateKey, enabledStateToggles],
  );

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-2)]">
          <span id={stateControlLabelId} className="text-label text-muted-foreground">
            Toggle component states
          </span>
          <div
            role="radiogroup"
            aria-labelledby={stateControlLabelId}
            className="flex flex-wrap gap-[var(--space-2)]"
            onKeyDown={handleStateKeyDown}
          >
            {previewStateToggles.map((toggle) => {
              const key = toggle.key;
              const disabled =
                toggle.stateId !== null && !availableStateIds.has(toggle.stateId);
              const selected = activeStateKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  className={cn(
                    segmentedButtonStyles.root,
                    "min-h-[var(--control-h-sm)] px-[var(--space-4)] py-[var(--space-2)] text-label",
                    "text-muted-foreground",
                    selected && "is-active text-foreground",
                  )}
                  data-selected={selected ? "true" : undefined}
                  data-depth="raised"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveStateId(toggle.stateId)}
                  ref={(node) => registerStateButton(key, node)}
                >
                  {toggle.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <span id={themeControlLabelId} className="sr-only">
            {themeToggleHelpText}
          </span>
          <div
            role="radiogroup"
            aria-labelledby={themeControlLabelId}
            className="flex flex-wrap gap-[var(--space-2)]"
            onKeyDown={handleThemeKeyDown}
          >
            {VARIANTS.map((variant) => {
              const selected = variant.id === activeVariant;
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    segmentedButtonStyles.root,
                    "min-h-[var(--control-h-sm)] px-[var(--space-4)] py-[var(--space-2)] text-label",
                    "text-muted-foreground",
                    selected && "is-active text-foreground",
                  )}
                  data-selected={selected ? "true" : undefined}
                  data-depth="raised"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => handleThemeChange(variant.id)}
                  ref={(node) => registerThemeButton(variant.id, node)}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
          <IconButton
            aria-label={`Copy ${activeStateLabel.toLowerCase()} code snippet`}
            size="sm"
            variant="glitch"
            onClick={handleCopy}
            disabled={!activeCode}
          >
            <Copy className="size-[var(--space-4)]" />
          </IconButton>
        </div>
      </div>
      <div className={componentPreviewFrameClassName}>{previewNode}</div>
      {activeState?.description ? (
        <p className="text-caption text-muted-foreground">{activeState.description}</p>
      ) : null}
      <Toast
        open={toastOpen && !!toastMessage}
        onOpenChange={setToastOpen}
        duration={2200}
        className="max-w-[22rem] bg-[hsl(var(--surface-2)/0.92)] p-[var(--space-4)]"
        showProgress
      >
        <p className="text-ui text-foreground">{toastMessage}</p>
      </Toast>
    </div>
  );
}

