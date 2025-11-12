// src/components/team/JungleClears.tsx
"use client";

/**
 * JungleClears
 * - Top filter area uses <Hero> with pill search and count.
 * - Hint text sits inside the Hero body.
 * - Bucket rows render as clean cards with horizontal champion strips.
 * - Cards highlight target timings without glitch or heavy noise treatments.
 */

import * as React from "react";
import { AIExplainTooltip } from "@/components/ui/ai/AIExplainTooltip";
import { AvatarFrame } from "@/components/ui/primitives/AvatarFrame";
import { Card, CardContent } from "@/components/ui/primitives/Card";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Input } from "@/components/ui/primitives/Input";
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
type EditingDraft = {
  id: string;
  champ: string;
  type: string;
  notes: string;
};

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

type BucketSectionProps = {
  bucket: ClearSpeed;
  visibleRows: readonly JunglerRow[];
  editing: boolean;
  editingRow: EditingDraft | null;
  exampleChampion: string;
  totalCount: number;
  onAddRow: (bucket: ClearSpeed) => void;
  onStartEdit: (row: JunglerRow) => void;
  onDeleteRow: (id: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  setEditingRow: React.Dispatch<React.SetStateAction<EditingDraft | null>>;
};

type EditingRowProps = {
  draft: EditingDraft;
  setDraft: React.Dispatch<React.SetStateAction<EditingDraft | null>>;
  onSave: () => void;
  onCancel: () => void;
};

type ChampionItemProps = {
  row: JunglerRow;
  editing: boolean;
  onStartEdit: (row: JunglerRow) => void;
  onDeleteRow: (id: string) => void;
};

const EditingRow = React.memo(function EditingRow({
  draft,
  setDraft,
  onSave,
  onCancel,
}: EditingRowProps) {
  const updateDraft = React.useCallback(
    (field: "champ" | "type" | "notes") =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        setDraft((prev) => {
          if (!prev || prev.id !== draft.id) {
            return prev;
          }
          return { ...prev, [field]: value };
        });
      },
    [setDraft, draft.id],
  );

  return (
    <div className="flex min-w-[18rem] max-w-[20rem] flex-col gap-[var(--space-2)] rounded-lg border border-dashed border-primary/40 bg-surface/90 p-[var(--space-3)]">
      <Input
        aria-label="Champion"
        name="champion"
        placeholder="Champion name"
        value={draft.champ}
        onChange={updateDraft("champ")}
      />
      <Input
        aria-label="Type"
        placeholder="AD, Assassin"
        name="type"
        value={draft.type}
        onChange={updateDraft("type")}
      />
      <Input
        aria-label="Notes"
        name="notes"
        placeholder="Path notes"
        value={draft.notes}
        onChange={updateDraft("notes")}
      />
      <div className="flex justify-end gap-[var(--space-1)]">
        <IconButton
          size="sm"
          iconSize="xs"
          aria-label="Save"
          onClick={onSave}
        >
          <Check />
        </IconButton>
        <IconButton
          size="sm"
          iconSize="xs"
          tone="danger"
          aria-label="Cancel"
          onClick={onCancel}
        >
          <X />
        </IconButton>
      </div>
    </div>
  );
});

const getInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const ChampionItem = React.memo(function ChampionItem({
  row,
  editing,
  onStartEdit,
  onDeleteRow,
}: ChampionItemProps) {
  const initials = React.useMemo(() => getInitials(row.champ), [row.champ]);

  return (
    <figure
      data-testid="jungle-card"
      className="flex min-w-[8rem] max-w-[10rem] flex-col items-center gap-[var(--space-2)] rounded-lg border border-border/60 bg-surface/90 p-[var(--space-3)] text-center"
      title={row.notes ?? undefined}
    >
      <AvatarFrame
        frame={false}
        size="sm"
        className="bg-muted text-muted-foreground"
        surfaceClassName="bg-muted"
      >
        <span className="text-sm font-semibold uppercase text-foreground">{initials}</span>
      </AvatarFrame>
      <figcaption className="flex w-full flex-col items-center gap-[var(--space-1)]">
        <span className="text-sm font-medium text-foreground">{row.champ}</span>
        {row.type.length > 0 ? (
          <span className="text-label uppercase tracking-[0.08em] text-muted-foreground">
            {row.type.join(" • ")}
          </span>
        ) : null}
      </figcaption>
      {editing ? (
        <div className="flex gap-[var(--space-1)]">
          <IconButton
            size="sm"
            iconSize="xs"
            aria-label={`Edit ${row.champ}`}
            onClick={() => onStartEdit(row)}
          >
            <Pencil />
          </IconButton>
          <IconButton
            size="sm"
            iconSize="xs"
            tone="danger"
            aria-label={`Delete ${row.champ}`}
            onClick={() => onDeleteRow(row.id)}
          >
            <Trash2 />
          </IconButton>
        </div>
      ) : null}
    </figure>
  );
});

