"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsValue = string;

type TabRegistration<K extends TabsValue> = {
  value: K;
  ref: React.RefObject<HTMLButtonElement | null>;
  id: string;
  panelId: string;
  disabled: boolean;
  order: number;
};

type TabsContextValue<K extends TabsValue> = {
  idBase: string;
  activeValue: K;
  setActiveValue: (value: K) => void;
  registerTab: (registration: TabRegistration<K>) => () => void;
  getTabs: () => TabRegistration<K>[];
  focusTab: (value: K) => void;
  getTabByValue: (value: K) => TabRegistration<K> | undefined;
};

const TabsContext = React.createContext<TabsContextValue<string> | null>(null);

function useTabsContext<K extends TabsValue>() {
  const context = React.useContext(TabsContext) as TabsContextValue<K> | null;
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>.");
  }
  return context;
}

type TabsOwnProps<K extends TabsValue> = {
  value?: K;
  defaultValue?: K;
  onValueChange?: (value: K) => void;
  idBase?: string;
};

export type TabsProps<K extends TabsValue = string> = TabsOwnProps<K> &
  React.HTMLAttributes<HTMLDivElement>;

export function Tabs<K extends TabsValue = string>({
  value,
  defaultValue,
  onValueChange,
  idBase,
  className,
  children,
  ...rest
}: TabsProps<K>) {
  const isControlled = typeof value !== "undefined";
  const [internalValue, setInternalValue] = React.useState<K>(() => {
    if (typeof value !== "undefined") return value;
    if (typeof defaultValue !== "undefined") return defaultValue;
    return "" as K;
  });

  const activeValue = (isControlled ? value : internalValue) ?? ("" as K);

  const tabsRef = React.useRef<Array<TabRegistration<K>>>([]);
  const autoId = React.useId();
  const baseId = idBase ?? autoId;

  const setValue = React.useCallback(
    (next: K) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      if (onValueChange) {
        onValueChange(next);
      }
    },
    [isControlled, onValueChange],
  );

  const registerTab = React.useCallback(
    (registration: TabRegistration<K>) => {
      tabsRef.current = tabsRef.current
        .filter((tab) => tab.value !== registration.value)
        .concat(registration)
        .sort((a, b) => a.order - b.order);

      return () => {
        tabsRef.current = tabsRef.current.filter(
          (tab) => tab.value !== registration.value,
        );
      };
    },
    [],
  );

  const getTabs = React.useCallback(() => [...tabsRef.current], []);

  const getTabByValue = React.useCallback(
    (nextValue: K) => tabsRef.current.find((tab) => tab.value === nextValue),
    [],
  );

  const focusTab = React.useCallback((nextValue: K) => {
    const target = tabsRef.current.find((tab) => tab.value === nextValue);
    target?.ref.current?.focus();
  }, []);

  React.useEffect(() => {
    if (isControlled) return;
    const tabs = tabsRef.current;
    if (tabs.length === 0) return;
    const current = tabs.find((tab) => tab.value === activeValue && !tab.disabled);
    if (current) return;
    const fallback =
      tabs.find((tab) => !tab.disabled)?.value ?? tabs[0]?.value ?? activeValue;
    if (fallback !== activeValue) {
      setInternalValue(fallback as K);
    }
  }, [activeValue, isControlled]);

  const contextValue = React.useMemo<TabsContextValue<K>>(
    () => ({
      idBase: baseId,
      activeValue,
      setActiveValue: setValue,
      registerTab,
      getTabs,
      focusTab,
      getTabByValue,
    }),
    [activeValue, baseId, focusTab, getTabByValue, getTabs, registerTab, setValue],
  );

  return (
    <TabsContext.Provider
      value={contextValue as unknown as TabsContextValue<string>}
    >
      <div data-tabs-root className={className} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabListContextValue = {
  assignOrder: () => number;
};

const TabListContext = React.createContext<TabListContextValue | null>(null);

function useTabListContext() {
  const context = React.useContext(TabListContext);
  if (!context) {
    throw new Error("<Tab> must be used inside a <TabList>.");
  }
  return context;
}

type AriaLabelProps =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: string; ariaLabelledBy: string };

