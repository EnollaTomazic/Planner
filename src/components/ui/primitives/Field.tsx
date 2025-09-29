"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import Spinner from "../feedback/Spinner";
import IconButton from "./IconButton";
import styles from "./Field.module.css";

export type FieldHeight = "sm" | "md" | "lg" | "xl";

const HEIGHT_MAP: Record<FieldHeight, true> = {
  sm: true,
  md: true,
  lg: true,
  xl: true,
};

const FIELD_ROOT_BASE = cn(
  "group/field relative inline-flex min-h-[var(--field-h,var(--control-h-md))] w-full items-center",
  "rounded-[var(--control-radius)] border border-[hsl(var(--card-hairline)/0.65)] bg-[hsl(var(--bg))] text-foreground",
  "shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.08),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.32)]",
  "transition-[background,box-shadow,filter] duration-quick ease-out",
  "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--focus)] focus-within:ring-offset-0 focus-within:ring-offset-[hsl(var(--bg))]",
  "hover:shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)] active:brightness-[0.96]",
  "data-[disabled=true]:pointer-events-none data-[disabled=true]:border-[hsl(var(--card-hairline)/0.4)]",
  "data-[disabled=true]:bg-[hsl(var(--card))] data-[disabled=true]:shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.04)]",
  "data-[disabled=true]:text-muted-foreground/70 data-[loading=true]:pointer-events-none data-[loading=true]:opacity-loading",
  "data-[invalid=true]:border-danger/60 data-[invalid=true]:focus-within:ring-danger",
  "overflow-hidden",
);

function resolveHeight(height: number) {
  if (Number.isFinite(height)) {
    return `${height}px`;
  }

  return undefined;
}

type HelperTone = "muted" | "danger" | "success";

export type FieldRootProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Visual height of the field. Token keys ("sm"–"xl") map to control heights.
   * Numeric values register a scoped `--field-h` custom property via styled-jsx using the CSP nonce from layout.
   */
  height?: FieldHeight | number;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  helper?: React.ReactNode;
  helperId?: string;
  helperTone?: HelperTone;
  counter?: React.ReactNode;
  counterId?: string;
  spinner?: React.ReactNode;
  wrapperClassName?: string;
};

export const FieldRoot = React.forwardRef<HTMLDivElement, FieldRootProps>(
  (
    {
      height = "md",
      disabled,
      invalid,
      readOnly,
      loading,
      helper,
      helperId,
      helperTone,
      counter,
      counterId,
      spinner,
      wrapperClassName,
      className,
      children,
      style: inlineStyle,
      ...props
    },
    ref,
  ) => {
    const heightKey =
      typeof height === "string" && Object.hasOwn(HEIGHT_MAP, height)
        ? (height as FieldHeight)
        : undefined;
    const numericHeight = typeof height === "number" ? height : null;
    const isCustomHeight =
      numericHeight !== null && Number.isFinite(numericHeight);
    const resolvedCustomHeight = isCustomHeight
      ? resolveHeight(numericHeight)
      : undefined;
    const helperVariant: HelperTone = helperTone ?? (invalid ? "danger" : "muted");
    const showHelper = helper !== undefined && helper !== null && helper !== "";
    const showCounter = counter !== undefined && counter !== null && counter !== "";
    let fieldState: "default" | "disabled" | "invalid" | "readonly" | "loading" = "default";
    if (disabled) {
      fieldState = "disabled";
    } else if (invalid) {
      fieldState = "invalid";
    } else if (readOnly) {
      fieldState = "readonly";
    } else if (loading) {
      fieldState = "loading";
    }

    const customHeightStyle = React.useMemo<
      (React.CSSProperties & Record<string, string>) | undefined
    >(() => {
      if (!isCustomHeight || !resolvedCustomHeight) {
        return undefined;
      }

      return {
        "--field-custom-height": resolvedCustomHeight,
      };
    }, [isCustomHeight, resolvedCustomHeight]);

    const mergedStyle = React.useMemo<React.CSSProperties | undefined>(() => {
      if (!customHeightStyle) {
        return inlineStyle as React.CSSProperties | undefined;
      }
      return {
        ...(inlineStyle as React.CSSProperties | undefined),
        ...customHeightStyle,
      };
    }, [customHeightStyle, inlineStyle]);

    return (
      <div
        className={cn(
          "flex w-full flex-col gap-[var(--space-1)]",
          wrapperClassName,
        )}
      >
        <div
          ref={ref}
          className={cn(FIELD_ROOT_BASE, styles.root, className)}
          data-field-height={heightKey}
          data-custom-height={isCustomHeight ? "true" : undefined}
          data-field-state={fieldState}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          data-loading={loading ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          aria-disabled={disabled || undefined}
          aria-busy={loading || undefined}
          style={mergedStyle}
          {...props}
        >
          {children}
          {loading ? (
            <span
              data-slot="spinner"
              className="pointer-events-none absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {spinner ?? <Spinner size="sm" />}
            </span>
          ) : null}
        </div>

        {(showHelper || showCounter) && (
          <div
            className={cn(
              "flex items-start gap-[var(--space-2)] text-label leading-tight",
              showHelper && showCounter
                ? "justify-between"
                : showCounter
                  ? "justify-end"
                  : "justify-start",
            )}
          >
            {showHelper ? (
              <span
                id={helperId}
                className={cn(
                  "text-muted-foreground",
                  helperVariant === "danger" && "text-danger",
                  helperVariant === "success" && "text-success",
                )}
              >
                {helper}
              </span>
            ) : null}

            {showCounter ? (
              <span id={counterId} className="text-muted-foreground">
                {counter}
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  },
);

FieldRoot.displayName = "FieldRoot";

export type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  indent?: boolean;
  hasEndSlot?: boolean;
};

export const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  ({ className, indent, hasEndSlot, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "peer block h-[var(--field-h,var(--control-h-md))] w-full rounded-[inherit] border-none bg-transparent",
        "px-[var(--space-3)] text-ui text-foreground placeholder:text-muted-foreground/70 caret-accent",
        "focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed read-only:cursor-default",
        "transition-[color,opacity] group-data-[disabled=true]/field:text-muted-foreground/70",
        "group-data-[disabled=true]/field:placeholder:text-muted-foreground/50",
        "group-data-[loading=true]/field:opacity-loading",
        indent && "pl-[var(--space-7)]",
        (hasEndSlot ?? false) && "pr-[calc(var(--space-6)+var(--space-2))]",
        className,
      )}
      {...props}
    />
  ),
);

FieldInput.displayName = "FieldInput";

export type FieldTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FieldTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FieldTextareaProps
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "block w-full max-w-full min-h-[var(--space-7)] rounded-[inherit] border-none bg-transparent",
      "px-[var(--space-3)] py-[var(--space-3)] text-body text-foreground placeholder:text-muted-foreground/70",
      "focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed read-only:cursor-default",
      "transition-[color,opacity] group-data-[disabled=true]/field:text-muted-foreground/70",
      "group-data-[disabled=true]/field:placeholder:text-muted-foreground/50",
      "group-data-[loading=true]/field:opacity-loading",
      className,
    )}
    {...props}
  />
));

