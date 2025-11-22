"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldIds } from "@/lib/useFieldIds";
import { Field, type FieldRootProps, type FieldVariant } from "./Field";
import { type GlitchOverlayToken } from "./BlobContainer";

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
    /** Sets the Field.Root variant */
    variant?: FieldVariant;
    /** Enables the glitch overlay treatment */
    glitch?: boolean;
    /**
     * Overrides the text surfaced in the glitch overlay.
     * Falls back to `data-text`, `placeholder`, or `aria-label` when available.
     */
    glitchText?: string;
    /** Overrides the glitch overlay intensity */
    glitchIntensity?: GlitchOverlayToken;
    /** Optional helper text rendered below the field */
    helper?: FieldRootProps["helper"];
    helperId?: FieldRootProps["helperId"];
    helperTone?: FieldRootProps["helperTone"];
    counter?: FieldRootProps["counter"];
    counterId?: FieldRootProps["counterId"];
    wrapperClassName?: FieldRootProps["wrapperClassName"];
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
      variant = "surface",
      glitch,
      glitchText,
      glitchIntensity,
      helper,
      helperId,
      helperTone,
      counter,
      counterId,
      wrapperClassName,
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
        variant={variant}
        glitch={glitch}
        glitchText={glitchText}
        glitchIntensity={glitchIntensity}
        helper={helper}
        helperId={helperId}
        helperTone={helperTone}
        counter={counter}
        counterId={counterId}
        wrapperClassName={wrapperClassName}
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
