import * as React from "react";

type FocusAction<TTab> = { tab: TTab };

type FocusLoopResult<TAction extends FocusAction<unknown>> = {
  requestFocus: (action: TAction) => boolean;
};

export function useFocusLoop<TTab, TAction extends FocusAction<TTab>>(
  activeTab: TTab,
  tryFocus: (action: TAction) => boolean,
): FocusLoopResult<TAction> {
  const pendingFocusRef = React.useRef<TAction | null>(null);
  const focusLoopRef = React.useRef<number | null>(null);
  const activeTabRef = React.useRef(activeTab);

  const ensureFocusLoop = React.useCallback(() => {
    if (focusLoopRef.current != null) {
      return;
    }

    const step = () => {
      const pending = pendingFocusRef.current;
      if (!pending) {
        focusLoopRef.current = null;
        return;
      }

      if (pending.tab === activeTabRef.current && tryFocus(pending)) {
        pendingFocusRef.current = null;
        focusLoopRef.current = null;
        return;
      }

      focusLoopRef.current = window.requestAnimationFrame(step);
    };

    focusLoopRef.current = window.requestAnimationFrame(step);
  }, [tryFocus]);

  React.useEffect(() => {
    activeTabRef.current = activeTab;
    if (pendingFocusRef.current && focusLoopRef.current == null) {
      ensureFocusLoop();
    }
  }, [activeTab, ensureFocusLoop]);

  React.useEffect(() => {
    return () => {
      if (focusLoopRef.current != null) {
        window.cancelAnimationFrame(focusLoopRef.current);
        focusLoopRef.current = null;
      }
    };
  }, []);

  const requestFocus = React.useCallback(
    (action: TAction) => {
      if (action.tab === activeTabRef.current && tryFocus(action)) {
        pendingFocusRef.current = null;
        return true;
      }

      pendingFocusRef.current = action;
      ensureFocusLoop();
      return false;
    },
    [ensureFocusLoop, tryFocus],
  );

  return { requestFocus };
}
