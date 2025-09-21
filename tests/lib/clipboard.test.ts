import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "@/lib/clipboard";

type ClipboardStub = Partial<Pick<Clipboard, "writeText" | "write">>;

describe("copyText", () => {
  const originalClipboardItem = globalThis.ClipboardItem;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalClipboardItem) {
      globalThis.ClipboardItem = originalClipboardItem;
    } else {
      delete (globalThis as { ClipboardItem?: unknown }).ClipboardItem;
    }
  });

  it("uses navigator.clipboard.writeText when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clipboard = {
      writeText: writeText as unknown as Clipboard["writeText"],
    } satisfies ClipboardStub;
    vi.stubGlobal("navigator", { clipboard } as unknown as Navigator);

    const appendChild = vi.fn();
    const createElement = vi.fn();
    const execCommand = vi.fn();
    const removeAllRanges = vi.fn();
    const getSelection = vi.fn(() => ({ removeAllRanges } as unknown as Selection));
    const documentMock = {
      body: { appendChild } as unknown as HTMLBodyElement,
      createElement: createElement as unknown as Document["createElement"],
      execCommand: execCommand as unknown as Document["execCommand"],
      getSelection: getSelection as unknown as Document["getSelection"],
    } as unknown as Document;
    vi.stubGlobal("document", documentMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await copyText("primary");

    expect(writeText).toHaveBeenCalledWith("primary");
    expect(createElement).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
    expect(removeAllRanges).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("falls back to clipboard.write with ClipboardItem when writeText fails", async () => {
    const writeTextError = new Error("writeText failed");
    const writeText = vi.fn().mockRejectedValue(writeTextError);
    const write = vi.fn().mockResolvedValue(undefined);
    const clipboard = {
      writeText: writeText as unknown as Clipboard["writeText"],
      write: write as unknown as Clipboard["write"],
    } satisfies ClipboardStub;
    vi.stubGlobal("navigator", { clipboard } as unknown as Navigator);

    const createdItems: unknown[] = [];
    class ClipboardItemStub {
      constructor(data: Record<string, Blob>) {
        Object.assign(this, { data });
        createdItems.push(this);
      }
    }
    vi.stubGlobal("ClipboardItem", ClipboardItemStub as unknown as typeof ClipboardItem);

    const appendChild = vi.fn();
    const createElement = vi.fn();
    const execCommand = vi.fn();
    const removeAllRanges = vi.fn();
    const getSelection = vi.fn(() => ({ removeAllRanges } as unknown as Selection));
    const documentMock = {
      body: { appendChild } as unknown as HTMLBodyElement,
      createElement: createElement as unknown as Document["createElement"],
      execCommand: execCommand as unknown as Document["execCommand"],
      getSelection: getSelection as unknown as Document["getSelection"],
    } as unknown as Document;
    vi.stubGlobal("document", documentMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await copyText("secondary");

    expect(writeText).toHaveBeenCalledWith("secondary");
    expect(write).toHaveBeenCalledTimes(1);
    const [[writeArg]] = write.mock.calls;
    expect(writeArg).toHaveLength(1);
    expect(writeArg[0]).toBeInstanceOf(ClipboardItemStub);
    expect(createdItems).toHaveLength(1);
    expect(createElement).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
    expect(removeAllRanges).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("uses the textarea fallback when clipboard APIs reject", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("writeText failed"));
    const write = vi.fn().mockRejectedValue(new Error("write failed"));
    const clipboard = {
      writeText: writeText as unknown as Clipboard["writeText"],
      write: write as unknown as Clipboard["write"],
    } satisfies ClipboardStub;
    vi.stubGlobal("navigator", { clipboard } as unknown as Navigator);

    class ClipboardItemStub {
      constructor() {}
    }
    vi.stubGlobal("ClipboardItem", ClipboardItemStub as unknown as typeof ClipboardItem);

    const select = vi.fn();
    const remove = vi.fn();
    const style = {} as CSSStyleDeclaration;
    const textarea = {
      value: "",
      style,
      select,
      remove,
    } as unknown as HTMLTextAreaElement;

    const appendChild = vi.fn();
    const createElement = vi.fn(() => textarea);
    const execCommand = vi.fn(() => true);
    const removeAllRanges = vi.fn();
    const selection = { removeAllRanges } as unknown as Selection;
    const getSelection = vi.fn(() => selection);
    const documentMock = {
      body: { appendChild } as unknown as HTMLBodyElement,
      createElement: createElement as unknown as Document["createElement"],
      execCommand: execCommand as unknown as Document["execCommand"],
      getSelection: getSelection as unknown as Document["getSelection"],
    } as unknown as Document;
    vi.stubGlobal("document", documentMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await copyText("textarea");

    expect(writeText).toHaveBeenCalledWith("textarea");
    expect(write).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(textarea);
    expect(select).toHaveBeenCalledTimes(1);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(removeAllRanges).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect((style as unknown as Record<string, string>).position).toBe("fixed");
    expect((style as unknown as Record<string, string>).top).toBe("var(--visually-hidden-top)");
    expect((style as unknown as Record<string, string>).opacity).toBe("0");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs a warning when all copy strategies fail", async () => {
    const writeTextError = new Error("writeText failure");
    const writeError = new Error("write failure");
    const execError = new Error("execCommand failure");

    const writeText = vi.fn().mockRejectedValue(writeTextError);
    const write = vi.fn().mockRejectedValue(writeError);
    const clipboard = {
      writeText: writeText as unknown as Clipboard["writeText"],
      write: write as unknown as Clipboard["write"],
    } satisfies ClipboardStub;
    vi.stubGlobal("navigator", { clipboard } as unknown as Navigator);

    class ClipboardItemStub {
      constructor() {}
    }
    vi.stubGlobal("ClipboardItem", ClipboardItemStub as unknown as typeof ClipboardItem);

    const select = vi.fn();
    const remove = vi.fn();
    const textarea = {
      value: "",
      style: {} as CSSStyleDeclaration,
      select,
      remove,
    } as unknown as HTMLTextAreaElement;

    const appendChild = vi.fn();
    const createElement = vi.fn(() => textarea);
    const execCommand = vi.fn(() => {
      throw execError;
    });
    const removeAllRanges = vi.fn();
    const selection = { removeAllRanges } as unknown as Selection;
    const getSelection = vi.fn(() => selection);
    const documentMock = {
      body: { appendChild } as unknown as HTMLBodyElement,
      createElement: createElement as unknown as Document["createElement"],
      execCommand: execCommand as unknown as Document["execCommand"],
      getSelection: getSelection as unknown as Document["getSelection"],
    } as unknown as Document;
    vi.stubGlobal("document", documentMock);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await copyText("failure");

    expect(writeText).toHaveBeenCalledWith("failure");
    expect(write).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(textarea);
    expect(select).toHaveBeenCalledTimes(1);
    expect(removeAllRanges).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[planner:clipboard] Failed to copy text"),
      execError,
    );
  });
});
