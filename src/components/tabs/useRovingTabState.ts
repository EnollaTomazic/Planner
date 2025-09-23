"use client";

import * as React from "react";

export type RovingTabItem<Key extends string> = {
  key: Key;
  disabled?: boolean;
};

export interface UseRovingTabStateOptions<
  Key extends string,
  Item extends RovingTabItem<Key>,
> {
  items: Item[];
  value?: Key;
  defaultValue?: Key;
  onValueChange?: (key: Key) => void;
}

export interface UseRovingTabStateResult<Key extends string> {
  activeKey: Key;
  isControlled: boolean;
  setActiveValue: (key: Key) => void;
  focusTab: (key: Key) => void;
  registerTab: (key: Key, node: HTMLElement | null) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

/**
 * Shared roving tabindex logic for horizontal tab lists.
 */
export function useRovingTabState<
  Key extends string,
  Item extends RovingTabItem<Key>,
>({ items, value, defaultValue, onValueChange }: UseRovingTabStateOptions<Key, Item>): UseRovingTabStateResult<Key> {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Key>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    const fallback = items.find((item) => !item.disabled)?.key ?? items[0]?.key;
    return (fallback ?? "") as Key;
  });

  const activeKey = (isControlled ? value : internal) as Key;

  const setActiveValue = React.useCallback(
    (next: Key) => {
      if (!isControlled) {
        setInternal(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const tabRefs = React.useRef<Partial<Record<Key, HTMLElement | null>>>({});

  const registerTab = React.useCallback(
    (key: Key, node: HTMLElement | null) => {
      tabRefs.current[key] = node;
    },
    [],
  );

  const focusTab = React.useCallback((key: Key) => {
    const target = tabRefs.current[key];
    target?.focus();
  }, []);

  const setAndFocus = React.useCallback(
    (next: Key) => {
      setActiveValue(next);
      focusTab(next);
    },
    [focusTab, setActiveValue],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const key = event.key;
      if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") {
        return;
      }

      event.preventDefault();

      const enabled = items.filter((item) => !item.disabled);
      if (enabled.length === 0) return;

      const currentIndex = enabled.findIndex((item) => item.key === activeKey);

      if (key === "Home") {
        setAndFocus(enabled[0].key);
        return;
      }

      if (key === "End") {
        setAndFocus(enabled[enabled.length - 1].key);
        return;
      }

      if (key === "ArrowLeft") {
        const nextIndex = currentIndex <= 0 ? enabled.length - 1 : currentIndex - 1;
        setAndFocus(enabled[nextIndex].key);
        return;
      }

      if (key === "ArrowRight") {
        const nextIndex = currentIndex >= enabled.length - 1 ? 0 : currentIndex + 1;
        setAndFocus(enabled[nextIndex].key);
      }
    },
    [activeKey, items, setAndFocus],
  );

  return {
    activeKey,
    isControlled,
    setActiveValue,
    focusTab,
    registerTab,
    onKeyDown,
  };
}
