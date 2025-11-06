"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { SegmentedButton } from "./SegmentedButton";

const GlitchSegmentedContext = React.createContext<GlitchSegmentedContextValue | null>(
  null,
);

function useGlitchSegmentedContext(component: string) {
  const context = React.useContext(GlitchSegmentedContext)
  if (!context) {
    throw new Error(`${component} must be used within a <GlitchSegmentedGroup />`)
  }
  return context
}

type GlitchSegmentedValue = string

type GlitchSegmentedItem = {
  value: GlitchSegmentedValue
  ref: HTMLButtonElement | null
  disabled: boolean
}

type GlitchSegmentedContextValue = {
  value: GlitchSegmentedValue
  select: (value: GlitchSegmentedValue) => void
  register: (
    value: GlitchSegmentedValue,
    node: HTMLButtonElement | null,
    disabled: boolean,
  ) => void
  unregister: (value: GlitchSegmentedValue) => void
  getEnabledItems: () => GlitchSegmentedItem[]
}

export type GlitchSegmentedGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value: GlitchSegmentedValue
  onChange: (value: GlitchSegmentedValue) => void
}

export function GlitchSegmentedGroup({
  value,
  onChange,
  className,
  children,
  onKeyDown,
  ...rest
}: GlitchSegmentedGroupProps) {
  const itemsRef = React.useRef<GlitchSegmentedItem[]>([])

  const register = React.useCallback<GlitchSegmentedContextValue["register"]>(
    (val, node, disabled) => {
      itemsRef.current = (() => {
        const existingIndex = itemsRef.current.findIndex(
          (item) => item.value === val,
        )
        const nextItem: GlitchSegmentedItem = { value: val, ref: node, disabled }
        if (existingIndex === -1) {
          return [...itemsRef.current, nextItem]
        }
        const next = itemsRef.current.slice()
        next[existingIndex] = nextItem
        return next
      })()
    },
    [],
  )

  const unregister = React.useCallback<GlitchSegmentedContextValue["unregister"]>(
    (val) => {
      itemsRef.current = itemsRef.current.filter((item) => item.value !== val)
    },
    [],
  )

  const select = React.useCallback<GlitchSegmentedContextValue["select"]>(
    (nextValue) => {
      if (nextValue === value) return
      onChange(nextValue)
    },
    [onChange, value],
  )

  const getEnabledItems = React.useCallback<GlitchSegmentedContextValue["getEnabledItems"]>(
    () =>
      itemsRef.current.filter((item) => item.ref !== null && !item.disabled),
    [],
  )

  const contextValue = React.useMemo<GlitchSegmentedContextValue>(
    () => ({ value, select, register, unregister, getEnabledItems }),
    [value, select, register, unregister, getEnabledItems],
  )

  const focusItem = React.useCallback(
    (targetValue: GlitchSegmentedValue) => {
      const match = itemsRef.current.find((item) => item.value === targetValue)
      match?.ref?.focus({ preventScroll: true })
    },
    [],
  )

  const handleKeyDown = React.useCallback<
    NonNullable<React.HTMLAttributes<HTMLDivElement>["onKeyDown"]>
  >(
    (event) => {
      let handled = false
      const enabledItems = getEnabledItems()
      if (enabledItems.length > 0) {
        const activeElement = document.activeElement
        let currentIndex = enabledItems.findIndex(
          (item) => item.ref === activeElement,
        )
        if (currentIndex === -1) {
          currentIndex = enabledItems.findIndex((item) => item.value === value)
        }
        if (currentIndex === -1) {
          currentIndex = 0
        }

        const lastIndex = enabledItems.length - 1
        let targetValue: GlitchSegmentedValue | null = null

        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            targetValue = enabledItems[(currentIndex + 1) % enabledItems.length]?.value ?? null
            break
          case "ArrowLeft":
          case "ArrowUp":
            targetValue =
              enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]
                ?.value ?? null
            break
          case "Home":
            targetValue = enabledItems[0]?.value ?? null
            break
          case "End":
            targetValue = enabledItems[lastIndex]?.value ?? null
            break
          default:
            break
        }

        if (targetValue) {
          handled = true
          focusItem(targetValue)
          select(targetValue)
        }
      }

      if (handled) {
        event.preventDefault()
      }

      onKeyDown?.(event)
    },
    [focusItem, getEnabledItems, onKeyDown, select, value],
  )

  return (
    <GlitchSegmentedContext.Provider value={contextValue}>
      <div
        role="tablist"
        className={cn(
          "flex flex-wrap gap-[var(--space-1)]",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </GlitchSegmentedContext.Provider>
  )
}

type SegmentedElement = React.ElementRef<typeof SegmentedButton>

type BaseSegmentedButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof SegmentedButton>,
  "selected" | "glitch" | "role" | "tabIndex" | "aria-pressed"
>

export type GlitchSegmentedButtonProps = BaseSegmentedButtonProps & {
  value: GlitchSegmentedValue
}

export const GlitchSegmentedButton = React.forwardRef<
  SegmentedElement,
  GlitchSegmentedButtonProps
>(function GlitchSegmentedButton(
  { value: buttonValue, onClick, disabled, loading, ...rest },
  forwardedRef,
) {
  const { value, select, register, unregister } =
    useGlitchSegmentedContext("GlitchSegmentedButton")
  const localRef = React.useRef<HTMLButtonElement | null>(null)
  const mergedDisabled = Boolean(disabled || loading)

  const setRefs = React.useCallback(
    (node: SegmentedElement | null) => {
      const buttonNode = node as HTMLButtonElement | null
      localRef.current = buttonNode
      register(buttonValue, buttonNode, mergedDisabled)
      if (typeof forwardedRef === "function") {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [buttonValue, forwardedRef, mergedDisabled, register],
  )

  React.useEffect(() => {
    register(buttonValue, localRef.current, mergedDisabled)
    return () => {
      unregister(buttonValue)
    }
  }, [buttonValue, mergedDisabled, register, unregister])

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)
      if (event.defaultPrevented) {
        return
      }
      if (!mergedDisabled) {
        select(buttonValue)
      }
    },
    [buttonValue, mergedDisabled, onClick, select],
  )

  const selected = value === buttonValue

  return (
    <SegmentedButton
      ref={setRefs}
      glitch
      selected={selected}
      disabled={disabled}
      loading={loading}
      role="tab"
      aria-selected={selected}
      aria-pressed={undefined}
      tabIndex={selected ? 0 : -1}
      type="button"
      onClick={handleClick}
      {...rest}
    />
  )
})
