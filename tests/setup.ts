import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

if (typeof process !== "undefined") {
  if (process.env.NEXT_PUBLIC_SAFE_MODE === undefined) {
    process.env.NEXT_PUBLIC_SAFE_MODE = "true";
  }

  if (process.env.SAFE_MODE === undefined) {
    process.env.SAFE_MODE = "true";
  }
}

type ReactModule = typeof import("react");

type StyleElementProps = {
  jsx?: string | boolean;
  global?: string | boolean;
  [key: string]: unknown;
};

type CreateElementParams = Parameters<ReactModule["createElement"]>;
type CreateElementProps = CreateElementParams[1];

const isStyleElementProps = (
  value: CreateElementProps,
): value is CreateElementProps & StyleElementProps =>
  value !== null && typeof value === "object";

vi.mock("react", async () => {
  const actual = (await vi.importActual<ReactModule>("react")) as ReactModule;

  const createElement = (
    ...args: CreateElementParams
  ): ReturnType<ReactModule["createElement"]> => {
    const [type, props, ...children] = args;

    if (type === "style" && isStyleElementProps(props)) {
      if (props.jsx === true || props.global === true) {
        const coercedProps: CreateElementProps & StyleElementProps = {
          ...props,
        };

        if (coercedProps.jsx === true) {
          coercedProps.jsx = "true";
        }

        if (coercedProps.global === true) {
          coercedProps.global = "true";
        }

        return actual.createElement(type, coercedProps, ...children);
      }
    }

    return actual.createElement(type, props, ...children);
  };

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

const DOCUMENT_THEME_DATA_ATTRIBUTES = [
  "data-theme-pref",
  "data-glitch-landing",
  "data-depth-theme",
  "data-organic-depth",
] as const;

const BODY_THEME_DATA_ATTRIBUTES = [
  "data-glitch-landing",
  "data-depth-theme",
  "data-organic-depth",
] as const;

afterEach(() => {
  cleanup();

  if (typeof document === "undefined") {
    return;
  }

  const { documentElement, body } = document;

  if (documentElement) {
    documentElement.className = "";
    documentElement.style.colorScheme = "";

    for (const attribute of DOCUMENT_THEME_DATA_ATTRIBUTES) {
      documentElement.removeAttribute(attribute);
    }
  }

  if (body) {
    for (const attribute of BODY_THEME_DATA_ATTRIBUTES) {
      body.removeAttribute(attribute);
    }
  }
});

export function resetLocalStorage() {
  window.localStorage.clear();
}
