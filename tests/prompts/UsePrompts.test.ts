import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { Prompt, PromptWithTitle } from "@/components/prompts";

const mockInitialPrompts: Prompt[] = [];

const fuseModuleLoad = vi.fn();
const fuseConstructor = vi.fn();
const fuseSearchMock = vi.fn();
const fuseSetCollectionMock = vi.fn();

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T>(_key: string, _initial: T, _options?: unknown) =>
      React.useState(mockInitialPrompts as T),
  };
});

vi.mock("fuse.js", () => {
  fuseModuleLoad();
  return {
    default: class FuseMock<T> {
      public constructor(collection: ReadonlyArray<T>) {
        fuseConstructor(collection);
      }

      public search(pattern: string): Array<{ item: T }> {
        return fuseSearchMock(pattern);
      }

      public setCollection(collection: ReadonlyArray<T>) {
        fuseSetCollectionMock(collection);
      }
    },
  };
});

import { useChatPrompts } from "@/components/prompts";

describe("UsePrompts", () => {
  beforeEach(() => {
    mockInitialPrompts.length = 0;
    fuseModuleLoad.mockReset();
    fuseConstructor.mockReset();
    fuseSearchMock.mockReset();
    fuseSetCollectionMock.mockReset();
  });

  it("uses the first non-empty line", () => {
    mockInitialPrompts.push({
      id: "p1",
      title: "",
      text: "\n\nHello world\nMore",
      createdAt: 0,
    });
    const { result } = renderHook(() => useChatPrompts());
    expect(result.current.filtered[0].title).toBe("Hello world");
    expect(fuseModuleLoad).not.toHaveBeenCalled();
  });

  it("does not load Fuse when the query is empty", () => {
    mockInitialPrompts.push({
      id: "p2",
      title: "Saved",
      text: "Saved prompt",
      createdAt: 0,
    });
    const { result } = renderHook(() => useChatPrompts());
    expect(result.current.prompts).toHaveLength(1);
    expect(fuseModuleLoad).not.toHaveBeenCalled();
  });

  it("lazy loads Fuse when searching", async () => {
    mockInitialPrompts.push(
      {
        id: "p3",
        title: "",
        text: "Plan sprint",
        createdAt: 0,
      },
      {
        id: "p4",
        title: "",
        text: "Team retro",
        createdAt: 1,
      },
    );

    const match: PromptWithTitle = {
      id: "p4",
      title: "Team retro",
      text: "Team retro",
      createdAt: 1,
    };

    fuseSearchMock.mockReturnValue([{ item: match }]);

    const { result } = renderHook(() => useChatPrompts());

    act(() => {
      result.current.setQuery("retro");
    });

    await waitFor(() => expect(fuseModuleLoad).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(fuseConstructor).toHaveBeenCalledTimes(1);
      expect(fuseSearchMock).toHaveBeenCalledWith("retro");
      expect(result.current.filtered).toEqual([expect.objectContaining({ id: "p4" })]);
    });
  });
});
