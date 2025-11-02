"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Slider.module.css";

export interface SliderProps
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

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
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
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const sliderId = id ?? generatedId;
    const descriptionId = description ? `${sliderId}-description` : undefined;

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

Slider.displayName = "Slider";

export { Slider };
