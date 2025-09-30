"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import TabBar, {
  type TabBarProps,
  type TabItem,
} from "../layout/TabBar";

interface TabsContextValue<Key extends string> {
  value: Key;
  setValue: (value: Key) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue<string> | null>(null);

function useTabsContext<Key extends string>() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a <Tabs> provider.");
  }
  return context as unknown as TabsContextValue<Key>;
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
    (next: Key) => {
      if (!controlled) {
        setInternal(next);
      }
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  const generatedId = React.useId();
  const baseId = idBase ?? generatedId;

  const context = React.useMemo<TabsContextValue<Key>>(
    () => ({ value: resolvedValue, setValue: handleValueChange, idBase: baseId }),
    [baseId, handleValueChange, resolvedValue],
  );

  return (
    <TabsContext.Provider value={context as unknown as TabsContextValue<string>}>
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
> = Omit<TabBarProps<Key, Extra>, "value" | "onValueChange" | "idBase"> & {
  value?: never;
  onValueChange?: never;
  idBase?: never;
};

export function TabList<
  Key extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
>(props: TabListProps<Key, Extra>) {
  const { value, setValue, idBase } = useTabsContext<Key>();
  const { linkPanels = true, ...rest } = props;
  const tabBarProps = rest as unknown as TabBarProps<Key, Extra>;
  return (
    <TabBar
      {...tabBarProps}
      value={value}
      onValueChange={setValue}
      idBase={idBase}
      linkPanels={linkPanels}
    />
  );
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
        "focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-glow-md focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)]",
        className,
      )}
      {...rest}
    >
      {shouldRender ? children : null}
    </div>
  );
}

export default Tabs;
