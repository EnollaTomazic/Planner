import { describe, it, expect, vi } from 'vitest';
import {
  addDays,
  fromISODate,
  toISODate,
  normalizeDate,
  weekRangeFromISO,
  ts,
  formatWeekDay,
} from '../../src/lib/date';


describe("Date", () => {
  describe('fromISODate', () => {
    it('returns null for invalid dates', () => {
      const valid = fromISODate('2024-02-29');
      expect(
        valid &&
          valid.getFullYear() === 2024 &&
          valid.getMonth() === 1 &&
          valid.getDate() === 29,
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

  describe('ts', () => {
    it('normalizes dates and strings', () => {
      const d = new Date('2024-02-29T00:00:00Z');
      expect(ts(d)).toBe(d.getTime());
      expect(ts('2024-02-29')).toBe(Date.parse('2024-02-29'));
    });

    it('returns 0 for invalid inputs', () => {
      expect(ts('not-a-date')).toBe(0);
      expect(ts(null as unknown)).toBe(0);
    });
  });

  describe('addDays', () => {
    it('adds days without mutating original', () => {
      const d = new Date('2024-02-29T00:00:00Z');
      const next = addDays(d, 1);
      expect(toISODate(next)).toBe('2024-03-01');
      expect(toISODate(d)).toBe('2024-02-29');
    });
  });

  describe('weekRangeFromISO', () => {
    it('returns week boundaries', () => {
      const { start, end } = weekRangeFromISO('2024-06-15');
      expect(toISODate(start)).toBe('2024-06-10');
      expect(toISODate(end)).toBe('2024-06-16');
    });
  });

  describe('formatWeekDay', () => {
    it('formats ISO dates for week range display', () => {
      expect(formatWeekDay('2024-02-29')).toBe('Feb 29');
      expect(formatWeekDay('2024-02-01')).toBe('Feb 01');
    });

    it('falls back to the original input when invalid', () => {
      expect(formatWeekDay('not-a-date')).toBe('not-a-date');
    });
  });
});
