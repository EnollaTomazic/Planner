import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  fromISODate,
  slugify,
  toISODate,
  normalizeDate,
} from '../../src/lib/utils';

describe('cn', () => {
  it('handles strings', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
    expect(cn('foo', '', 'bar', undefined, null, false, 'baz')).toBe('foo bar baz');
  });

  it('handles numbers', () => {
    expect(cn(1, 2, 3)).toBe('1 2 3');
    expect(cn(0, 1, 2, 0)).toBe('1 2');
  });

  it('handles nested arrays', () => {
    expect(cn(['foo', ['bar', null], undefined, ['baz', ['', ['qux']]]])).toBe('foo bar baz qux');
  });

  it('handles objects with truthy and falsy values', () => {
    expect(
      cn({ foo: true, bar: false, baz: 0, qux: 1, quux: '', corge: 'yes' })
    ).toBe('foo qux corge');
  });

  it('handles mixed inputs', () => {
    const result = cn(
      'foo',
      1,
      ['bar', ['baz', { qux: true, quux: 0 }]],
      { corge: true, grault: false },
      null,
      undefined,
      0
    );
    expect(result).toBe('foo 1 bar baz qux corge');
  });
});

describe('fromISODate', () => {
  it('returns null for invalid dates', () => {
    const valid = fromISODate('2024-02-29');
    expect(
      valid &&
        valid.getFullYear() === 2024 &&
        valid.getMonth() === 1 &&
        valid.getDate() === 29
    ).toBe(true);
    expect(fromISODate('2024-02-30')).toBeNull();
    expect(fromISODate('not-a-date')).toBeNull();
  });
});

describe('toISODate', () => {
  it('formats dates and timestamps', () => {
    const d = new Date('2024-02-29T12:00:00Z');
    expect(toISODate(d)).toBe('2024-02-29');
    const ts = Date.UTC(2024, 1, 29);
    expect(toISODate(ts)).toBe('2024-02-29');
  });

  it('falls back to today for invalid values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));
    expect(toISODate('not-a-date')).toBe('2024-01-02');
    expect(toISODate(NaN)).toBe('2024-01-02');
    vi.useRealTimers();
  });

  it('handles timezone offsets', () => {
    const d = new Date('2024-02-29T23:00:00-02:00');
    const expected = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
    expect(toISODate(d)).toBe(expected);
  });
});

describe('normalizeDate', () => {
  it('parses various inputs', () => {
    const d = new Date('2024-02-29T12:34:56Z');
    expect(normalizeDate(d).getTime()).toBe(d.getTime());
    const ts = Date.UTC(2024, 1, 29);
    expect(normalizeDate(ts).getTime()).toBe(ts);
  });

  it('returns local midnight for ISO strings', () => {
    const dt = normalizeDate('2024-02-29');
    expect(dt.getHours()).toBe(0);
    expect(dt.getMinutes()).toBe(0);
    expect(dt.getSeconds()).toBe(0);
  });

  it('falls back to now on invalid values', () => {
    vi.useFakeTimers();
    const now = new Date('2024-06-15T00:00:00Z');
    vi.setSystemTime(now);
    expect(normalizeDate('not-a-date').getTime()).toBe(now.getTime());
    expect(normalizeDate(NaN).getTime()).toBe(now.getTime());
    vi.useRealTimers();
  });

  it('rolls over out-of-range ISO dates', () => {
    const dt = normalizeDate('2024-02-30');
    expect(dt.getFullYear()).toBe(2024);
    expect(dt.getMonth()).toBe(2); // March
    expect(dt.getDate()).toBe(1);
  });
});

describe('slugify', () => {
  it('converts strings to kebab-case', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  Multiple   Spaces ')).toBe('multiple-spaces');
  });

  it('handles empty values', () => {
    expect(slugify('')).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});
