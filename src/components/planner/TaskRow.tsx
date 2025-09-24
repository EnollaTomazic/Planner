"use client";

import * as React from "react";
import Image from "next/image";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useAutoFocus from "@/lib/useAutoFocus";
import { spacingTokens } from "@/lib/tokens";
import { uid } from "@/lib/db";
import type { DayTask } from "./plannerTypes";

const taskImageSpacingToken = 7;
const taskImageSize = spacingTokens[taskImageSpacingToken - 1];
const taskImageCssValue = `var(--space-${taskImageSpacingToken})` as const;
const layoutClasses =
  "[overflow:visible] grid min-h-[var(--space-7)] min-w-0 grid-cols-[auto,1fr,auto] items-center gap-[var(--space-4)] pl-[var(--space-4)] pr-[var(--space-2)] py-[var(--space-2)]";
const TASK_ROW_GUARD_SELECTOR = "[data-task-row-guard='true']";

type Props = {
  task: DayTask;
  toggleTask: () => void;
  deleteTask: () => void;
  renameTask: (title: string) => void;
  selectTask: () => void;
  addImage: (url: string) => void;
  removeImage: (url: string, index: number) => void;
};

export default function TaskRow({
  task,
  toggleTask,
  deleteTask,
  renameTask,
  selectTask,
  addImage,
  removeImage,
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(task.title);
  const [imageUrl, setImageUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [hasFocusWithin, setHasFocusWithin] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const trimmedImageUrl = imageUrl.trim();
  const canAttachImage = trimmedImageUrl.length > 0;
  const trimmedTaskTitle = task.title.trim();
  const accessibleTaskTitle = trimmedTaskTitle || "Untitled task";
  const renameTaskLabel = `Rename task ${accessibleTaskTitle}`;

  const imageEntriesRef = React.useRef<Array<{ url: string; id: string }>>([]);
  const imageEntries = React.useMemo(() => {
    const previousEntries = imageEntriesRef.current;
    const used = new Set<number>();
    const nextEntries: Array<{ url: string; id: string }> = [];

    for (const url of task.images) {
      let matchIndex = -1;
      for (let index = 0; index < previousEntries.length; index += 1) {
        if (used.has(index)) continue;
        if (previousEntries[index]?.url === url) {
          matchIndex = index;
          break;
        }
      }

      if (matchIndex >= 0) {
        used.add(matchIndex);
        nextEntries.push(previousEntries[matchIndex]!);
      } else {
        nextEntries.push({ url, id: `${task.id}-image-${uid()}` });
      }
    }

    imageEntriesRef.current = nextEntries;
    return nextEntries;
  }, [task.id, task.images]);

  const validateImageUrl = React.useCallback((value: string) => {
    if (!value) {
      return "Enter an image URL.";
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") {
        return "Image URL must start with https.";
      }
    } catch {
      return "Enter a valid image URL.";
    }

    return null;
  }, []);

  useAutoFocus({ ref: inputRef, when: editing });

  React.useEffect(() => {
    if (!editing) {
      setTitle(task.title);
    }
  }, [editing, task.title]);

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

  const handleRowClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (
        event.target instanceof Element &&
        event.target.closest(TASK_ROW_GUARD_SELECTOR)
      ) {
        return;
      }
      selectTask();
    },
    [selectTask],
  );

  const handleRowKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.target !== event.currentTarget) return;

      if (event.key === "Enter") {
        event.preventDefault();
        selectTask();
      }

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
      }
    },
    [selectTask],
  );

  const handleRowKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.target !== event.currentTarget) return;

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        selectTask();
      }
    },
    [selectTask],
  );

  function start() {
    setEditing(true);
  }
  function commit() {
    const v = title.trim();
    setEditing(false);
    if (!v) {
      setTitle(task.title);
      return;
    }
    if (v !== task.title) renameTask(v);
  }
  function cancel() {
    setEditing(false);
    setTitle(task.title);
  }

  function commitImage() {
    const error = validateImageUrl(trimmedImageUrl);
    if (error) {
      setImageError(error);
      return;
    }

    addImage(trimmedImageUrl);
    setImageUrl("");
    setImageError(null);
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
          aria-label={`Select task ${accessibleTaskTitle}`}
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
          <span className="sr-only">{`Select task ${accessibleTaskTitle}`}</span>
        </button>

        <div
          className={cn(
            "pointer-events-none relative z-[1]",
            layoutClasses,
          )}
        >
          <div
            className="pointer-events-auto shrink-0 ml-[var(--space-1)]"
            data-task-row-guard="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <CheckCircle
              checked={task.done}
              onChange={() => {
                if (!editing) toggleTask();
              }}
              aria-label={`Toggle ${accessibleTaskTitle} done`}
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
                  toggleTask();
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
                aria-label={renameTaskLabel}
                data-task-row-guard="true"
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
              variant="ghost"
            >
              <Pencil />
            </IconButton>
            <IconButton
              aria-label="Delete task"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              size="sm"
              iconSize="xs"
              variant="ghost"
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>
      {task.images.length > 0 && (
        <ul className="mt-[var(--space-2)] space-y-[var(--space-2)]">
          {imageEntries.map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-center gap-[var(--space-2)]"
            >
              <Image
                src={entry.url}
                alt={`Task image for ${accessibleTaskTitle}`}
                width={taskImageSize}
                height={taskImageSize}
                className="rounded-card r-card-md object-cover"
                style={{
                  maxHeight: taskImageCssValue,
                  height: taskImageCssValue,
                  width: taskImageCssValue,
                }}
              />
              <IconButton
                aria-label="Remove image"
                title="Remove image"
                onClick={() => removeImage(entry.url, index)}
                size="sm"
                iconSize="xs"
                variant="ghost"
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
          commitImage();
        }}
        className="mt-[var(--space-2)] flex items-center gap-[var(--space-2)]"
      >
        <label htmlFor={`task-image-${task.id}`} className="sr-only">
          Add image URL
        </label>
        <Input
          id={`task-image-${task.id}`}
          type="url"
          value={imageUrl}
          onChange={(e) => {
            const nextValue = e.target.value;
            setImageUrl(nextValue);
            if (imageError) {
              const trimmedValue = nextValue.trim();
              if (!trimmedValue) {
                setImageError(null);
                return;
              }
              const nextError = validateImageUrl(trimmedValue);
              setImageError(nextError);
            }
          }}
          placeholder="https://example.com/image.jpg"
          className="flex-1"
          aria-invalid={imageError ? "true" : undefined}
          aria-describedby={imageError ? `task-image-${task.id}-error` : undefined}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!canAttachImage}
          className="shrink-0"
        >
          Attach image
        </Button>
      </form>
      {imageError && (
        <p
          id={`task-image-${task.id}-error`}
          className="mt-[var(--space-1)] text-ui text-danger"
          role="alert"
          aria-live="polite"
        >
          {imageError}
        </p>
      )}
    </li>
  );
}
