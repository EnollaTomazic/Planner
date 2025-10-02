"use client";

import { env } from "@/env/client";
import * as React from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import styles from "./HeaderTabs.module.css";
import { useRovingTabState } from "./useRovingTabState";

export type HeaderTabItem<Key extends string = string> = {
  key: Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  controls?: string;
  className?: string;
};

interface HeaderTabsBaseProps<Key extends string> {
  items: HeaderTabItem<Key>[];
  ariaLabel?: string;
  ariaLabelledBy?: string;
  idBase?: string;
  linkPanels?: boolean;
}

type HeaderTabsControlledProps<Key extends string> = {
  value: Key;
  defaultValue?: never;
  onChange: (key: Key) => void;
};

type HeaderTabsUncontrolledProps<Key extends string> = {
  value?: undefined;
  defaultValue: Key;
  onChange?: (key: Key) => void;
};

type HeaderTabsCommonDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
>;

export type HeaderTabsProps<Key extends string = string> = HeaderTabsBaseProps<Key> &
  HeaderTabsCommonDomProps &
  (HeaderTabsControlledProps<Key> | HeaderTabsUncontrolledProps<Key>);

export function HeaderTabs<Key extends string = string>({
  items,
  value,
  defaultValue,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  idBase,
  linkPanels = true,
  className,
  onKeyDown: onKeyDownProp,
  ...rest
}: HeaderTabsProps<Key>) {
  const sanitizedAriaLabel =
    typeof ariaLabel === "string" && ariaLabel.trim().length > 0
      ? ariaLabel.trim()
      : undefined;
  const sanitizedAriaLabelledBy =
    typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
      ? ariaLabelledBy.trim()
      : undefined;

  React.useEffect(() => {
    if (env.NODE_ENV !== "production") {
      if (!sanitizedAriaLabel && !sanitizedAriaLabelledBy) {
        console.warn(
          "HeaderTabs requires either ariaLabel or ariaLabelledBy to describe the tablist.",
        );
      }
    }
  }, [sanitizedAriaLabel, sanitizedAriaLabelledBy]);

  const handleValueChange = React.useCallback(
    (key: Key) => {
      if (typeof onChange === "function") {
        onChange(key);
      }
    },
    [onChange],
  );

  const {
    activeKey,
    setActiveValue,
    registerTab,
    onKeyDown: rovingKeyDown,
  } = useRovingTabState({
    items,
    value,
    defaultValue,
    onValueChange: handleValueChange,
  });

  const generatedId = useId();
  const baseId = idBase ?? generatedId;

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (!event.defaultPrevented) {
        rovingKeyDown(event);
      }
    },
    [onKeyDownProp, rovingKeyDown],
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      aria-label={sanitizedAriaLabel}
      aria-labelledby={sanitizedAriaLabelledBy}
      className={cn(styles.root, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span aria-hidden="true" className={styles.track} />
      <div className={styles.list} role="presentation">
        {items.map((item) => {
          const active = item.key === activeKey;
          const isDisabled = Boolean(item.disabled);
          const state = isDisabled ? "disabled" : active ? "active" : "inactive";
          const tabId = `${baseId}-${item.id ?? `${item.key}-tab`}`;
          const panelId = `${baseId}-${item.controls ?? `${item.key}-panel`}`;

          const setRef: React.RefCallback<HTMLElement> = (node) => {
            registerTab(item.key, node);
          };

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={linkPanels ? tabId : undefined}
              aria-selected={active}
              aria-controls={linkPanels ? panelId : undefined}
              aria-disabled={isDisabled || undefined}
              tabIndex={isDisabled ? -1 : active ? 0 : -1}
              data-state={state}
              className={cn(styles.tab, item.className)}
              onClick={(event) => {
                if (isDisabled) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                setActiveValue(item.key);
              }}
              ref={setRef as React.Ref<HTMLButtonElement>}
              disabled={isDisabled}
            >
              {item.icon ? (
                <span aria-hidden="true" className={styles.icon}>
                  {item.icon}
                </span>
              ) : null}
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HeaderTabs;