const BucketSection = React.memo(function BucketSection({
  bucket,
  visibleRows,
  editing,
  editingRow,
  exampleChampion,
  totalCount,
  onAddRow,
  onStartEdit,
  onDeleteRow,
  onSaveEdit,
  onCancelEdit,
  setEditingRow,
}: BucketSectionProps) {
  const handleAddRow = React.useCallback(() => {
    onAddRow(bucket);
  }, [onAddRow, bucket]);

  return (
    <li className="flex flex-col gap-[var(--space-3)] py-[var(--space-4)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
        <div className="flex min-w-0 items-center gap-[var(--space-3)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Timer className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
            <p className="text-title-sm font-semibold text-foreground">{bucket}</p>
            <div className="flex flex-wrap items-center gap-[var(--space-2)] text-xs text-muted-foreground">
              <span>{SPEED_TIME[bucket]} target</span>
              <span aria-hidden className="text-muted-foreground/60">
                •
              </span>
              <AIExplainTooltip
                triggerLabel={SPEED_PERSONA[bucket].tag}
                explanation={SPEED_PERSONA[bucket].line}
                tone="neutral"
              />
            </div>
            <div className="flex flex-wrap items-center gap-[var(--space-2)] text-xs text-muted-foreground">
              <span>Example: {exampleChampion}</span>
              <span aria-hidden className="text-muted-foreground/60">
                •
              </span>
              <span>{totalCount} tracked</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[var(--space-2)]">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Champions
          </span>
          {editing && (
            <IconButton
              size="sm"
              iconSize="xs"
              aria-label={`Add champion to ${bucket}`}
              onClick={handleAddRow}
            >
              <Plus />
            </IconButton>
          )}
        </div>
      </div>
      <div className="flex gap-[var(--space-3)] overflow-x-auto pb-[var(--space-1)]">
        {visibleRows.length === 0 ? (
          <div className="flex min-h-[var(--space-8)] min-w-[16rem] items-center justify-center rounded-lg border border-dashed border-border/60 bg-surface/90 px-[var(--space-3)] py-[var(--space-4)] text-sm text-muted-foreground">
            {editing ? "Add a champion to get started" : "No champions yet"}
          </div>
        ) : (
          visibleRows.map((row) =>
            editingRow?.id === row.id ? (
              <EditingRow
                key={row.id}
                draft={editingRow}
                setDraft={setEditingRow}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : (
              <ChampionItem
                key={row.id}
                row={row}
                editing={editing}
                onStartEdit={onStartEdit}
                onDeleteRow={onDeleteRow}
              />
            ),
          )
        )}
      </div>
    </li>
  );
});

export type JungleClearsHandle = {
  addRow: (bucket: ClearSpeed) => void;
};

export const JungleClears = React.forwardRef<
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
  const [editingRow, setEditingRow] = React.useState<EditingDraft | null>(null);

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

  const rowsByBucket = React.useMemo(() => {
    const bucketMap: Record<ClearSpeed, JunglerRow[]> = {
      "Very Fast": [],
      Fast: [],
      Medium: [],
      Slow: [],
    };
    for (const row of items) {
      bucketMap[row.speed].push(row);
    }
    return bucketMap;
  }, [items]);

  const filteredByBucket = React.useMemo(() => {
    const bucketMap: Record<ClearSpeed, JunglerRow[]> = {
      "Very Fast": [],
      Fast: [],
      Medium: [],
      Slow: [],
    };
    for (const row of filtered) {
      bucketMap[row.speed].push(row);
    }
    return bucketMap;
  }, [filtered]);

  React.useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered, onCountChange]);

  const exampleByBucket = React.useMemo(() => {
    const map = {} as Record<ClearSpeed, string>;
    for (const b of BUCKETS) {
      const row = rowsByBucket[b].find((r) => r.champ.trim() !== "");
      const champ = (row?.champ ?? "").trim();
      map[b] = champ === "" ? "-" : champ;
    }
    return map;
  }, [rowsByBucket]);

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
    <Card depth="base" className="p-0">
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {BUCKETS.map((bucket) => (
            <BucketSection
              key={bucket}
              bucket={bucket}
              visibleRows={filteredByBucket[bucket]}
              editing={editing}
              editingRow={editingRow}
              exampleChampion={exampleByBucket[bucket]}
              totalCount={rowsByBucket[bucket].length}
              onAddRow={addRow}
              onStartEdit={startEdit}
              onDeleteRow={deleteRow}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              setEditingRow={setEditingRow}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
})
