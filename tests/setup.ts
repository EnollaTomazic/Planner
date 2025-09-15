import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
