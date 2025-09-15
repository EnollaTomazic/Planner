import * as React from "react";

type FocusableElement = { focus: (options?: FocusOptions) => void };

type UseAutoFocusArgs<T extends FocusableElement> = {
  ref: React.MutableRefObject<T | null> | React.RefObject<T | null>;
  when: boolean;
};

export default function useAutoFocus<T extends FocusableElement>({
  ref,
  when,
}: UseAutoFocusArgs<T>) {
  React.useEffect(() => {
    if (!when) return;

    ref.current?.focus();
  }, [when, ref]);
}
