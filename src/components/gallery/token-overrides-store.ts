import { useSyncExternalStore } from "react";

import type { DesignTokenMeta } from "@/lib/design-token-registry";

type MutableTokenOverridesState = Partial<
  Record<DesignTokenMeta["category"], DesignTokenMeta>
>;

export type TokenOverridesState = Readonly<MutableTokenOverridesState>;

type Listener = () => void;

const listeners = new Set<Listener>();

let state: TokenOverridesState = Object.freeze({});

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(next: MutableTokenOverridesState) {
  state = Object.freeze(next) as TokenOverridesState;
  emit();
}

export function subscribeTokenOverrides(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTokenOverridesSnapshot(): TokenOverridesState {
  return state;
}

export function useTokenOverrides(): TokenOverridesState {
  return useSyncExternalStore(
    subscribeTokenOverrides,
    getTokenOverridesSnapshot,
    getTokenOverridesSnapshot,
  );
}

export function toggleTokenOverride(token: DesignTokenMeta) {
  const current = state[token.category];
  const next: MutableTokenOverridesState = { ...state };

  if (current && current.name === token.name) {
    delete next[token.category];
  } else {
    next[token.category] = token;
  }

  setState(next);
}

export function clearTokenOverride(category: DesignTokenMeta["category"]) {
  if (!state[category]) {
    return;
  }

  const next: MutableTokenOverridesState = { ...state };
  delete next[category];
  setState(next);
}

export function isTokenSelected(
  token: DesignTokenMeta,
  overrides: TokenOverridesState,
): boolean {
  const current = overrides[token.category];
  return current?.name === token.name;
}

export function getSelectedToken(
  category: DesignTokenMeta["category"],
): DesignTokenMeta | undefined {
  return state[category];
}
