"use client";

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

const BODY_DIALOG_LOCK_ATTRIBUTE = "data-dialog-lock";
const BODY_DIALOG_LOCK_VALUE = "true";

const dialogLockCounts = new WeakMap<Document, number>();

const lockBody = (doc: Document) => {
  const body = doc.body;
  if (!body) {
    return;
  }

  const current = dialogLockCounts.get(doc) ?? 0;
  if (current === 0) {
    body.setAttribute(BODY_DIALOG_LOCK_ATTRIBUTE, BODY_DIALOG_LOCK_VALUE);
  }

  dialogLockCounts.set(doc, current + 1);
};

const unlockBody = (doc: Document) => {
  const body = doc.body;
  if (!body) {
    return;
  }

  const current = dialogLockCounts.get(doc);
  if (!current) {
    return;
  }

  const next = current - 1;
  if (next <= 0) {
    dialogLockCounts.delete(doc);
    if (body.getAttribute(BODY_DIALOG_LOCK_ATTRIBUTE) === BODY_DIALOG_LOCK_VALUE) {
      body.removeAttribute(BODY_DIALOG_LOCK_ATTRIBUTE);
    }
    return;
  }

  dialogLockCounts.set(doc, next);
};

export function useDialogTrap({ open, onClose, ref }: UseDialogTrapOptions) {
  const focusableRef = React.useRef<HTMLElement[]>([]);

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

    lockBody(doc);

    const updateFocusable = () => {
      const nodes = Array.from(
        element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((node) => !node.hasAttribute("disabled"));

      focusableRef.current = nodes;
    };
    updateFocusable();

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
      const [first] = focusableRef.current;
      focusElement(first ?? element);
    };

    const focusLast = () => {
      const focusable = focusableRef.current;
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

      const focusable = focusableRef.current;
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

    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            updateFocusable();
          })
        : null;

    observer?.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["tabindex", "disabled", "aria-hidden", "hidden"],
    });

    focusFirst();

    return () => {
      observer?.disconnect();
      doc.removeEventListener("keydown", handleKeyDown);
      unlockBody(doc);
      restoreTabIndex.forEach((node) => {
        node.removeAttribute("tabindex");
      });
      previouslyActive?.focus?.();
      focusableRef.current = [];
    };
  }, [open, onClose, ref]);
}
