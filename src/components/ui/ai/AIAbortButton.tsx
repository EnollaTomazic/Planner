"use client";

import * as React from "react";
import { CircleStop } from "lucide-react";

import Button, { type ButtonProps } from "../primitives/Button";
import { cn } from "@/lib/utils";

type NativeButtonProps = Extract<ButtonProps, { href?: undefined; asChild?: false | undefined }>;

export interface AIAbortButtonProps extends Omit<NativeButtonProps, "onClick"> {
  readonly label?: string;
  readonly onAbort: () => void;
  readonly onClick?: NativeButtonProps["onClick"];
}

const DEFAULT_ABORT_LABEL = "Stop response";

const AIAbortButton = React.forwardRef<HTMLButtonElement, AIAbortButtonProps>(
  (
    {
      label = DEFAULT_ABORT_LABEL,
      onAbort,
      children,
      className,
      disabled,
      loading,
      onClick,
      size,
      variant,
      tone,
      ...props
    },
    ref,
  ) => {
    const handleClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
      (event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        if (disabled || loading) {
          return;
        }
        onAbort();
      },
      [disabled, loading, onAbort, onClick],
    );

    const content =
      children ?? (
        <>
          <CircleStop aria-hidden="true" className="size-[var(--space-4)]" />
          <span>{label}</span>
        </>
      );

    const ariaLabel = props["aria-label"] ?? label;

    return (
      <Button
        ref={ref}
        {...props}
        type="button"
        size={size ?? "sm"}
        variant={variant ?? "quiet"}
        tone={tone ?? "danger"}
        className={cn("gap-[var(--space-1)]", className)}
        onClick={handleClick}
        disabled={disabled}
        loading={loading}
        aria-label={ariaLabel}
      >
        {content}
      </Button>
    );
  },
);

AIAbortButton.displayName = "AIAbortButton";

export default AIAbortButton;
