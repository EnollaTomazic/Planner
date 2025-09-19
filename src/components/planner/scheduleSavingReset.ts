// src/components/planner/scheduleSavingReset.ts

export function scheduleSavingReset(callback: VoidFunction): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  setTimeout(callback, 0);
}
