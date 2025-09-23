"use client";

import * as React from "react";

type AnyArgs = readonly unknown[];

export default function useDebouncedCallback<TArgs extends AnyArgs>(
  callback: (...args: TArgs) => void | Promise<void>,
  delay: number,
): readonly [(...args: TArgs) => void, () => void] {
  const latestCallback = React.useRef(callback);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  const cancel = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => cancel, [cancel]);

  React.useEffect(() => {
    cancel();
  }, [delay, cancel]);

  const debounced = React.useCallback(
    (...args: TArgs) => {
      cancel();

      if (delay <= 0) {
        void latestCallback.current(...args);
        return;
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void latestCallback.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  return React.useMemo(() => [debounced, cancel] as const, [debounced, cancel]);
}
