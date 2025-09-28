"use client";

import * as React from "react";

export type VirtualizedSpacerRenderProps = {
  position: "start" | "end";
  spacerId: string;
  ariaHiddenProps: {
    "aria-hidden": true;
  };
};

type VirtualizedSpacerProps = {
  height: number;
  position: "start" | "end";
  render?: (props: VirtualizedSpacerRenderProps) => React.ReactNode;
};

export type RenderSpacer = (
  height: number,
  position: "start" | "end",
) => React.ReactNode;

type VirtualizedListProps<Item> = {
  items: readonly Item[];
  rowHeight: number;
  overscan?: number;
  renderItem: (item: Item, index: number) => React.ReactElement;
  getKey?: (item: Item, index: number) => React.Key;
  scrollParentRef: React.RefObject<HTMLElement | null>;
  renderSpacer?: RenderSpacer;
};

function useSpacerId(position: "start" | "end") {
  const reactId = React.useId();
  return React.useMemo(
    () =>
      `virtualized-spacer-${reactId
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .concat("-", position)}`,
    [reactId, position],
  );
}

export function VirtualizedSpacer({
  height,
  position,
  render,
}: VirtualizedSpacerProps) {
  const spacerId = useSpacerId(position);
  const ariaHiddenProps = React.useMemo(
    () => ({ "aria-hidden": true as const }),
    [],
  );
  const selector = React.useMemo(
    () => `[data-spacer-id="${spacerId}"]`,
    [spacerId],
  );
  const blockSize = React.useMemo(
    () => `${Math.max(0, height)}px`,
    [height],
  );

  return (
    <>
      {render ? (
        render({ position, spacerId, ariaHiddenProps })
      ) : (
        <div {...ariaHiddenProps} data-spacer-id={spacerId} />
      )}
      <style jsx>{`
        ${selector} {
          block-size: ${blockSize};
          height: ${blockSize};
        }
      `}</style>
    </>
  );
}

const defaultRenderSpacer: RenderSpacer = (height, position) => (
  <VirtualizedSpacer height={height} position={position} />
);

function useViewportMeasurements(
  ref: React.RefObject<HTMLElement | null>,
): { scrollTop: number; viewportHeight: number } {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const target = ref.current;
    if (!target) return;

    let frame = 0;
    const updateScroll = () => {
      const nextTop = target.scrollTop;
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrollTop(nextTop);
      });
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            setViewportHeight(target.clientHeight);
          });

    setViewportHeight(target.clientHeight);
    updateScroll();

    target.addEventListener("scroll", updateScroll, { passive: true });
    resizeObserver?.observe(target);

    return () => {
      target.removeEventListener("scroll", updateScroll);
      resizeObserver?.disconnect();
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [ref]);

  return React.useMemo(
    () => ({ scrollTop, viewportHeight }),
    [scrollTop, viewportHeight],
  );
}

function clampScrollTop(
  itemsLength: number,
  rowHeight: number,
  viewportHeight: number,
  scrollTop: number,
) {
  if (itemsLength === 0) return 0;
  const maxScroll = Math.max(0, itemsLength * rowHeight - viewportHeight);
  if (scrollTop > maxScroll) {
    return maxScroll;
  }
  if (scrollTop < 0) {
    return 0;
  }
  return scrollTop;
}

function VirtualizedList<Item>({
  items,
  rowHeight,
  overscan = 6,
  renderItem,
  getKey,
  scrollParentRef,
  renderSpacer = defaultRenderSpacer,
}: VirtualizedListProps<Item>) {
  const containerRef = scrollParentRef;
  if (!containerRef) {
    throw new Error(
      "VirtualizedList requires a scrollParentRef pointing to a scrollable element.",
    );
  }

  const { scrollTop, viewportHeight } = useViewportMeasurements(containerRef);

  const clampedScrollTop = React.useMemo(
    () => clampScrollTop(items.length, rowHeight, viewportHeight, scrollTop),
    [items.length, rowHeight, viewportHeight, scrollTop],
  );

  const { startIndex, endIndex, offsetStart, offsetEnd } = React.useMemo(() => {
    if (items.length === 0 || rowHeight <= 0) {
      return { startIndex: 0, endIndex: -1, offsetStart: 0, offsetEnd: 0 };
    }

    const safeViewport = viewportHeight || rowHeight;
    const rawStart = Math.floor(clampedScrollTop / rowHeight);
    const startIndex = Math.max(0, rawStart - overscan);
    const itemsInView = Math.ceil(safeViewport / rowHeight) + overscan * 2;
    const endIndex = Math.min(items.length - 1, startIndex + itemsInView - 1);

    const offsetStart = startIndex * rowHeight;
    const offsetEnd = Math.max(
      0,
      items.length * rowHeight - (endIndex + 1) * rowHeight,
    );

    return { startIndex, endIndex, offsetStart, offsetEnd };
  }, [
    items.length,
    rowHeight,
    viewportHeight,
    clampedScrollTop,
    overscan,
  ]);

  if (endIndex < startIndex) {
    return null;
  }

  const children: React.ReactNode[] = [];

  if (offsetStart > 0) {
    children.push(
      <React.Fragment key="spacer-start">
        {renderSpacer(offsetStart, "start")}
      </React.Fragment>,
    );
  }

  for (let index = startIndex; index <= endIndex; index += 1) {
    const item = items[index];
    const element = renderItem(item, index);
    const key = element.key ?? getKey?.(item, index) ?? index;
    children.push(React.cloneElement(element, { key }));
  }

  if (offsetEnd > 0) {
    children.push(
      <React.Fragment key="spacer-end">
        {renderSpacer(offsetEnd, "end")}
      </React.Fragment>,
    );
  }

  return <>{children}</>;
}

export default React.memo(VirtualizedList) as typeof VirtualizedList;
