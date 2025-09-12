import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Prompt } from "@/components/prompts";

const mockInitialPrompts: Prompt[] = [];

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T>(_key: string, _initial: T) =>
      React.useState(mockInitialPrompts as T),
  };
});

import { usePrompts } from "@/components/prompts";

describe("deriveTitle", () => {
  it("uses the first non-empty line", () => {
    mockInitialPrompts.length = 0;
    mockInitialPrompts.push({
      id: "p1",
      title: "",
      text: "\n\nHello world\nMore",
      createdAt: 0,
    });
    const { result } = renderHook(() => usePrompts());
    expect(result.current.filtered[0].title).toBe("Hello world");
  });
});
