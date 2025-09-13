"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayTask } from "./plannerStore";

type Props = {
  task: DayTask;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
  onSelect: () => void;
  onAddImage: (url: string) => void;
  onRemoveImage: (url: string) => void;
};

export default function TaskRow({
  task,
  onToggle,
  onDelete,
  onEdit,
  onSelect,
  onAddImage,
  onRemoveImage,
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(task.title);
  const [imageUrl, setImageUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function start() {
    setEditing(true);
  }
  function commit() {
    const v = title.trim();
    setEditing(false);
    if (v && v !== task.title) onEdit(v);
  }
  function cancel() {
    setEditing(false);
    setTitle(task.title);
  }

  function addImage() {
    const v = imageUrl.trim();
    if (!v) return;
    onAddImage(v);
    setImageUrl("");
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
        <div className="shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
          <CheckCircle
            checked={task.done}
            onChange={() => {
              if (!editing) onToggle();
            }}
            aria-label="Toggle task done"
            size="sm"
          />
        </div>

        <div className="flex-1 min-w-0 px-1">
          {!editing ? (
            <button
              className="task-tile__text block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-card r-card-lg"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                start();
              }}
              aria-pressed={task.done}
              title="Click to toggle; double-click to edit"
            >
              <span
                className={cn(
                  "truncate break-words",
                  task.done && "line-through-soft",
                )}
              >
                {task.title}
              </span>
            </button>
          ) : (
            <Input
              name={`dc-rename-task-${task.id}`}
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
            size="sm"
            iconSize="xs"
            variant="ring"
          >
            <Pencil />
          </IconButton>
          <IconButton
            aria-label="Delete task"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            size="sm"
            iconSize="xs"
            variant="ring"
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>
      {task.images.length > 0 && (
        <ul className="mt-2 space-y-2">
          {task.images.map((url) => (
            <li key={url} className="flex items-center gap-2">
              <img
                src={url}
                alt={`Image for ${task.title}`}
                className="max-h-24 rounded-card r-card-md"
              />
              <IconButton
                aria-label="Remove image"
                title="Remove image"
                onClick={() => onRemoveImage(url)}
                size="sm"
                iconSize="xs"
                variant="ring"
              >
                <Trash2 />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addImage();
        }}
        className="mt-2"
      >
        <label htmlFor={`task-image-${task.id}`} className="sr-only">
          Add image URL
        </label>
        <Input
          id={`task-image-${task.id}`}
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </form>
    </li>
  );
}
