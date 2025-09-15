import * as React from "react";

type DialogRef =
  | React.MutableRefObject<HTMLElement | null>
  | React.RefObject<HTMLElement | null>;

export interface UseDialogTrapOptions {
  open: boolean;
  onClose: () => void;
  ref: DialogRef;
}

const FOCUSABLE_SELECTORS =
  "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])";

export function useDialogTrap({ open, onClose, ref }: UseDialogTrapOptions) {
  React.useEffect(() => {
    if (!open) return;

    const element = ref.current;
    if (!element) return;

    const previouslyActive = document.activeElement as HTMLElement | null;
    const focusable = element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    const first = focusable[0] ?? element;
    const last = focusable[focusable.length - 1] ?? element;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    first?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyActive?.focus?.();
    };
  }, [open, onClose, ref]);
}
