"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Trash2 } from "lucide-react";
import { shortDate } from "@/lib/date";

export type WaitItem = { id: string; text: string; createdAt: number };

interface GoalQueueProps {
  items: WaitItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

export default function GoalQueue({ items, onAdd, onRemove }: GoalQueueProps) {
  const [val, setVal] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal("");
  }

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header title={<h2 className="text-title font-semibold tracking-[-0.01em]">Goal Queue</h2>} />
      <SectionCard.Body className="grid gap-6">
          <ul className="divide-y divide-border/10">
            {items.length === 0 ? (
              <li className="py-3 text-ui font-medium text-muted-foreground">No queued goals</li>
            ) : (
              items.map((it) => (
                <li key={it.id} className="group flex items-center gap-2 py-3">
                  <span className="h-2 w-2 rounded-full bg-foreground/40" aria-hidden />
                  <p className="flex-1 truncate text-ui font-medium">{it.text}</p>
                  <time
                    className="text-label font-medium tracking-[0.02em] text-muted-foreground opacity-0 group-hover:opacity-100"
                    dateTime={new Date(it.createdAt).toISOString()}
                  >
                    {shortDate.format(new Date(it.createdAt))}
                  </time>
                  <div className="flex items-center gap-1 ml-2">
                    <IconButton
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => onRemove(it.id)}
                      size="sm"
                      iconSize="sm"
                      variant="ring"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                </li>
              ))
            )}
          </ul>

          <form onSubmit={submit} className="flex items-center gap-2 pt-3">
            <span className="h-2 w-2 rounded-full bg-foreground/40" aria-hidden />
            <Input
              className="flex-1 h-9 text-ui font-medium"
              value={val}
              onChange={(e) => setVal(e.currentTarget.value)}
              placeholder="Add to queue and press Enter"
            />
          </form>
        </SectionCard.Body>
      </SectionCard>
    );
  }

