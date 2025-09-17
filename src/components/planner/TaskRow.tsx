"use client";

import * as React from "react";
import Image from "next/image";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useAutoFocus from "@/lib/useAutoFocus";
import { spacingTokens } from "@/lib/tokens";
import type { DayTask } from "./plannerStore";

const taskImageSpacingToken = 7;
const taskImageSize = spacingTokens[taskImageSpacingToken - 1];
const taskImageCssValue = `var(--space-${taskImageSpacingToken})` as const;
const layoutClasses =
  "[overflow:visible] grid min-h-[var(--space-7)] min-w-0 grid-cols-[auto,1fr,auto] items-center gap-[var(--space-4)] pl-[var(--space-4)] pr-[var(--space-2)] py-[var(--space-2)]";

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
  const [hasFocusWithin, setHasFocusWithin] = React.useState(false);

  useAutoFocus({ ref: inputRef, when: editing });

  const handleFocusWithin = React.useCallback(() => {
    setHasFocusWithin(true);
  }, []);

  const handleBlurWithin = React.useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (!next || !event.currentTarget.contains(next)) {
        setHasFocusWithin(false);
      }
    },
    [],
  );

  const handleRowClick = React.useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleRowKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.target !== event.currentTarget) return;

      if (event.key === "Enter") {
        event.preventDefault();
        onSelect();
      }

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
      }
    },
    [onSelect],
  );

  const handleRowKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.target !== event.currentTarget) return;

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

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
        className="relative"
        onFocusCapture={handleFocusWithin}
        onBlurCapture={handleBlurWithin}
      >
        <button
          type="button"
          aria-label={`Select task ${task.title}`}
          onClick={handleRowClick}
          onKeyDown={handleRowKeyDown}
          onKeyUp={handleRowKeyUp}
          className={cn(
            "absolute inset-0 w-full cursor-pointer rounded-card r-card-lg border transition-colors",
            "bg-card/55 hover:bg-card/70 focus-visible:bg-card/70 active:bg-card/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            "data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-ring",
          )}
          data-focus-within={hasFocusWithin ? "true" : undefined}
        >
          <span className="sr-only">{`Select task ${task.title}`}</span>
        </button>

        <div
          className={cn(
            "pointer-events-none relative z-[1]",
            layoutClasses,
          )}
        >
          <div
            className="pointer-events-auto shrink-0 ml-[var(--space-1)]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <CheckCircle
              checked={task.done}
              onChange={() => {
                if (!editing) onToggle();
              }}
              aria-label={`Toggle ${task.title} done`}
              size="sm"
            />
          </div>

          <div className="pointer-events-auto flex-1 min-w-0 px-[var(--space-1)]">
            {!editing ? (
              <button
                type="button"
                className="task-tile__text block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-card r-card-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  start();
                }}
                onPointerDown={(e) => e.stopPropagation()}
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
              "pointer-events-auto flex shrink-0 items-center gap-[var(--space-2)]",
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
              onPointerDown={(e) => e.stopPropagation()}
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
              onPointerDown={(e) => e.stopPropagation()}
              size="sm"
              iconSize="xs"
              variant="ring"
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>
      {task.images.length > 0 && (
        <ul className="mt-[var(--space-2)] space-y-[var(--space-2)]">
          {task.images.map((url) => (
            <li key={url} className="flex items-center gap-[var(--space-2)]">
              <Image
                src={url}
                alt={`Task image for ${task.title}`}
                width={taskImageSize}
                height={taskImageSize}
                className="rounded-card r-card-md object-cover"
                style={{
                  maxHeight: taskImageCssValue,
                  height: taskImageCssValue,
                  width: taskImageCssValue,
                }}
                unoptimized
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
        className="mt-[var(--space-2)]"
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
