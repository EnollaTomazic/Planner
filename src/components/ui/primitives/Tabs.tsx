"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  type TabBarProps,
  type TabItem, TabBar } from "../layout/TabBar";

interface TabsContextValue<Key extends string> {
  value: Key;
  setValue: (value: Key) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue<string> | null>(null);

function useTabsContext<Key extends string>(): TabsContextValue<Key> {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a <Tabs> provider.");
  }
  return {
    ...context,
    value: context.value as Key,
    setValue: context.setValue as (value: Key) => void,
  };
}

export interface TabsProps<Key extends string = string>
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: Key;
  defaultValue?: Key;
  onValueChange?: (value: Key) => void;
  idBase?: string;
}

export function Tabs<Key extends string = string>({
  value,
  defaultValue,
  onValueChange,
  idBase,
  children,
  className,
  ...rest
}: TabsProps<Key>) {
  const [internal, setInternal] = React.useState<Key | undefined>(defaultValue);
  const controlled = value !== undefined;
  const activeValue = controlled ? value : internal;

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (activeValue === undefined && defaultValue === undefined) {
        console.warn("Tabs requires a value or defaultValue to be provided.");
      }
    }
  }, [activeValue, defaultValue]);

  const resolvedValue = (activeValue ?? defaultValue) as Key;

  const handleValueChange = React.useCallback(
    (next: string) => {
      const typedNext = next as Key;
      if (!controlled) {
        setInternal(typedNext);
      }
      onValueChange?.(typedNext);
    },
    [controlled, onValueChange],
  );

  const generatedId = React.useId();
  const baseId = idBase ?? generatedId;

  const context = React.useMemo<TabsContextValue<string>>(
    () => ({ value: resolvedValue, setValue: handleValueChange, idBase: baseId }),
    [baseId, handleValueChange, resolvedValue],
  );

  return (
    <TabsContext.Provider value={context}>
      <div className={cn("flex flex-col gap-[var(--space-6)]", className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabListItem<Key extends string = string> = TabItem<Key>;

export type TabListProps<
  Key extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
> = Omit<TabBarProps<Key, Extra>, "value" | "onValueChange" | "idBase">;

export function TabList<
  Key extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
>(props: TabListProps<Key, Extra>) {
  const { value, setValue, idBase } = useTabsContext<Key>();
  const { linkPanels, ariaLabel, ariaLabelledBy, ...rest } = props;
  const sharedProps = {
    ...rest,
    linkPanels: linkPanels ?? true,
    value,
    onValueChange: setValue,
    idBase,
  } satisfies Omit<TabBarProps<Key, Extra>, "ariaLabel" | "ariaLabelledBy">;

  if (ariaLabelledBy !== undefined) {
    const labelledProps: TabBarProps<Key, Extra> = {
      ...sharedProps,
      ariaLabelledBy,
      ...(ariaLabel !== undefined ? { ariaLabel } : {}),
    };
    return <TabBar {...labelledProps} />;
  }

  const labelledProps: TabBarProps<Key, Extra> = {
    ...sharedProps,
    ariaLabel: ariaLabel as string,
  };
  return <TabBar {...labelledProps} />;
}

export interface TabPanelProps<Key extends string = string>
  extends React.HTMLAttributes<HTMLDivElement> {
  value: Key;
  forceMount?: boolean;
}

export function TabPanel<Key extends string = string>({
  value,
  children,
  className,
  forceMount = false,
  ...rest
}: TabPanelProps<Key>) {
  const { value: activeValue, idBase } = useTabsContext<Key>();
  const isActive = activeValue === value;
  const panelId = `${idBase}-${value}-panel`;
  const tabId = `${idBase}-${value}-tab`;
  const shouldRender = forceMount || isActive;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-[var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)]",
        className,
      )}
      {...rest}
    >
      {shouldRender ? children : null}
    </div>
  );
}
