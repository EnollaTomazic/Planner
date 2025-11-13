"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./RangeSlider.module.css";

export interface RangeSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  minLabel?: React.ReactNode;
  maxLabel?: React.ReactNode;
  labelClassName?: string;
  descriptionClassName?: string;
  minLabelClassName?: string;
  maxLabelClassName?: string;
  controlClassName?: string;
  trackClassName?: string;
}

type RawSliderValue =
  | RangeSliderProps["value"]
  | RangeSliderProps["defaultValue"]
  | undefined;

function parseNumericValue(rawValue: RawSliderValue): number | undefined {
  if (typeof rawValue === "number") {
    return Number.isNaN(rawValue) ? undefined : rawValue;
  }

  if (typeof rawValue === "string") {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (Array.isArray(rawValue)) {
    const [first] = rawValue;
    if (first === undefined) return undefined;
    const parsed = Number(first);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderProps>(
  (
    {
      id,
      label,
      description,
      minLabel,
      maxLabel,
      labelClassName,
      descriptionClassName,
      minLabelClassName,
      maxLabelClassName,
      controlClassName,
      trackClassName,
      className,
      ...restProps
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const sliderId = id ?? generatedId;
    const descriptionId = description ? `${sliderId}-description` : undefined;

    const {
      value: valueProp,
      defaultValue,
      min,
      max,
      style: inputStyle,
      onChange,
      onInput,
      ...inputProps
    } = restProps;

    const numericMin = React.useMemo(() => {
      const parsed = parseNumericValue(min);
      return parsed !== undefined ? parsed : 0;
    }, [min]);

    const numericMax = React.useMemo(() => {
      const parsed = parseNumericValue(max);
      return parsed !== undefined ? parsed : 100;
    }, [max]);

    const clampValue = React.useCallback(
      (raw: number | undefined) => {
        if (typeof raw !== "number" || Number.isNaN(raw)) {
          return numericMin;
        }

        if (numericMax <= numericMin) {
          return numericMin;
        }

        return Math.min(Math.max(raw, numericMin), numericMax);
      },
      [numericMax, numericMin],
    );

    const initialValue = React.useMemo(() => {
      const parsed =
        parseNumericValue(valueProp) ?? parseNumericValue(defaultValue);
      return clampValue(parsed);
    }, [clampValue, defaultValue, valueProp]);

    const [currentValue, setCurrentValue] = React.useState<number>(initialValue);

    React.useEffect(() => {
      if (valueProp !== undefined) {
        setCurrentValue((previous) => {
          const parsed = parseNumericValue(valueProp);
          const next = clampValue(parsed);
          return Number.isNaN(next) ? previous : next;
        });
      }
    }, [clampValue, valueProp]);

    React.useEffect(() => {
      // Ensure the internal state respects updated min/max bounds for uncontrolled usage.
      setCurrentValue((previous) => clampValue(previous));
    }, [clampValue]);

    const percent = React.useMemo(() => {
      if (numericMax <= numericMin) {
        return 0;
      }

      return ((currentValue - numericMin) / (numericMax - numericMin)) * 100;
    }, [currentValue, numericMax, numericMin]);

    const mergedStyle = React.useMemo<React.CSSProperties>(() => {
      const baseStyle =
        inputStyle && typeof inputStyle === "object"
          ? (inputStyle as React.CSSProperties)
          : undefined;

      return {
        ...baseStyle,
        ["--range-progress" as const]: `${Math.min(Math.max(percent, 0), 100)}%`,
      };
    }, [inputStyle, percent]);

    const handleInput = React.useCallback(
      (event: React.FormEvent<HTMLInputElement>) => {
        if (valueProp === undefined) {
          const parsed = parseNumericValue(event.currentTarget.value);
          setCurrentValue(clampValue(parsed));
        }

        onInput?.(event);
      },
      [clampValue, onInput, valueProp],
    );

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (valueProp === undefined) {
          const parsed = parseNumericValue(event.currentTarget.value);
          setCurrentValue(clampValue(parsed));
        }

        onChange?.(event);
      },
      [clampValue, onChange, valueProp],
    );

    return (
      <div className={cn(styles.root, className)}>
        {label ? (
          <label htmlFor={sliderId} className={cn(styles.label, labelClassName)}>
            {label}
          </label>
        ) : null}
        <div className={cn(styles.control, controlClassName)}>
          {minLabel !== undefined ? (
            <span
              className={cn(styles.boundLabel, minLabelClassName)}
              aria-hidden
            >
              {minLabel}
            </span>
          ) : null}
          <input
            id={sliderId}
            ref={ref}
            type="range"
            className={cn(styles.track, trackClassName)}
            aria-describedby={descriptionId}
            min={min}
            max={max}
            style={mergedStyle}
            onInput={handleInput}
            onChange={handleChange}
            {...(valueProp !== undefined
              ? { value: valueProp }
              : { defaultValue })}
            {...inputProps}
          />
          {maxLabel !== undefined ? (
            <span
              className={cn(styles.boundLabel, maxLabelClassName)}
              aria-hidden
            >
              {maxLabel}
            </span>
          ) : null}
        </div>
        {description ? (
          <span
            id={descriptionId}
            className={cn(styles.description, descriptionClassName)}
            aria-live="polite"
          >
            {description}
          </span>
        ) : null}
      </div>
    );
  },
);

RangeSlider.displayName = "RangeSlider";

export { RangeSlider };
