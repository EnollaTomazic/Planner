"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = { id: string; text: string; done: boolean; projectId?: string };

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  onSelect: () => void;
};

export default function TaskRow({
  task,
  onToggle,
  onDelete,
  onEdit,
  onSelect,
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(task.text);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function start() {
    setEditing(true);
  }
  function commit() {
    const v = text.trim();
    setEditing(false);
    if (v && v !== task.text) onEdit(v);
  }
  function cancel() {
    setEditing(false);
    setText(task.text);
  }

  return (
    <li className="group">
      <div
        className={cn(
          "relative [overflow:visible] grid min-h-12 min-w-0 grid-cols-[auto,1fr,auto] items-center gap-4 rounded-card r-card-lg border pl-4 pr-2 py-2",
          "bg-card/55 hover:bg-card/70",
          "focus-within:ring-2 focus-within:ring-ring",
        )}
        onClick={onSelect}
      >
        <div className="shrink-0 ml-1">
          <CheckCircle
            checked={task.done}
            onChange={() => !editing && onToggle()}
            aria-label="Toggle task done"
            size="md"
          />
        </div>

        <div className="flex-1 min-w-0 px-1">
          {!editing ? (
            <button
              className="task-tile__text block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-card r-card-lg"
              onClick={onToggle}
              onDoubleClick={start}
              aria-pressed={task.done}
              title="Click to toggle; double-click to edit"
            >
              <span
                className={cn(
                  "truncate break-words",
                  task.done && "line-through-soft",
                )}
              >
                {task.text}
              </span>
            </button>
          ) : (
            <Input
              name={`dc-rename-task-${task.id}`}
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
              aria-label="Rename task"
            />
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2",
            editing
              ? "opacity-0 pointer-events-none"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
          )}
        >
          <IconButton
            aria-label="Edit task"
            title="Edit"
            onClick={start}
            size="sm"
            iconSize="xs"
            variant="ring"
          >
            <Pencil />
          </IconButton>
          <IconButton
            aria-label="Delete task"
            title="Delete"
            onClick={onDelete}
            size="sm"
            iconSize="xs"
            variant="ring"
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>
    </li>
  );
}
