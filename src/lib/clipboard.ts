// src/lib/clipboard.ts
// Shared clipboard helper with textarea fallback.
"use client";

import { createLogger } from "./logging";

const clipboardLog = createLogger("clipboard");

export async function copyText(text: string): Promise<void> {
  if (typeof navigator === "undefined" || typeof document === "undefined") {
    return;
  }

  const clipboard = navigator.clipboard;
  let lastError: unknown = null;

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return;
    } catch (error) {
      lastError = error;
      // Continue to other fallbacks.
    }
  }

  if (clipboard?.write && typeof ClipboardItem !== "undefined") {
    try {
      const item = new ClipboardItem({ "text/plain": new Blob([text], { type: "text/plain" }) });
      await clipboard.write([item]);
      return;
    } catch (error) {
      lastError = error;
      // Continue to the textarea fallback.
    }
  }

  if (!document.body) {
    clipboardLog.warn(
      "Unable to copy text because document.body is not available.",
      lastError,
    );
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.classList.add("clipboard-copy-buffer");
  document.body.appendChild(ta);
  ta.select();

  let copied = false;
  try {
    if (typeof document.execCommand === "function") {
      copied = document.execCommand("copy");
      if (copied) {
        return;
      }
    }
  } catch (error) {
    lastError = error;
  } finally {
    document.getSelection()?.removeAllRanges();
    ta.remove();
  }

  if (!copied) {
    clipboardLog.warn(
      "Failed to copy text with the available clipboard strategies.",
      lastError,
    );
  }
}

