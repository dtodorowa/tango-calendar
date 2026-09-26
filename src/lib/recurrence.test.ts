import { describe, it, expect } from 'vitest';
import { alignStart, expandSeries } from './recurrence';
import type { EventSeries, OccurrenceOverride } from './types';

const weekly: EventSeries = {
  id: 'evt-1',
  orgId: 'org-a',
  venueId: 'venue-a',
  categories: ['milonga'],
  tags: [],
  status: 'published',
  rrule: 'FREQ=WEEKLY',
  dtstartLocal: '2026-01-06T20:00', // a Tuesday
  timezone: 'Europe/Berlin',
  durationMinutes: 120,
  price: { kind: 'fixed', amount: 8 },
  sourceLang: 'de',
  title: { de: 'Milonga', en: 'Milonga', fr: 'Milonga' },
  description: { de: '', en: '', fr: '' }
};

describe('expandSeries', () => {
  it('expands a weekly series to one occurrence per week', () => {
    const result = expandSeries(weekly, [], '2026-01-06', '2026-03-02');
    // 8 Tuesdays from Jan 6 through Feb 24.
    expect(result.length).toBe(8);
    expect(result[0].dateKey).toBe('2026-01-06');
    expect(result[1].dateKey).toBe('2026-01-13');
  });

  it('converts wall time to the real instant in winter', () => {
    const [first] = expandSeries(weekly, [], '2026-01-06', '2026-01-06');
    expect(first.start.toISOString()).toBe('2026-01-06T19:00:00.000Z');
  });

  it('keeps the same wall time across the DST change', () => {
    const [summer] = expandSeries(weekly, [], '2026-04-07', '2026-04-07');
    expect(summer.dateKey).toBe('2026-04-07');
    expect(summer.start.toISOString()).toBe('2026-04-07T18:00:00.000Z');
  });

  it('applies the duration to compute each end', () => {
    const [first] = expandSeries(weekly, [], '2026-01-06', '2026-01-31');
    expect(first.end.getTime() - first.start.getTime()).toBe(120 * 60_000);
  });

  it('drops a cancelled occurrence', () => {
    const overrides: OccurrenceOverride[] = [
      { eventId: 'evt-1', date: '2026-01-20', status: 'cancelled' }
    ];
    const result = expandSeries(weekly, overrides, '2026-01-06', '2026-03-02');
    expect(result.length).toBe(7);
    expect(result.map((o) => o.dateKey)).not.toContain('2026-01-20');
  });

  it('shifts a moved occurrence to its override start', () => {
    const overrides: OccurrenceOverride[] = [
      {
        eventId: 'evt-1',
        date: '2026-01-13',
        status: 'moved',
        overrideStartLocal: '2026-01-14T21:00'
      }
    ];
    const result = expandSeries(weekly, overrides, '2026-01-06', '2026-03-02');
    const moved = result.find((o) => o.dateKey === '2026-01-14');
    expect(moved?.start.toISOString()).toBe('2026-01-14T20:00:00.000Z');
    expect(result.map((o) => o.dateKey)).not.toContain('2026-01-13');
  });

  it('ignores overrides belonging to another event', () => {
    const overrides: OccurrenceOverride[] = [
      { eventId: 'other', date: '2026-01-20', status: 'cancelled' }
    ];
    const result = expandSeries(weekly, overrides, '2026-01-06', '2026-03-02');
    expect(result.length).toBe(8);
  });

  it('supports monthly by-weekday rules', () => {
    const firstSunday = {
      ...weekly,
      rrule: 'FREQ=MONTHLY;BYDAY=1SU',
      dtstartLocal: '2026-01-04T15:00'
    };
    const result = expandSeries(firstSunday, [], '2026-01-01', '2026-03-31');
    expect(result.map((o) => o.dateKey)).toEqual(['2026-01-04', '2026-02-01', '2026-03-01']);
  });
});

describe('alignStart', () => {
  it('moves a start date forward to the first matching day', () => {
    // 2026-10-05 is a Monday; the rule wants Wednesdays.
    expect(alignStart('FREQ=WEEKLY;BYDAY=WE', '2026-10-05T20:00')).toBe('2026-10-07T20:00');
    expect(alignStart('FREQ=MONTHLY;BYDAY=2SA', '2026-10-01T20:30')).toBe('2026-10-10T20:30');
  });

  it('keeps a start that already matches, and one-off dates as they are', () => {
    expect(alignStart('FREQ=WEEKLY;BYDAY=WE', '2026-10-07T20:00')).toBe('2026-10-07T20:00');
    expect(alignStart('FREQ=DAILY;COUNT=1', '2026-10-05T14:00')).toBe('2026-10-05T14:00');
  });

  it('returns null when UNTIL ends before the first match', () => {
    expect(
      alignStart('FREQ=WEEKLY;BYDAY=WE;UNTIL=20261006T235900Z', '2026-10-05T20:00')
    ).toBeNull();
  });
});
