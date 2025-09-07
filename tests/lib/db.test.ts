import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { readLocal, writeLocal, removeLocal, useLocalDB, uid } from '@/lib/db';

// Tests for localStorage helpers

describe('localStorage helpers', () => {
  const original = window.localStorage;
  const store: Record<string, string> = {};
  const mockStorage: Storage = {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  } as unknown as Storage;

  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: original });
  });

  it('writes and reads namespaced values', () => {
    writeLocal('foo', { bar: 1 });
    expect(mockStorage.setItem).toHaveBeenCalledWith('13lr:foo', JSON.stringify({ bar: 1 }));
    expect(readLocal<{ bar: number }>('foo')).toEqual({ bar: 1 });
  });

  it('removes values', () => {
    writeLocal('foo', 'baz');
    removeLocal('foo');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('13lr:foo');
    expect(readLocal('foo')).toBeNull();
  });
});

// Tests for useLocalDB hook

describe('useLocalDB', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates state from localStorage after mount', async () => {
    window.localStorage.setItem('13lr:state', JSON.stringify('stored'));
    const getSpy = vi.spyOn(window.localStorage.__proto__, 'getItem');
    const { result } = renderHook(() => useLocalDB('state', 'initial'));
    await waitFor(() => expect(result.current[0]).toBe('stored'));
    expect(getSpy).toHaveBeenCalledWith('13lr:state');
  });

  it('syncs state across tabs via storage events', async () => {
    const { result } = renderHook(() => useLocalDB('sync', 'a'));
    await waitFor(() =>
      expect(window.localStorage.getItem('13lr:sync')).toBe(JSON.stringify('a'))
    );
    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: '13lr:sync',
          newValue: JSON.stringify('b'),
          storageArea: window.localStorage,
        })
      );
    });
    expect(result.current[0]).toBe('b');
  });

  it('resets state to initial when storage key is removed', async () => {
    const { result } = renderHook(() => useLocalDB('remove', 'init'));
    await waitFor(() =>
      expect(window.localStorage.getItem('13lr:remove')).toBe(JSON.stringify('init'))
    );

    // Change state so it differs from the initial value
    act(() => result.current[1]('changed'));
    await waitFor(() =>
      expect(window.localStorage.getItem('13lr:remove')).toBe(JSON.stringify('changed'))
    );

    // Simulate another tab removing the key
    await act(async () => {
      window.localStorage.removeItem('13lr:remove');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: '13lr:remove',
          newValue: null,
          storageArea: window.localStorage,
        })
      );
    });

    expect(result.current[0]).toBe('init');
  });
});

// Tests for uid

describe('uid', () => {
  it('generates unique identifiers of sufficient length', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(uid('test'));
    }
    expect(ids.size).toBe(100);

    const sample = uid('test');
    expect(sample.startsWith('test_')).toBe(true);
    expect(sample.slice('test_'.length).length).toBeGreaterThanOrEqual(16);
  });
});

