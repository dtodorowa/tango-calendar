import { describe, it, expect } from 'vitest';
import {
  addDays,
  localDateKey,
  monthGrid,
  monthGridBounds,
  parseYearMonth,
  shiftMonth,
  wallTimeToInstant,
  weekdayIndex
} from './time';

describe('wallTimeToInstant', () => {
  it('handles CET and CEST', () => {
    const winter = { year: 2026, month: 1, day: 10, hour: 20, minute: 30 };
    const summer = { year: 2026, month: 7, day: 10, hour: 20, minute: 30 };
    expect(wallTimeToInstant(winter).toISOString()).toBe('2026-01-10T19:30:00.000Z');
    expect(wallTimeToInstant(summer).toISOString()).toBe('2026-07-10T18:30:00.000Z');
  });
});

describe('localDateKey', () => {
  it('uses the local date, not the UTC date, just after midnight', () => {
    // 23:30 UTC on Jul 10 is 01:30 on Jul 11 in Berlin.
    expect(localDateKey('2026-07-10T23:30:00.000Z')).toBe('2026-07-11');
  });
});

describe('date keys', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('indexes weekdays Monday-first', () => {
    expect(weekdayIndex('2026-09-28')).toBe(0); // Monday
    expect(weekdayIndex('2026-09-27')).toBe(6); // Sunday
  });
});

describe('months', () => {
  it('parses and rejects', () => {
    expect(parseYearMonth('2026-09')).toEqual({ year: 2026, month: 9 });
    expect(parseYearMonth('2026-13')).toBeNull();
    expect(parseYearMonth('nope')).toBeNull();
    expect(parseYearMonth(null)).toBeNull();
  });

  it('shifts across years', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('builds Monday-first weeks padded to full weeks', () => {
    const weeks = monthGrid({ year: 2026, month: 9 });
    expect(weeks[0][0]).toEqual({ key: '2026-08-31', day: 31, inMonth: false });
    expect(weeks[0][1]).toEqual({ key: '2026-09-01', day: 1, inMonth: true });
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(monthGridBounds({ year: 2026, month: 9 })).toEqual({
      startKey: '2026-08-31',
      endKey: '2026-10-04'
    });
  });
});
