"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/input";
import IconButton from "@/components/ui/primitives/IconButton";
import { GripVertical, Trash2 } from "lucide-react";

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
    <div>
      <h2 className="mb-4 text-lg font-semibold">Goal Queue</h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] p-8 text-center text-sm text-[hsl(var(--foreground)/0.65)]">
          No queued goals
        </div>
      ) : (
        <ul>
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between py-3 border-t border-[hsl(var(--border)/0.15)]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--foreground)/0.65)]" aria-hidden />
                <p className="truncate text-sm text-[hsl(var(--foreground)/0.85)]">{it.text}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  title="Drag"
                  aria-label="Drag"
                  circleSize="sm"
                  iconSize="sm"
                  className="focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
                >
                  <GripVertical />
                </IconButton>
                <IconButton
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => onRemove(it.id)}
                  circleSize="sm"
                  iconSize="sm"
                  className="focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
                >
                  <Trash2 />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4">
        <Input
          tone="default"
          className="h-12 rounded-2xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.6)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.6)]"
          value={val}
          onChange={(e) => setVal(e.currentTarget.value)}
          placeholder="Add to queue…"
        />
      </form>
    </div>
  );
}

