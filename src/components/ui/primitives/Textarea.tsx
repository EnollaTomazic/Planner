"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import FieldShell from "./FieldShell";

/**
 * Textarea primitive.
 * No default `resize-*` utility is applied; use the `resize` prop or
 * `textareaClassName` to control resizing behavior.
 */
export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Optional className for the outer wrapper */
    className?: string;
    /** Optional className for the inner <textarea> element */
    textareaClassName?: string;
    /** Tailwind `resize-*` utility to control resizing behavior */
    resize?: string;
  };

const INNER =
  "block w-full max-w-full min-h-7 px-3 py-3 text-base bg-transparent " +
  "text-foreground placeholder:text-muted-foreground/70 " +
  "focus:[outline:none] focus-visible:[outline:none] disabled:opacity-[var(--disabled)] disabled:cursor-not-allowed read-only:cursor-default";

export default React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      textareaClassName,
      resize,
      id,
      name,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const { id: finalId, name: finalName, isInvalid } = useFieldIds(
      ariaLabel as string | undefined,
      id,
      name,
      {
        ariaInvalid: props["aria-invalid"],
        slugifyFallback: true,
      },
    );

    return (
      <FieldShell
        error={isInvalid}
        disabled={props.disabled}
        readOnly={props.readOnly}
        className={className}
      >
        <textarea
          ref={ref}
          id={finalId}
          name={finalName}
          className={cn(INNER, resize, textareaClassName)}
          {...props}
        />
      </FieldShell>
    );
  },
);
