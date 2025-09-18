"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import Field from "./Field";

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
      <Field.Root
        invalid={isInvalid}
        disabled={props.disabled}
        readOnly={props.readOnly}
        className={cn("items-start", className)}
      >
        <Field.Textarea
          ref={ref}
          id={finalId}
          name={finalName}
          aria-label={ariaLabel}
          className={cn(resize, textareaClassName)}
          {...props}
        />
      </Field.Root>
    );
  },
);
