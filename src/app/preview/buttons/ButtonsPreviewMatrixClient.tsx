"use client";

import * as React from "react";

import { galleryPayload } from "@/components/gallery";
import { ThemeMatrixPreview } from "@/components/prompts/ComponentsView";
import type { GallerySerializableEntry } from "@/components/gallery/registry";

const BUTTON_ENTRY_IDS = ["button", "icon-button", "segmented-button"] as const;

type ButtonEntryId = (typeof BUTTON_ENTRY_IDS)[number];

export type PreviewStateId =
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
] as const;

const REQUIRED_STATE_SET = new Set<PreviewStateId>(
  BUTTON_PREVIEW_REQUIRED_STATE_IDS,
);

const SEGMENTED_STATE_ALIAS: Record<string, PreviewStateId | undefined> = {
  default: "default",
  hover: "hover",
  active: "active",
  "focus-visible": "focus",
  disabled: "disabled",
  "disabled-link": "disabled",
  loading: "loading",
};

interface ButtonPreviewSpec {
  readonly entry: GallerySerializableEntry;
}

function findEntry(entryId: ButtonEntryId): GallerySerializableEntry | null {
  for (const section of galleryPayload.sections) {
    const match = section.entries.find((candidate) => candidate.id === entryId);
    if (match) {
      return match;
    }
  }
  return null;
}

function normalizeStateId(
  entryId: ButtonEntryId,
  stateId: string,
): PreviewStateId | null {
  if (entryId === "segmented-button") {
    return SEGMENTED_STATE_ALIAS[stateId] ?? null;
  }
  if (REQUIRED_STATE_SET.has(stateId as PreviewStateId)) {
    return stateId as PreviewStateId;
  }
  return null;
}

function collectPreviewStates(entryId: ButtonEntryId): PreviewStateId[] {
  const entry = findEntry(entryId);
  if (!entry) {
    return [];
  }
  const states = new Set<PreviewStateId>();
  for (const state of entry.states ?? []) {
    const normalized = normalizeStateId(entryId, state.id);
    if (normalized) {
      states.add(normalized);
    }
  }
  return [...states];
}

export const BUTTON_CONTROL_STATE_IDS: Record<
  ButtonEntryId,
  readonly PreviewStateId[]
> = {
  button: collectPreviewStates("button"),
  "icon-button": collectPreviewStates("icon-button"),
  "segmented-button": collectPreviewStates("segmented-button"),
};

const BUTTON_PREVIEW_SPECS: ButtonPreviewSpec[] = BUTTON_ENTRY_IDS.flatMap(
  (entryId) => {
    const entry = findEntry(entryId);
    if (!entry) {
      return [] as const;
    }
    return [{ entry }] as const;
  },
);

export default function ButtonsPreviewMatrixClient(): JSX.Element {
  return (
    <div className="space-y-[var(--space-6)]">
      {BUTTON_PREVIEW_SPECS.map(({ entry }) => {
        const headingId = `buttons-preview-${entry.id}`;
        const descriptionId = `${headingId}-description`;

        return (
          <section
            key={entry.id}
            aria-labelledby={headingId}
            aria-describedby={entry.description ? descriptionId : undefined}
            className="space-y-[var(--space-3)]"
          >
            <header className="space-y-[var(--space-1)]">
              <h2
                id={headingId}
                className="text-subhead font-semibold tracking-[-0.01em]"
              >
                {entry.name}
              </h2>
              {entry.description ? (
                <p
                  id={descriptionId}
                  className="text-label text-muted-foreground"
                >
                  {entry.description}
                </p>
              ) : null}
            </header>
            <ThemeMatrixPreview
              entryId={`${headingId}-theme-matrix`}
              previewId={entry.preview.id}
            />
          </section>
        );
      })}
    </div>
  );
}
