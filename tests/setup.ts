import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
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

  const formatId = (value: string) =>
    value.replace(/\u00ab/g, ":").replace(/\u00bb/g, ":");

  const useId: ReactModule["useId"] = () => formatId(actual.useId());

  const patched = {
    ...actual,
    createElement,
    useId,
  } as ReactModule & { default: ReactModule };

  return {
    ...patched,
    default: patched,
  } satisfies ReactModule & { default: ReactModule };
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

afterEach(() => {
  cleanup();
});
