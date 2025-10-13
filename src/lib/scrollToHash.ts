const defaultInline: ScrollLogicalPosition = "nearest";
const defaultBlock: ScrollLogicalPosition = "start";

const getCssEscape = (): ((value: string) => string) => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape;
  }

  return (value: string) =>
    value
      .replace(/(^[0-9])/, "\\$1")
      .replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
};

const getDocumentFromContainer = (
  container: ScrollContainer
): Document | null => {
  if (typeof window !== "undefined" && container === window) {
    return window.document;
  }

  if (container instanceof Document) {
    return container;
  }

  if (container instanceof HTMLElement) {
    return container.ownerDocument ?? null;
  }

  return null;
};

type ScrollContainer = Window | Document | HTMLElement;

type ScrollToHashOptions = {
  /**
   * Element or global object that should be scrolled. Defaults to `window`.
   */
  container?: ScrollContainer;
  /**
   * Scroll behavior passed to the underlying `scrollTo`/`scrollIntoView` call.
   */
  behavior?: ScrollBehavior;
  /**
   * Block alignment when using `scrollIntoView` (window scrolling).
   */
  block?: ScrollLogicalPosition;
  /**
   * Inline alignment when using `scrollIntoView` (window scrolling).
   */
  inline?: ScrollLogicalPosition;
  /**
   * When true, focus the target element after scrolling.
   */
  focus?: boolean;
};

const normalizeHash = (hash: string): string => {
  const trimmed = hash.trim();
  if (!trimmed) {
    return "";
  }

  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (!withoutHash) {
    return "";
  }

  try {
    return decodeURIComponent(withoutHash);
  } catch {
    return withoutHash;
  }
};

const findAnchor = (
  hash: string,
  doc: Document
): HTMLElement | null => {
  const normalized = normalizeHash(hash);

  if (!normalized) {
    return null;
  }

  const cssEscape = getCssEscape();
  const escaped = cssEscape(normalized);

  const byId = doc.getElementById(normalized);
  if (byId) {
    return byId;
  }

  const selector = `a[name="${escaped}"], [name="${escaped}"]`;
  const byName = doc.querySelector<HTMLElement>(selector);
  if (byName) {
    return byName;
  }

  return doc.querySelector<HTMLElement>(`[id="${escaped}"]`) ??
    doc.querySelector<HTMLElement>(`[data-anchor="${escaped}"]`);
};

const scrollWithinElement = (
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior
): void => {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const top = targetRect.top - containerRect.top + container.scrollTop;
  const left = targetRect.left - containerRect.left + container.scrollLeft;

  if (typeof container.scrollTo === "function") {
    container.scrollTo({ top, left, behavior });
    return;
  }

  container.scrollTop = top;
  container.scrollLeft = left;
};

const focusElement = (element: HTMLElement): void => {
  if (typeof element.focus !== "function") {
    return;
  }

  const previouslyTabIndex = element.getAttribute("tabindex");

  if (element.tabIndex < 0) {
    element.setAttribute("tabindex", "-1");
  }

  element.focus({ preventScroll: true });

  if (previouslyTabIndex === null && element.tabIndex === -1) {
    element.removeAttribute("tabindex");
  }
};

/**
 * Scrolls to the DOM element referenced by a hash value.
 *
 * @param hash Hash string (with or without the leading `#`). Defaults to the current `window.location.hash` when omitted.
 * @param options Additional scrolling behavior overrides, including custom container support.
 * @returns `true` when a matching element is found and scrolling occurs.
 */
const scrollToHash = (
  hash: string | null | undefined,
  {
    container = typeof window !== "undefined" ? window : undefined,
    behavior = "smooth",
    block = defaultBlock,
    inline = defaultInline,
    focus = false,
  }: ScrollToHashOptions = {}
): boolean => {
  if (typeof window === "undefined" || !container) {
    return false;
  }

  const doc = getDocumentFromContainer(container);
  const target = doc ? findAnchor(hash ?? "", doc) : null;

  if (!target) {
    return false;
  }

  if (container instanceof Document) {
    const scrollingElement = container.scrollingElement ?? container.documentElement;

    if (scrollingElement instanceof HTMLElement) {
      scrollWithinElement(scrollingElement, target, behavior);
    } else {
      target.scrollIntoView({ behavior, block, inline });
    }
  } else if (container instanceof HTMLElement) {
    scrollWithinElement(container, target, behavior);
  } else {
    target.scrollIntoView({ behavior, block, inline });
  }

  if (focus) {
    focusElement(target);
  }

  return true;
};

export type { ScrollToHashOptions };
export default scrollToHash;
