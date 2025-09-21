"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import type { AnimatedSelectProps } from "./shared";

export type UseAnimatedSelectArgs = {
  items: AnimatedSelectProps["items"];
  value?: string;
  onChange?: AnimatedSelectProps["onChange"];
  matchTriggerWidth: NonNullable<AnimatedSelectProps["matchTriggerWidth"]>;
  align: NonNullable<AnimatedSelectProps["align"]>;
  size: NonNullable<AnimatedSelectProps["size"]>;
  label?: AnimatedSelectProps["label"];
  prefixLabel?: AnimatedSelectProps["prefixLabel"];
  ariaLabel?: AnimatedSelectProps["ariaLabel"];
  forwardedRef: React.Ref<HTMLButtonElement>;
};

const GAP_PX = 8;

function getInitialActiveIndex(
  items: AnimatedSelectProps["items"],
  value?: string,
) {
  const selectedIndex = items.findIndex(
    (item) => item.value === value && !item.disabled && !item.loading,
  );

  if (selectedIndex !== -1) {
    return selectedIndex;
  }

  for (let i = 0; i < items.length; i += 1) {
    const candidate = items[i];
    if (candidate && !candidate.disabled && !candidate.loading) {
      return i;
    }
  }

  return -1;
}

export function useAnimatedSelect({
  items,
  value,
  onChange,
  matchTriggerWidth,
  align,
  size,
  label,
  prefixLabel,
  ariaLabel,
  forwardedRef,
}: UseAnimatedSelectArgs) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() =>
    getInitialActiveIndex(items, value),
  );

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
        return;
      }

      if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [forwardedRef],
  );

  const isOptionFocusable = React.useCallback(
    (index: number) => {
      const option = items[index];
      return !!option && !option.disabled && !option.loading;
    },
    [items],
  );

  const getFirstFocusableIndex = React.useCallback(() => {
    for (let i = 0; i < items.length; i += 1) {
      if (isOptionFocusable(i)) {
        return i;
      }
    }
    return -1;
  }, [items, isOptionFocusable]);

  const getLastFocusableIndex = React.useCallback(() => {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (isOptionFocusable(i)) {
        return i;
      }
    }
    return -1;
  }, [items, isOptionFocusable]);

  const getNextFocusableIndex = React.useCallback(
    (start: number, direction: 1 | -1) => {
      if (items.length === 0) {
        return -1;
      }

      let index = start;
      for (let i = 0; i < items.length; i += 1) {
        index = (index + direction + items.length) % items.length;
        if (isOptionFocusable(index)) {
          return index;
        }
      }

      return -1;
    },
    [items, isOptionFocusable],
  );

  const focusItem = React.useCallback(
    (index: number) => {
      if (!isOptionFocusable(index)) return;

      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
        ?.focus();
    },
    [isOptionFocusable],
  );

  const idBase = React.useId();
  const labelId = `${idBase}-label`;
  const listboxId = `${idBase}-listbox`;

  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [menuWidth, setMenuWidth] = React.useState<number | null>(null);

  const reduceMotion = useReducedMotion();

  const durQuick = React.useMemo(() => {
    if (typeof window === "undefined") return 0.14;

    const valueFromCss = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--dur-quick",
      ),
    );

    return (Number.isNaN(valueFromCss) ? 140 : valueFromCss) / 1000;
  }, []);

  const measure = React.useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;

    setRect(r);
    if (matchTriggerWidth) {
      setMenuWidth(r.width);
    }
  }, [matchTriggerWidth]);

  const rafId = React.useRef<number | null>(null);

  const scheduleMeasure = React.useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      measure();
    });
  }, [measure]);

  React.useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    scheduleMeasure();
  }, [open, scheduleMeasure]);

  React.useEffect(() => {
    if (!open) return;

    const handler = () => scheduleMeasure();
    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler);
    };
  }, [open, scheduleMeasure]);

  React.useEffect(() => {
    if (!open) return;
    scheduleMeasure();
  }, [open, scheduleMeasure, size]);

  React.useEffect(() => {
    if (!open) return;

    const selectedIndex = items.findIndex((item) => item.value === value);
    const nextIndex =
      selectedIndex !== -1 && isOptionFocusable(selectedIndex)
        ? selectedIndex
        : getFirstFocusableIndex();

    setActiveIndex(nextIndex);

    if (nextIndex === -1) {
      return;
    }

    const timer = setTimeout(() => {
      focusItem(nextIndex);
    }, 0);

    return () => clearTimeout(timer);
  }, [
    open,
    items,
    value,
    focusItem,
    getFirstFocusableIndex,
    isOptionFocusable,
  ]);

  React.useEffect(() => {
    if (activeIndex === -1) return;
    if (isOptionFocusable(activeIndex)) return;

    setActiveIndex(getFirstFocusableIndex());
  }, [activeIndex, getFirstFocusableIndex, isOptionFocusable, items]);

  React.useEffect(() => {
    if (open) return;

    const timer = setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;

      setOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown, true);
    };
  }, [open]);

  const selectByIndex = React.useCallback(
    (index: number) => {
      const option = items[index];
      if (!option || option.disabled || option.loading) return;

      onChange?.(option.value);
      option.onSelect?.();
      setOpen(false);
    },
    [items, onChange],
  );

  const onTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        scheduleMeasure();
        setOpen(true);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        scheduleMeasure();
        setOpen(true);
      }
    },
    [scheduleMeasure],
  );

  const onListKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "Tab") {
        setOpen(false);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        const first = getFirstFocusableIndex();
        if (first !== -1) {
          setActiveIndex(first);
          focusItem(first);
        }
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        const last = getLastFocusableIndex();
        if (last !== -1) {
          setActiveIndex(last);
          focusItem(last);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = getNextFocusableIndex(activeIndex, 1);
        if (next !== -1) {
          setActiveIndex(next);
          focusItem(next);
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = getNextFocusableIndex(activeIndex, -1);
        if (prev !== -1) {
          setActiveIndex(prev);
          focusItem(prev);
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectByIndex(activeIndex);
      }
    },
    [
      activeIndex,
      focusItem,
      getFirstFocusableIndex,
      getLastFocusableIndex,
      getNextFocusableIndex,
      selectByIndex,
    ],
  );

  const menuPosition = React.useMemo(() => {
    if (!rect) return null;
    if (typeof window === "undefined") return null;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const widthForClamp = menuWidth ?? rect.width;
    const measuredWidth = widthForClamp || rect.width;

    let left = align === "right" ? rect.right - measuredWidth : rect.left;
    const maxLeft = Math.max(GAP_PX, viewportWidth - measuredWidth - GAP_PX);
    left = Math.min(Math.max(GAP_PX, left), maxLeft);

    const spaceBelow = Math.max(viewportHeight - rect.bottom - GAP_PX, 0);
    const spaceAbove = Math.max(rect.top - GAP_PX, 0);
    const openDown = spaceBelow >= spaceAbove;
    const fallbackSpace = Math.max(viewportHeight - GAP_PX * 2, 0);
    const availableSpace = openDown ? spaceBelow : spaceAbove;
    const baseMaxHeight = Math.round(viewportHeight * 0.6);
    const resolvedMaxHeight = Math.max(
      0,
      Math.min(
        baseMaxHeight,
        availableSpace > 0 ? availableSpace : fallbackSpace,
      ),
    );

    const style: React.CSSProperties = {
      position: "fixed",
      left: Math.round(left),
      minWidth: matchTriggerWidth ? Math.round(rect.width) : undefined,
      zIndex: 10_000,
      transformOrigin: openDown ? "top" : "bottom",
    };

    if (resolvedMaxHeight > 0) {
      style.maxHeight = Math.round(resolvedMaxHeight);
    }

    if (openDown) {
      style.top = Math.round(rect.bottom + GAP_PX);
    } else {
      style.bottom = Math.round(viewportHeight - rect.top + GAP_PX);
    }

    return {
      style,
      placement: openDown ? ("bottom" as const) : ("top" as const),
    };
  }, [align, matchTriggerWidth, menuWidth, rect]);

  const placement = menuPosition?.placement ?? "bottom";
  const fixedStyles = menuPosition?.style;
  const yOffset = placement === "bottom" ? -4 : 4;

  const triggerAria =
    ariaLabel ??
    (typeof label === "string"
      ? label
      : typeof prefixLabel === "string"
        ? prefixLabel
        : "Select option");

  const current = React.useMemo(
    () => items.find((item) => item.value === value),
    [items, value],
  );
  const lit = !!current;

  return {
    activeIndex,
    current,
    fixedStyles,
    labelId,
    listRef,
    listboxId,
    lit,
    onListKeyDown,
    onTriggerKeyDown,
    open,
    placement,
    reduceMotion,
    scheduleMeasure,
    selectByIndex,
    setActiveIndex,
    setOpen,
    setTriggerRef,
    triggerAria,
    yOffset,
    durQuick,
  } as const;
}

export type UseAnimatedSelectReturn = ReturnType<typeof useAnimatedSelect>;
