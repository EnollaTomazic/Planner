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
    <div className="font-mono">
      <h2 className="mb-4 text-lg font-semibold uppercase tracking-tight">Goal Queue</h2>
      {items.length === 0 ? (
        <div className="scanlines rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-8 text-center text-sm text-[hsl(var(--fg-muted))]">
          No queued goals
        </div>
      ) : (
        <ul className="divide-y divide-[hsl(var(--border)/0.15)] border-t border-[hsl(var(--border)/0.15)]">
          {items.map((it) => (
            <li
              key={it.id}
              className="group flex h-12 items-center justify-between px-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--fg)/0.65)]" aria-hidden />
                <p className="truncate text-sm text-[hsl(var(--fg)/0.85)]">{it.text}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <IconButton
                  title="Drag"
                  aria-label="Drag"
                  circleSize="sm"
                  iconSize="sm"
                  className="rounded-xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  <GripVertical />
                </IconButton>
                <IconButton
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => onRemove(it.id)}
                  circleSize="sm"
                  iconSize="sm"
                  className="rounded-xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  <Trash2 />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-6">
        <Input
          className="h-12 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] placeholder:text-[hsl(var(--fg-muted))]"
          value={val}
          onChange={(e) => setVal(e.currentTarget.value)}
          placeholder="Add to queue…"
        />
      </form>
    </div>
  );
}

