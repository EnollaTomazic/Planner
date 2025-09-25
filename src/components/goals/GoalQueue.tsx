"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Trash2 } from "lucide-react";
import { shortDate } from "@/lib/date";
import { useCoarsePointer } from "@/lib/useCoarsePointer";
import { cn } from "@/lib/utils";

const MAX_GOAL_LABEL_LENGTH = 48;
const FALLBACK_GOAL_LABEL = "item";

function formatGoalLabel(text: string) {
  const normalized = text.trim().replace(/\s+/g, " ");
  const cleaned = normalized.length > 0 ? normalized : FALLBACK_GOAL_LABEL;

  if (cleaned.length <= MAX_GOAL_LABEL_LENGTH) {
    return cleaned;
  }

  const truncated = cleaned.slice(0, MAX_GOAL_LABEL_LENGTH - 1).trimEnd();
  return `${truncated}…`;
}

export type WaitItem = { id: string; text: string; createdAt: number };

interface GoalQueueProps {
  items: WaitItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

export default function GoalQueue({ items, onAdd, onRemove }: GoalQueueProps) {
  const [val, setVal] = React.useState("");
  const inputId = React.useId();
  const isCoarsePointer = useCoarsePointer();
  const revealOnInteractionClass = isCoarsePointer
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal("");
  }

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header
        title="Goal Queue"
        titleClassName="text-title font-semibold tracking-[-0.01em]"
      />
      <SectionCard.Body className="grid gap-[var(--space-6)]">
          <ul className="divide-y divide-border/10">
            {items.length === 0 ? (
              <li className="py-[var(--space-3)] text-ui font-medium text-muted-foreground">No queued goals</li>
            ) : (
              items.map((it) => {
                const created = new Date(it.createdAt);

                const goalLabel = formatGoalLabel(it.text);
                const deleteLabel = `Delete queued goal ${goalLabel}`;

                return (
                  <li key={it.id} className="group flex items-center gap-[var(--space-2)] py-[var(--space-3)]">
                    <span
                      className="h-[var(--space-2)] w-[var(--space-2)] rounded-full bg-foreground/40"
                      aria-hidden
                    />
                    <p className="flex-1 truncate text-ui font-medium">{it.text}</p>
                    <time
                      className={cn(
                        "text-label font-medium tracking-[0.02em] text-muted-foreground",
                        revealOnInteractionClass,
                      )}
                      dateTime={created.toISOString()}
                    >
                      {shortDate.format(created)}
                    </time>
                    <div className="flex items-center gap-[var(--space-1)] ml-[var(--space-2)]">
                      <IconButton
                        title={deleteLabel}
                        aria-label={deleteLabel}
                        onClick={() => onRemove(it.id)}
                        size="sm"
                        iconSize="sm"
                        variant="ghost"
                        className={revealOnInteractionClass}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <form onSubmit={submit} className="flex items-center gap-[var(--space-2)] pt-[var(--space-3)]">
            <span
              className="h-[var(--space-2)] w-[var(--space-2)] rounded-full bg-foreground/40"
              aria-hidden
            />
            <label className="sr-only" htmlFor={inputId}>
              Add to queue and press Enter
            </label>
            <Input
              id={inputId}
              className="flex-1 text-ui font-medium"
              height="sm"
              value={val}
              onChange={(e) => setVal(e.currentTarget.value)}
              placeholder="Add to queue and press Enter"
            />
          </form>
        </SectionCard.Body>
      </SectionCard>
    );
  }

