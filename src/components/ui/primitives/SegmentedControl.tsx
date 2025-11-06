'use client';

import * as React from 'react';

import { useRovingTabState } from '@/components/tabs/useRovingTabState';
import { cn } from '@/lib/utils';

import { GlitchSegmentedButton } from './GlitchSegmentedButton';
import {
  GlitchSegmentedGroup,
  type GlitchSegmentedGroupProps,
} from './GlitchSegmentedGroup';

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  controls?: string;
  className?: string;
};

export interface SegmentedControlProps<Value extends string = string>
  extends Omit<GlitchSegmentedGroupProps, 'children'> {
  options: ReadonlyArray<SegmentedControlOption<Value>>;
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  idBase?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  linkPanels?: boolean;
}

const iconSizeMap = {
  sm: '[&>svg]:h-[var(--space-4)] [&>svg]:w-[var(--space-4)]',
  md: '[&>svg]:h-[var(--space-4)] [&>svg]:w-[var(--space-4)]',
  lg: '[&>svg]:h-[var(--space-5)] [&>svg]:w-[var(--space-5)]',
} as const;

export function SegmentedControl<Value extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  align = 'start',
  idBase,
  ariaLabel,
  ariaLabelledBy,
  linkPanels = true,
  className,
  onKeyDown: onKeyDownProp,
  ...rest
}: SegmentedControlProps<Value>) {
  const generatedId = React.useId();
  const baseId = idBase ?? generatedId;

  const { activeKey, setActiveValue, registerTab, onKeyDown } = useRovingTabState({
    items: options.map((option) => ({
      key: option.value,
      disabled: option.disabled,
    })),
    value,
    defaultValue,
    onValueChange,
  });

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown(event);
      onKeyDownProp?.(event);
    },
    [onKeyDown, onKeyDownProp],
  );

  const labelProps: {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  } = {};

  if (ariaLabelledBy) {
    labelProps['aria-labelledby'] = ariaLabelledBy;
    if (ariaLabel) {
      labelProps['aria-label'] = ariaLabel;
    }
  } else if (ariaLabel) {
    labelProps['aria-label'] = ariaLabel;
  }

  return (
    <GlitchSegmentedGroup
      role="tablist"
      aria-orientation="horizontal"
      size={size}
      align={align}
      className={className}
      onKeyDown={handleKeyDown}
      {...labelProps}
      {...rest}
    >
      {options.map((option) => {
        const isActive = option.value === activeKey;
        const isLoading = Boolean(option.loading);
        const isDisabled = Boolean(option.disabled) || isLoading;
        const tabId = `${baseId}-${option.id ?? `${option.value}-tab`}`;
        const panelId = `${baseId}-${option.controls ?? `${option.value}-panel`}`;

        const setRef: React.RefCallback<HTMLElement> = (node) => {
          registerTab(option.value, node);
        };

        return (
          <GlitchSegmentedButton
            key={option.value}
            ref={setRef}
            id={linkPanels ? tabId : undefined}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled || undefined}
            aria-busy={isLoading || undefined}
            aria-controls={linkPanels ? panelId : undefined}
            tabIndex={isDisabled ? -1 : isActive ? 0 : -1}
            selected={isActive}
            disabled={option.disabled}
            loading={isLoading}
            depth="raised"
            className={cn(
              'group/segment inline-flex items-center justify-center font-medium tracking-[0.02em] text-ui transition-colors duration-motion-sm ease-out',
              size === 'lg' ? 'text-body' : 'text-ui',
              option.className,
            )}
            onClick={(event) => {
              if (isDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              setActiveValue(option.value);
            }}
          >
            {option.icon ? (
              <span
                className={cn(
                  'mr-[var(--space-2)] grid place-items-center text-current',
                  iconSizeMap[size],
                )}
                aria-hidden
              >
                {option.icon}
              </span>
            ) : null}
            <span className="truncate">{option.label}</span>
            {option.badge != null ? (
              <span className="ml-[var(--space-2)] inline-flex min-h-[calc(var(--space-3)*1.1)] items-center justify-center rounded-full bg-primary-soft px-[var(--space-2)] py-[calc(var(--space-1)*0.6)] text-label leading-none text-foreground">
                {option.badge}
              </span>
            ) : null}
          </GlitchSegmentedButton>
        );
      })}
    </GlitchSegmentedGroup>
  );
}