FieldTextarea.displayName = "FieldTextarea";

export type FieldSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasEndSlot?: boolean;
};

export const FieldSelect = React.forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ className, hasEndSlot, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "block h-[var(--field-h,var(--control-h-md))] w-full appearance-none rounded-[inherit] border-none bg-transparent",
        "px-[var(--space-3)] text-ui text-foreground placeholder:text-muted-foreground/70 caret-accent",
        "focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed read-only:cursor-default",
        "transition-[color,opacity] group-data-[disabled=true]/field:text-muted-foreground/70",
        "group-data-[disabled=true]/field:placeholder:text-muted-foreground/50",
        "group-data-[loading=true]/field:opacity-loading",
        (hasEndSlot ?? false) && "pr-[calc(var(--space-6)+var(--space-2))]",
        className,
      )}
      {...props}
    />
  ),
);

FieldSelect.displayName = "FieldSelect";

export type FieldSearchProps = Omit<FieldInputProps, "type"> & {
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  loading?: boolean;
};

export const FieldSearch = React.forwardRef<HTMLInputElement, FieldSearchProps>(
  (
    {
      className,
      clearable = true,
      clearLabel = "Clear",
      onClear,
      loading,
      indent,
      hasEndSlot,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    forwardedRef,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(() => {
      if (defaultValue === undefined || defaultValue === null) {
        return "";
      }

      return defaultValue.toString();
    });

    const currentValue = isControlled
      ? value?.toString() ?? ""
      : uncontrolledValue;

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
          return;
        }
        if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [forwardedRef],
    );

    const handleChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (event) => {
        if (!isControlled) {
          setUncontrolledValue(event.target.value);
        }

        onChange?.(event);
      },
      [isControlled, onChange],
    );

    const showSpinner = Boolean(loading);
    const showClear =
      clearable && !showSpinner && currentValue !== undefined && currentValue.length > 0;

    const finalDisabled = disabled || loading;

    return (
      <>
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-[var(--space-4)] top-1/2 size-[var(--space-4)] -translate-y-1/2",
            "text-muted-foreground transition-colors duration-quick ease-out",
            "opacity-60 group-focus-within:opacity-100",
            "group-focus-within:text-accent-3",
            "group-data-[disabled=true]/field:opacity-disabled",
            "group-data-[loading=true]/field:opacity-loading",
            "group-data-[invalid=true]/field:text-danger",
          )}
        />

        <FieldInput
          ref={setRefs}
          type="search"
          className={cn(
            "appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none",
            "pl-[var(--space-7)]",
            className,
          )}
          indent={indent ?? true}
          hasEndSlot={hasEndSlot ?? (showClear || showSpinner)}
          disabled={finalDisabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          data-loading={loading ? "true" : undefined}
          {...props}
        />

        {clearable ? (
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            tone="primary"
            aria-label={clearLabel}
            title={clearLabel}
            iconSize="sm"
            className={cn(
              "absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 transition-opacity",
              showClear
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            disabled={finalDisabled}
            onClick={() => {
              if (!isControlled) {
                setUncontrolledValue("");
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }
              onClear?.();
              inputRef.current?.focus();
            }}
          >
            <X />
          </IconButton>
        ) : null}
      </>
    );
  },
);

FieldSearch.displayName = "FieldSearch";

const Field = {
  Root: FieldRoot,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Select: FieldSelect,
  Search: FieldSearch,
};

export default Field;
