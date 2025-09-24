"use client";

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
  const prev = React.useRef(false);

  React.useEffect(() => {
    if (when && !prev.current) {
      ref.current?.focus();
    }

    prev.current = when;
  }, [when, ref]);
}
