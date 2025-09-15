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
    if (!open) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const doc = element.ownerDocument ?? document;
    const previouslyActive = doc.activeElement as HTMLElement | null;
    const restoreTabIndex = new Set<HTMLElement>();

    const getFocusable = () =>
      Array.from(
        element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((node) => !node.hasAttribute("disabled"));

    const focusElement = (node: HTMLElement | undefined | null) => {
      if (!node) {
        return;
      }

      if (!node.hasAttribute("tabindex") && node.tabIndex < 0) {
        node.setAttribute("tabindex", "-1");
        restoreTabIndex.add(node);
      }

      node.focus({ preventScroll: true });
    };

    const focusFirst = () => {
      const [first] = getFocusable();
      focusElement(first ?? element);
    };

    const focusLast = () => {
      const focusable = getFocusable();
      focusElement(focusable[focusable.length - 1] ?? element);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable();
      const hasFocusable = focusable.length > 0;
      const active = doc.activeElement as HTMLElement | null;
      const target = event.target as Node | null;
      const isInDialog = target ? element.contains(target) : false;

      if (!hasFocusable) {
        event.preventDefault();
        focusElement(element);
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!isInDialog) {
        event.preventDefault();
        focusElement(first);
        return;
      }

      if (event.shiftKey) {
        if (active === first || active === element) {
          event.preventDefault();
          focusLast();
        }
        return;
      }

      if (active === last || active === element) {
        event.preventDefault();
        focusFirst();
      }
    };

    doc.addEventListener("keydown", handleKeyDown);

    const previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = "hidden";

    focusFirst();

    return () => {
      doc.removeEventListener("keydown", handleKeyDown);
      doc.body.style.overflow = previousOverflow;
      restoreTabIndex.forEach((node) => {
        node.removeAttribute("tabindex");
      });
      previouslyActive?.focus?.();
    };
  }, [open, onClose, ref]);
}
