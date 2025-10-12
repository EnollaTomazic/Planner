// src/components/team/CheatSheet.tsx
"use client";
import "./style.css";

/**
 * CheatSheet — edit per card with persistent controls, write-through persistence.
 * Titles use Lavender-Glitch (glitch-title + glitch-flicker + title-glow).
 * Lane labels (TOP/JUNGLE/MID/BOT/SUPPORT) also flicker via team scope.
 * Scoped with data-scope="team" to avoid global glitch leakage.
 */

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Pencil, Check } from "lucide-react";
import { ROLES } from "./constants";
import { DEFAULT_SHEET } from "./data";
import {
  type Archetype,
  type LaneExamples,
  decodeCheatSheet as decodeCheatSheetModel,
  ensureExamples as ensureExamplesModel,
} from "./cheatSheet.model";
import {
  Label,
  TitleEdit,
  ParagraphEdit,
  BulletListEdit,
} from "./CheatSheetEditors";
import { ChampListEditor } from "./ChampListEditor";

export { decodeCheatSheet, ensureExamples } from "./cheatSheet.model";
export type { Archetype, LaneExamples } from "./cheatSheet.model";

export type CheatSheetProps = {
  className?: string;
  dense?: boolean;
  data?: Archetype[];
  query?: string;
  editing?: boolean;
};

/* ───────────── main component ───────────── */

export function CheatSheet({
  className = "",
  dense = false,
  data = DEFAULT_SHEET,
  query = "",
  editing = false,
}: CheatSheetProps) {
  const [sheet, setSheet] = usePersistentState<Archetype[]>(
    "team:cheatsheet.v2",
    data,
    {
      decode: decodeCheatSheetModel,
    },
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let needsUpdate = false;
    const next = sheet.map((arc) => {
      const [safeExamples, changed] = ensureExamplesModel(arc.examples);
      if (!changed) return arc;
      needsUpdate = true;
      return {
        ...arc,
        examples: safeExamples,
      };
    });

    if (needsUpdate) {
      setSheet(next);
    }
  }, [sheet, setSheet]);

  React.useEffect(() => {
    if (!editing) setEditingId(null);
  }, [editing]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sheet;
    return sheet.filter((a) => {
      const hay = [
        a.title,
        a.description,
        ...(a.wins ?? []),
        ...(a.struggles ?? []),
        ...(a.tips ?? []),
        ...Object.values(a.examples ?? {}).flat(),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sheet, query]);

  const patchArc = React.useCallback(
    (id: string, partial: Partial<Archetype>) => {
      setSheet((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;

          const base = { ...a, ...partial };
          const mergedExamples =
            "examples" in partial
              ? {
                  ...(a.examples ?? {}),
                  ...(partial.examples ?? {}),
                }
              : base.examples;

          const [safeExamples, changed] = ensureExamplesModel(mergedExamples);

          if ("examples" in partial || changed) {
            base.examples = safeExamples;
          }

          return base;
        }),
      );
    },
    [setSheet],
  );

  return (
    <section
      data-scope="team"
      className={[
        "grid gap-[var(--space-4)] sm:gap-[var(--space-6)] md:grid-cols-2 xl:grid-cols-3",
        className,
      ].join(" ")}
    >
      {filtered.map((a) => {
        const isEditing = editing && editingId === a.id;

        return (
          <article
            key={a.id}
            className={[
              "group glitch-card rounded-card r-card-lg relative h-full",
              dense
                ? "p-[var(--space-4)]"
                : "p-[var(--space-5)]",
            ].join(" ")}
          >
            {/* Top-right edit/save control */}
            {editing && (
              <div className="absolute right-[var(--space-2)] top-[var(--space-2)] z-10 flex items-center gap-[var(--space-1)] opacity-100 pointer-events-auto">
                {!isEditing ? (
                  <IconButton
                    title="Edit"
                    aria-label="Edit"
                    size="sm"
                    onClick={() => setEditingId(a.id)}
                  >
                    <Pencil />
                  </IconButton>
                ) : (
                  <IconButton
                    title="Save"
                    aria-label="Save"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <Check />
                  </IconButton>
                )}
              </div>
            )}

            {/* Neon spine */}
            <span aria-hidden className="glitch-rail" />

            {/* Title + description */}
            <header className="mb-[var(--space-3)]">
              <TitleEdit
                value={a.title}
                editing={isEditing}
                onChange={(v) => patchArc(a.id, { title: v })}
              />
              <ParagraphEdit
                value={a.description}
                editing={isEditing}
                onChange={(v) => patchArc(a.id, { description: v })}
              />
            </header>

            {/* Body */}
            <div className="grid grid-cols-1 gap-[var(--space-4)]">
              <div>
                <Label>Wins when</Label>
                <BulletListEdit
                  items={a.wins}
                  onChange={(v) => patchArc(a.id, { wins: v })}
                  editing={isEditing}
                  ariaLabel="Wins when"
                />
              </div>

              {a.struggles?.length || isEditing ? (
                <div>
                  <Label>Struggles vs</Label>
                  <BulletListEdit
                    items={a.struggles ?? []}
                    onChange={(v) => patchArc(a.id, { struggles: v })}
                    editing={isEditing}
                    ariaLabel="Struggles vs"
                  />
                </div>
              ) : null}

              {a.tips?.length || isEditing ? (
                <div>
                  <Label>Tips</Label>
                  <BulletListEdit
                    items={a.tips ?? []}
                    onChange={(v) => patchArc(a.id, { tips: v })}
                    editing={isEditing}
                    ariaLabel="Tips"
                  />
                </div>
              ) : null}

              {/* Examples with fixed role column */}
              <div>
                <Label>Examples</Label>
                <div className="mt-[var(--space-2)] space-y-[var(--space-2)]">
                  {ROLES.map(
                    (role) => {
                      const champs = a.examples?.[role] ?? [];
                      const setChamps = (list: string[]) =>
                        patchArc(a.id, {
                          examples: { [role]: list } as LaneExamples,
                        });
                      const showRow = champs.length || isEditing;
                      if (!showRow) return null;

                      return (
                        <div
                          key={role}
                          className="grid grid-cols-[calc(var(--spacing-8)+var(--spacing-5))_1fr] items-start gap-x-[var(--space-3)]"
                        >
                          <div
                            className="glitch-title glitch-flicker text-label font-medium tracking-[0.02em] text-muted-foreground pt-[var(--space-1)]"
                            data-text={role}
                          >
                            {role}
                          </div>
                          <ChampListEditor
                            list={champs}
                            onChange={setChamps}
                            editing={isEditing}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
