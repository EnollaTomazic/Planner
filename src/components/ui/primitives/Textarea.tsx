"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import { Field } from "./Field";

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
    /** Optional loading state forwarded via `data-loading` */
    "data-loading"?: string | boolean | number;
  };

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
    const loadingAttr = props["data-loading"];
    const loading =
      loadingAttr === "" ||
      loadingAttr === true ||
      loadingAttr === "true" ||
      loadingAttr === 1;

    return (
      <Field.Root
        invalid={isInvalid}
        disabled={props.disabled}
        readOnly={props.readOnly}
        loading={loading}
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

Textarea.displayName = "Textarea";
