"use client";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/input";
import IconButton from "@/components/ui/primitives/IconButton";
import { ArrowUpRight, Trash2 } from "lucide-react";

export type WaitItem = { id: string; text: string; createdAt: number };

interface GoalQueueProps {
  items: WaitItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onPromote: (item: WaitItem) => void;
}

export default function GoalQueue({ items, onAdd, onRemove, onPromote }: GoalQueueProps) {
  const [val, setVal] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal("");
  }

  return (
    <SectionCard>
      <SectionCard.Header title={<h2 className="text-lg font-semibold">Goal Queue</h2>} />
      <SectionCard.Body className="grid gap-6">
        <ul className="divide-y divide-white/7">
          {items.length === 0 ? (
            <li className="py-2 text-sm text-white/60">No queued goals</li>
          ) : (
            items.map((it) => (
              <li key={it.id} className="group flex items-center gap-2 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
                <p className="flex-1 truncate text-sm">{it.text}</p>
                <time
                  className="text-xs text-white/60 opacity-0 group-hover:opacity-100"
                  dateTime={new Date(it.createdAt).toISOString()}
                >
                  {new Date(it.createdAt).toLocaleDateString()}
                </time>
                <div className="flex items-center gap-1 ml-2">
                  <IconButton
                    title="Promote"
                    aria-label="Promote"
                    onClick={() => onPromote(it)}
                    circleSize="sm"
                    iconSize="sm"
                    variant="ring"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <ArrowUpRight />
                  </IconButton>
                  <IconButton
                    title="Delete"
                    aria-label="Delete"
                    onClick={() => onRemove(it.id)}
                    circleSize="sm"
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

        <form onSubmit={submit} className="flex items-center gap-2 pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
          <Input
            tone="default"
            className="flex-1 h-9 text-sm focus:ring-2 focus:ring-purple-400/60"
            value={val}
            onChange={(e) => setVal(e.currentTarget.value)}
            placeholder="Add to queue and press Enter"
          />
        </form>
      </SectionCard.Body>
    </SectionCard>
  );
}