export type TabListProps = React.HTMLAttributes<HTMLDivElement> &
  AriaLabelProps;

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ className, children, ariaLabel, ariaLabelledBy, ...rest }, ref) => {
    const tabs = useTabsContext();
    const orderRef = React.useRef(0);
    orderRef.current = 0;

    const assignOrder = React.useCallback(() => {
      orderRef.current += 1;
      return orderRef.current;
    }, []);

    const a11yLabel =
      typeof ariaLabel === "string" && ariaLabel.trim().length > 0
        ? ariaLabel.trim()
        : undefined;
    const a11yLabelledBy =
      typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
        ? ariaLabelledBy.trim()
        : undefined;

    React.useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (!a11yLabel && !a11yLabelledBy) {
          console.warn(
            "TabList requires either ariaLabel or ariaLabelledBy to describe the tablist.",
          );
        }
      }
    }, [a11yLabel, a11yLabelledBy]);

    const handleKeyDown = React.useCallback<
      React.KeyboardEventHandler<HTMLDivElement>
    >(
      (event) => {
        const { key } = event;
        if (!tabs) return;
        if (![
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(key)) {
          return;
        }
        event.preventDefault();
        const available = tabs.getTabs().filter((tab) => !tab.disabled);
        if (available.length === 0) return;
        const currentIndex = available.findIndex(
          (tab) => tab.value === tabs.activeValue,
        );
        let nextIndex = currentIndex;
        if (key === "Home") nextIndex = 0;
        else if (key === "End") nextIndex = available.length - 1;
        else if (key === "ArrowLeft") {
          nextIndex = currentIndex <= 0 ? available.length - 1 : currentIndex - 1;
        } else if (key === "ArrowRight") {
          nextIndex = currentIndex >= available.length - 1 ? 0 : currentIndex + 1;
        }
        const next = available[nextIndex] ?? available[0];
        tabs.setActiveValue(next.value);
        tabs.focusTab(next.value);
      },
      [tabs],
    );

    return (
      <TabListContext.Provider value={{ assignOrder }}>
        <div
          ref={ref}
          role="tablist"
          className={cn(
            "inline-flex max-w-full items-center gap-[var(--space-2)] rounded-card border border-border/30 bg-card/70 p-[var(--space-2)] shadow-inner",
            className,
          )}
          aria-label={a11yLabel}
          aria-labelledby={a11yLabelledBy}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </div>
      </TabListContext.Provider>
    );
  },
);
TabList.displayName = "TabList";

type TabProps<K extends TabsValue = string> =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: K;
  };

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ value, className, onClick, disabled, id, children, ...rest }, ref) => {
    const tabs = useTabsContext<string>();
    const list = useTabListContext();
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);

    const setButtonRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );

    const orderRef = React.useRef<number | null>(null);
    if (orderRef.current === null) {
      orderRef.current = list.assignOrder();
    }

    const tabId = id ?? `${tabs.idBase}-tab-${value}`;
    const panelId = `${tabs.idBase}-panel-${value}`;

    const isActive = tabs.activeValue === value;

    React.useLayoutEffect(() => {
      const cleanup = tabs.registerTab({
        value: value as string,
        ref: buttonRef,
        id: tabId,
        panelId,
        disabled: Boolean(disabled),
        order: orderRef.current ?? 0,
      });
      return cleanup;
    }, [disabled, panelId, tabId, tabs, value]);

    const handleClick = React.useCallback<
      React.MouseEventHandler<HTMLButtonElement>
    >(
      (event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
        if (event.defaultPrevented) return;
        tabs.setActiveValue(value as string);
      },
      [disabled, onClick, tabs, value],
    );

    return (
      <button
        {...rest}
        ref={setButtonRef}
        type="button"
        id={tabId}
        role="tab"
        aria-selected={isActive}
        aria-controls={panelId}
        aria-disabled={disabled || undefined}
        tabIndex={isActive ? 0 : -1}
        data-active={isActive ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        className={cn(
          "btn-like-segmented px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium transition-colors",
          isActive && "is-active",
          disabled && "pointer-events-none opacity-[var(--disabled)]",
          className,
        )}
        onClick={handleClick}
      >
        <span className="truncate">{children}</span>
      </button>
    );
  },
);
Tab.displayName = "Tab";

type TabPanelProps<K extends TabsValue = string> =
  React.HTMLAttributes<HTMLDivElement> & {
    value: K;
  };

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className, children, id, ...rest }, ref) => {
    const tabs = useTabsContext<string>();
    const record = tabs.getTabByValue(value as string);
    const panelId = id ?? record?.panelId ?? `${tabs.idBase}-panel-${value}`;
    const labelledBy = record?.id ?? `${tabs.idBase}-tab-${value}`;
    const isActive = tabs.activeValue === value;

    return (
      <div
        {...rest}
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={labelledBy}
        hidden={!isActive}
        tabIndex={isActive ? 0 : -1}
        data-active={isActive ? "true" : undefined}
        className={cn(
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
TabPanel.displayName = "TabPanel";

export default Tabs;
