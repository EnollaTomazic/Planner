// src/components/team/JungleClears.tsx
"use client";
import "./style.css";

/**
 * JungleClears
 * - Top filter area uses <Hero> with pill search and count.
 * - Hint text sits inside the Hero body.
 * - Bucket cards are SectionCard-based with big time on the right.
 * - Two cards per row on md+.
 * - Titles and timers now use glitch-title + glitch-flicker + title-glow.
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import { usePersistentState, uid } from "@/lib/db";
import { isRecord, isStringArray } from "@/lib/validators";
import { Timer, Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { JUNGLE_ROWS, SPEED_HINT, type ClearSpeed } from "./data";

type JunglerRow = {
  id: string;
  champ: string;
  speed: ClearSpeed;
  type: string[];
  notes?: string;
};
const STORE_KEY = "team:jungle.clears.v1";
const SEEDS: JunglerRow[] = JUNGLE_ROWS.map((r) => {
  const row: JunglerRow = {
    id: uid("jg"),
    champ: r.champ,
    speed: r.speed,
    type: isStringArray(r.type) ? [...r.type] : [],
  };

  if (typeof r.notes === "string") {
    row.notes = r.notes;
  }

  return row;
});
const BUCKETS: ClearSpeed[] = ["Very Fast", "Fast", "Medium", "Slow"];
const SPEED_SET = new Set<ClearSpeed>(BUCKETS);
const NEEDS_PERSIST = Symbol("team:jungle.clears.needsPersist");
type NormalizedRows = JunglerRow[] & { [NEEDS_PERSIST]?: true };

function normalizeType(
  value: unknown,
): { value: string[]; mutated: boolean } {
  if (isStringArray(value)) {
    const trimmed = value
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const mutated =
      trimmed.length !== value.length ||
      trimmed.some((tag, index) => tag !== value[index]);
    return { value: trimmed, mutated };
  }

  if (typeof value === "string") {
    const trimmed = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    return { value: trimmed, mutated: true };
  }

  if (value === undefined) {
    return { value: [], mutated: true };
  }

  return { value: [], mutated: true };
}

function decodeRows(value: unknown): NormalizedRows | null {
  if (!Array.isArray(value)) return null;

  const next: JunglerRow[] = [];
  let assignedNewId = false;
  let mutated = false;

  for (const raw of value) {
    if (!isRecord(raw)) {
      mutated = true;
      continue;
    }

    const rawSpeed = raw.speed;
    let speed: ClearSpeed;
    if (typeof rawSpeed === "string" && SPEED_SET.has(rawSpeed as ClearSpeed)) {
      speed = rawSpeed as ClearSpeed;
    } else {
      speed = "Medium";
      mutated = true;
    }

    let champ: string;
    if (typeof raw.champ === "string") {
      champ = raw.champ;
    } else {
      champ = "";
      mutated = true;
    }

    const { value: type, mutated: typeMutated } = normalizeType(raw.type);
    if (typeMutated) {
      mutated = true;
    }

    let notes: string | undefined;
    if (typeof raw.notes === "string") {
      notes = raw.notes;
    } else {
      notes = undefined;
      if (raw.notes !== undefined) {
        mutated = true;
      }
    }

    let id: string;
    if (typeof raw.id === "string") {
      const trimmedId = raw.id.trim();
      if (trimmedId !== "") {
        id = trimmedId;
        if (trimmedId !== raw.id) {
          mutated = true;
        }
      } else {
        id = uid("jg");
        assignedNewId = true;
      }
    } else {
      id = uid("jg");
      assignedNewId = true;
    }

    const row: JunglerRow = { id, champ, speed, type };
    if (notes !== undefined) {
      row.notes = notes;
    }

    next.push(row);
  }

  const normalized = next as NormalizedRows;

  if (assignedNewId || mutated) {
    Object.defineProperty(normalized, NEEDS_PERSIST, {
      value: true,
      enumerable: false,
    });
  }

  return normalized;
}

function needsPersist(rows: JunglerRow[]): rows is NormalizedRows {
  return Boolean((rows as NormalizedRows)[NEEDS_PERSIST]);
}

const SPEED_PERSONA: Record<ClearSpeed, { tag: string; line: string }> = {
  "Very Fast": {
    tag: "Zoomies",
    line: "Turbo 3-camp pace. Invade timings and double-crab angles are on the table.",
  },
  Fast: {
    tag: "Tempo Bully",
    line: "You hit prio first. Fight on camps, trade up, and push the map.",
  },
  Medium: {
    tag: "Stable Path",
    line: "Play the map, not the stopwatch. Shadow lanes, contest second spawn.",
  },
  Slow: {
    tag: "Gank Goblin",
    line: "Skip races. Stack vision, create angles, flip lanes instead of timers.",
  },
};

const SPEED_TIME: Record<ClearSpeed, string> = {
  "Very Fast": "3:00",
  Fast: "3:05–3:20",
  Medium: "3:25–3:40",
  Slow: "≥3:45",
};

export type JungleClearsHandle = {
  addRow: (bucket: ClearSpeed) => void;
};

export default React.forwardRef<
  JungleClearsHandle,
  {
    editing: boolean;
    query: string;
    onCountChange?: (n: number) => void;
    onTargetBucketChange?: (bucket: ClearSpeed) => void;
  }
>(function JungleClears(
  { editing, query, onCountChange, onTargetBucketChange },
  ref,
) {
  const [items, setItems] = usePersistentState<JunglerRow[]>(STORE_KEY, SEEDS, {
    decode: decodeRows,
  });
  const [editingRow, setEditingRow] = React.useState<{
    id: string;
    champ: string;
    type: string;
    notes: string;
  } | null>(null);

  React.useEffect(() => {
    if (!needsPersist(items)) return;
    setItems((current) => current.map((row) => ({ ...row })));
  }, [items, setItems]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (!q) return true;
      const hay = [r.champ, ...r.type, r.notes ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, items]);

  React.useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered, onCountChange]);

  const exampleByBucket = React.useMemo(() => {
    const map = {} as Record<ClearSpeed, string>;
    for (const b of BUCKETS) {
      const row = items.find((r) => {
        const champ = r.champ.trim();
        return r.speed === b && champ !== "";
      });
      const champ = (row?.champ ?? "").trim();
      map[b] = champ === "" ? "-" : champ;
    }
    return map;
  }, [items]);

  const startEdit = React.useCallback(
    (r: JunglerRow) => {
      onTargetBucketChange?.(r.speed);
      setEditingRow({
        id: r.id,
        champ: r.champ,
        type: r.type.join(", "),
        notes: r.notes ?? "",
      });
    },
    [setEditingRow, onTargetBucketChange],
  );

  const cancelEdit = React.useCallback(() => {
    if (editingRow) {
      const existing = items.find((r) => r.id === editingRow.id);
      const champ = (existing?.champ ?? "").trim();
      if (existing && champ === "") {
        setItems((prev) => prev.filter((r) => r.id !== editingRow.id));
      }
    }
    setEditingRow(null);
  }, [editingRow, items, setEditingRow, setItems]);

  const saveEdit = React.useCallback(() => {
    if (!editingRow) return;
    const champInput = editingRow.champ.trim();
    const typeInput = editingRow.type;
    const notesInput = editingRow.notes.trim();

    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== editingRow.id) {
          return r;
        }

        const nextType = typeInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        const nextChamp = champInput !== "" ? champInput : r.champ;
        const nextNotes = notesInput === "" ? undefined : notesInput;

        return {
          ...r,
          champ: nextChamp,
          type: nextType,
          notes: nextNotes,
        };
      }),
    );
    setEditingRow(null);
  }, [editingRow, setItems, setEditingRow]);

  const deleteRow = React.useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((r) => r.id !== id));
    },
    [setItems],
  );

  const addRow = React.useCallback(
    (bucket: ClearSpeed) => {
      const newRow: JunglerRow = {
        id: uid("jg"),
        champ: "",
        speed: bucket,
        type: [],
        notes: "",
      };
      setItems((prev) => [...prev, newRow]);
      setEditingRow({ id: newRow.id, champ: "", type: "", notes: "" });
      onTargetBucketChange?.(bucket);
    },
    [setItems, setEditingRow, onTargetBucketChange],
  );

  React.useEffect(() => {
    if (!editing) cancelEdit();
  }, [editing, cancelEdit]);

  React.useImperativeHandle(ref, () => ({ addRow }), [addRow]);

  return (
    <div
      data-scope="team"
      className="grid gap-[var(--space-4)] sm:gap-[var(--space-6)]"
    >
      <div className="grid grid-cols-12 gap-[var(--space-6)]">
        {BUCKETS.map((bucket) => {
          const rowsAll = items.filter((r) => r.speed === bucket);
          const rows = filtered.filter((r) => r.speed === bucket);

          return (
            <SectionCard key={bucket} className="col-span-12 md:col-span-6">
              <SectionCard.Header
                sticky
                topClassName="top-[var(--header-stack)]"
                title={
                  <div className="flex items-center gap-[var(--space-2)]">
                    <Timer className="opacity-80" />
                    {/* Glitch title + glow */}
                    <span
                      className="glitch-title glitch-flicker title-glow text-title sm:text-title-lg md:text-title-lg font-semibold"
                      data-text={bucket}
                    >
                      {bucket}
                    </span>
                  </div>
                }
                actions={
                  // Big timer: same glitch treatment + glow
                  <span
                    className="glitch-title glitch-flicker title-glow font-mono leading-none text-title-lg sm:text-title-lg md:text-title-lg"
                    data-text={SPEED_TIME[bucket]}
                    aria-label="Expected first-clear timing"
                    title="Expected first-clear timing"
                  >
                    {SPEED_TIME[bucket]}
                  </span>
                }
              />
              <SectionCard.Body>
                <div className="mb-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="rounded-[var(--radius-full)] border border-border bg-card px-[var(--space-2)] py-[var(--space-1)] text-label tracking-wide uppercase">
                    {SPEED_PERSONA[bucket].tag}
                  </span>
                  <span className="text-ui text-muted-foreground">
                    {SPEED_HINT[bucket]}
                  </span>
                </div>

                {/* Example row (canonical pills) */}
                <div className="mb-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="text-muted-foreground text-ui">
                    Example:
                  </span>
                  <span className="pill pill-compact text-label">
                    {exampleByBucket[bucket]}
                  </span>
                  <span className="text-label text-muted-foreground">
                    ({rowsAll.length} total)
                  </span>
                </div>

                {editing && (
                  <div className="mb-[var(--space-2)] flex justify-end">
                    <IconButton
                      size="sm"
                      iconSize="xs"
                      aria-label="Add row"
                      onClick={() => addRow(bucket)}
                      variant="primary"
                    >
                      <Plus />
                    </IconButton>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-ui">
                    <caption className="sr-only">
                      {bucket} junglers with types and notes
                    </caption>
                    <thead className="text-left text-muted-foreground">
                      <tr className="h-9">
                        <th scope="col" className="pr-[var(--space-3)]">
                          Champion
                        </th>
                        <th scope="col" className="pr-[var(--space-3)]">
                          Type
                        </th>
                        <th scope="col" className="pr-[var(--space-3)]">
                          Notes
                        </th>
                        <th scope="col" className="w-12 pr-[var(--space-3)]">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r: JunglerRow) =>
                        editingRow?.id === r.id ? (
                          <tr
                            key={r.id}
                            className="h-10 border-t border-border/40 hover:bg-card/45"
                          >
                            <td className="py-[var(--space-2)] pr-[var(--space-3)] font-medium">
                              <Input
                                aria-label="Champion"
                                name="champion"
                                value={editingRow.champ}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    champ: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <Input
                                aria-label="Type"
                                placeholder="AD, Assassin"
                                name="type"
                                value={editingRow.type}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    type: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <Input
                                aria-label="Notes"
                                name="notes"
                                value={editingRow.notes}
                                onChange={(e) =>
                                  setEditingRow({
                                    ...editingRow,
                                    notes: e.currentTarget.value,
                                  })
                                }
                              />
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <div className="flex gap-[var(--space-1)]">
                                <IconButton
                                  size="sm"
                                  iconSize="xs"
                                  aria-label="Save"
                                  onClick={saveEdit}
                                >
                                  <Check />
                                </IconButton>
                                <IconButton
                                  size="sm"
                                  iconSize="xs"
                                  tone="danger"
                                  aria-label="Cancel"
                                  onClick={cancelEdit}
                                >
                                  <X />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={r.id}
                            className="h-10 border-t border-border/40 hover:bg-card/45"
                          >
                            <td className="py-[var(--space-2)] pr-[var(--space-3)] font-medium">{r.champ}</td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              <div className="flex flex-wrap gap-[var(--space-2)]">
                                {r.type.map((t) => (
                                  <span
                                    key={t}
                                    className="pill pill-compact text-label"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">{r.notes ?? "-"}</td>
                            <td className="py-[var(--space-2)] pr-[var(--space-3)]">
                              {editing && (
                                <div className="flex gap-[var(--space-1)]">
                                  <IconButton
                                    size="sm"
                                    iconSize="xs"
                                    aria-label="Edit"
                                    onClick={() => startEdit(r)}
                                  >
                                    <Pencil />
                                  </IconButton>
                                  <IconButton
                                    size="sm"
                                    iconSize="xs"
                                    tone="danger"
                                    aria-label="Delete"
                                    onClick={() => deleteRow(r.id)}
                                  >
                                    <Trash2 />
                                  </IconButton>
                                </div>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard.Body>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
});
