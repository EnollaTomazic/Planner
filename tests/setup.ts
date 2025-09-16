import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import type { ElementType, ReactNode } from "react";

type ReactModule = typeof import("react");

type StyleElementProps = {
  jsx?: string | boolean;
  global?: string | boolean;
  [key: string]: unknown;
};

vi.mock("react", async () => {
  const actual = (await vi.importActual<ReactModule>("react")) as ReactModule;

  const createElement: ReactModule["createElement"] = ((
    type: ElementType,
    props: StyleElementProps | null,
    ...children: ReactNode[]
  ) => {
    if (typeof type === "string" && type === "style" && props) {
      if (props.jsx === true || props.global === true) {
        const coercedProps: StyleElementProps = { ...props };

        if (coercedProps.jsx === true) {
          coercedProps.jsx = "true";
        }

        if (coercedProps.global === true) {
          coercedProps.global = "true";
        }

        return actual.createElement(type, coercedProps, ...children);
      }
    }

    return actual.createElement(type as ElementType, props as any, ...children);
  }) as ReactModule["createElement"];

  const patched = {
    ...actual,
    createElement,
  } as ReactModule & { default: ReactModule };

  return {
    ...patched,
    default: patched,
  } satisfies ReactModule & { default: ReactModule };
});

vi.mock("next/image", async () => {
  const React = (await vi.importActual<ReactModule>("react")) as ReactModule;
  const MockNextImage = React.forwardRef<HTMLImageElement, any>((props, ref) => {
    const {
      src,
      alt,
      width,
      height,
      style,
      className,
      priority: _priority,
      fill: _fill,
      loader: _loader,
      quality: _quality,
      onLoadingComplete: _onLoadingComplete,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      unoptimized: _unoptimized,
      ...rest
    } = props ?? {};

    return React.createElement("img", {
      ...rest,
      src: typeof src === "string" ? src : "",
      alt,
      width,
      height,
      style,
      className,
      ref,
    });
  });

  MockNextImage.displayName = "MockNextImage";

  return {
    default: MockNextImage,
  };
});

const originalConsoleError = console.error;
vi.spyOn(console, "error").mockImplementation((...args) => {
  const [format, value, attr, ...rest] = args;
  const isStyledJsxWarning =
    typeof format === "string" &&
    format.includes("Received `%s` for a non-boolean attribute `%s`.") &&
    value === "true" &&
    (attr === "jsx" || attr === "global");
  if (isStyledJsxWarning) {
    return;
  }
  originalConsoleError(...args);
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

export function resetLocalStorage() {
  window.localStorage.clear();
}
