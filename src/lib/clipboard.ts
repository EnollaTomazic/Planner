// src/lib/clipboard.ts
// Shared clipboard helper with textarea fallback.

export async function copyText(text: string): Promise<void> {
  if (typeof navigator === "undefined" || typeof document === "undefined") {
    return;
  }

  const clipboard = navigator.clipboard;

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // Continue to other fallbacks.
    }
  }

  if (clipboard?.write && typeof ClipboardItem !== "undefined") {
    try {
      const item = new ClipboardItem({ "text/plain": new Blob([text], { type: "text/plain" }) });
      await clipboard.write([item]);
      return;
    } catch {
      // Continue to the textarea fallback.
    }
  }

  if (!document.body) {
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  Object.assign(ta.style, {
    position: "fixed",
    top: "var(--visually-hidden-top)",
    opacity: "0",
  });
  document.body.appendChild(ta);
  ta.select();

  try {
    if (typeof document.execCommand === "function") {
      document.execCommand("copy");
    }
  } finally {
    document.getSelection()?.removeAllRanges();
    ta.remove();
  }
}

