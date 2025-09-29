"use client";

import * as React from "react";
import Image from "next/image";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { Pencil, Trash2 } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import useAutoFocus from "@/lib/useAutoFocus";
import { spacingTokens, readNumberToken } from "@/lib/tokens";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { uid } from "@/lib/db";
import type { DayTask } from "./plannerTypes";
import styles from "./TaskRow.module.css";

const taskImageSpacingToken = 7;
const taskImageSize = spacingTokens[taskImageSpacingToken - 1];
const layoutClasses =
  "[overflow:visible] grid min-h-[var(--space-7)] min-w-0 grid-cols-[auto,1fr,auto] items-center gap-[var(--space-4)] pl-[var(--space-4)] pr-[var(--space-2)] py-[var(--space-2)]";
const TASK_ROW_GUARD_SELECTOR = "[data-task-row-guard='true']";
const entryOffset = spacingTokens[2];
const bounceDistance = spacingTokens[0];
const DEFAULT_EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const DEFAULT_EASE_SNAP = "cubic-bezier(0.2, 0.8, 0.2, 1)";
type CubicBezierTuple = [number, number, number, number];
const DEFAULT_EASE_OUT_CURVE: CubicBezierTuple = [0.16, 1, 0.3, 1];
const DEFAULT_EASE_SNAP_CURVE: CubicBezierTuple = [0.2, 0.8, 0.2, 1];
const DEFAULT_DUR_CHILL = 0.22;
const DEFAULT_DUR_SLOW = 0.42;

type MotionTokens = {
  easeOut: string;
  easeSnap: string;
  easeOutCurve: CubicBezierTuple;
  easeSnapCurve: CubicBezierTuple;
  durChill: number;
  durSlow: number;
};

const readStringToken = (token: string, fallback: string): string => {
  if (typeof document === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();

  return value.length > 0 ? value : fallback;
};

const parseCubicBezier = (
  value: string,
  fallback: CubicBezierTuple,
): CubicBezierTuple => {
  const trimmed = value.trim();
  const match = trimmed.match(/^cubic-bezier\(([^)]+)\)$/i);
  if (!match) {
    return fallback;
  }

  const parts = match[1]
    .split(",")
    .map((segment) => Number.parseFloat(segment.trim()))
    .filter((segment) => Number.isFinite(segment)) as number[];

  return parts.length === 4
    ? (parts as CubicBezierTuple)
    : fallback;
};

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
  const reduceMotionPreference = usePrefersReducedMotion();
  const [forcedReduceMotion, setForcedReduceMotion] = React.useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains("no-animations");
  });
  const [motionTokens, setMotionTokens] = React.useState<MotionTokens>(() => ({
    easeOut: DEFAULT_EASE_OUT,
    easeSnap: DEFAULT_EASE_SNAP,
    easeOutCurve: DEFAULT_EASE_OUT_CURVE,
    easeSnapCurve: DEFAULT_EASE_SNAP_CURVE,
    durChill: DEFAULT_DUR_CHILL,
    durSlow: DEFAULT_DUR_SLOW,
  }));
  const bounceControls = useAnimation();
  const reduceMotion = reduceMotionPreference || forcedReduceMotion;

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

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    const syncForcedReduceMotion = () => {
      setForcedReduceMotion(root.classList.contains("no-animations"));
    };

    syncForcedReduceMotion();

    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(syncForcedReduceMotion);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const easeOut = readStringToken("--ease-out", DEFAULT_EASE_OUT);
    const easeSnap = readStringToken("--ease-snap", DEFAULT_EASE_SNAP);

    setMotionTokens({
      easeOut,
      easeSnap,
      easeOutCurve: parseCubicBezier(easeOut, DEFAULT_EASE_OUT_CURVE),
      easeSnapCurve: parseCubicBezier(easeSnap, DEFAULT_EASE_SNAP_CURVE),
      durChill:
        readNumberToken("--dur-chill", DEFAULT_DUR_CHILL * 1000) / 1000,
      durSlow: readNumberToken("--dur-slow", DEFAULT_DUR_SLOW * 1000) / 1000,
    });
  }, []);

  React.useEffect(() => {
    bounceControls.set({ y: 0, scale: 1 });
  }, [bounceControls]);

  const previousDoneRef = React.useRef(task.done);

  React.useEffect(() => {
    if (reduceMotion) {
      bounceControls.set({ y: 0, scale: 1 });
      previousDoneRef.current = task.done;
      return;
    }

    if (previousDoneRef.current === task.done) {
      previousDoneRef.current = task.done;
      return;
    }

    const offset = task.done ? bounceDistance : -bounceDistance;

    void bounceControls.start({
      y: [0, offset, 0],
      scale: task.done ? [1, 0.98, 1] : [1, 1.02, 1],
      transition: {
        duration: motionTokens.durChill,
        ease: motionTokens.easeSnapCurve,
      },
    });

    previousDoneRef.current = task.done;
  }, [
    task.done,
    reduceMotion,
    bounceControls,
    motionTokens.durChill,
    motionTokens.easeSnapCurve,
  ]);

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
    <motion.li
      className="group"
      initial={
        reduceMotion ? undefined : { opacity: 0, y: entryOffset, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : motionTokens.durSlow,
        ease: motionTokens.easeOutCurve,
      }}
    >
      <motion.div
        className="relative"
        onFocusCapture={handleFocusWithin}
        onBlurCapture={handleBlurWithin}
        animate={bounceControls}
        initial={false}
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
      </motion.div>
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
                className={cn(
                  styles.thumbnail,
                  "rounded-card r-card-md object-cover",
                )}
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
    </motion.li>
  );
}
