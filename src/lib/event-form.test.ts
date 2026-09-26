import { describe, it, expect } from 'vitest';
import { buildSchedule, durationMinutes, scheduleToValues } from './event-form';
import type { EventInput } from './validation';

const input: EventInput = {
  orgId: 'x',
  sourceLang: 'de',
  translations: {
    de: { title: 'Milonga', description: null, note: null },
    en: { title: null, description: null, note: null },
    fr: { title: null, description: null, note: null }
  },
  categories: ['milonga'],
  tags: [],
  date: '2026-10-05', // Monday
  startTime: '20:30',
  endTime: '00:30',
  repeatKind: 'weekly',
  weekdays: ['WE'],
  monthlyWeekday: 'SA',
  ordinals: [],
  until: null,
  venueMode: 'saved',
  venueId: 'v',
  venueName: '',
  venueAddress: '',
  venueCity: '',
  venueCountry: 'DE',
  priceKind: 'free',
  priceAmount: null,
  publish: true
};

describe('durationMinutes', () => {
  it('handles same-day and past-midnight ends', () => {
    expect(durationMinutes('20:00', '23:30')).toBe(210);
    expect(durationMinutes('20:30', '00:30')).toBe(240);
    expect(durationMinutes('20:00', '20:00')).toBe(24 * 60);
  });
});

describe('buildSchedule', () => {
  it('builds the rule and aligns the start to the first matching day', () => {
    expect(buildSchedule(input, null)).toEqual({
      schedule: {
        rrule: 'FREQ=WEEKLY;BYDAY=WE',
        dtstartLocal: '2026-10-07T20:30',
        durationMinutes: 240
      }
    });
  });

  it('ignores `until` for one-off events', () => {
    const result = buildSchedule({ ...input, repeatKind: 'once', until: '2026-12-01' }, null);
    expect(result).toMatchObject({
      schedule: { rrule: 'FREQ=DAILY;COUNT=1', dtstartLocal: '2026-10-05T20:30' }
    });
  });

  it('keeps an existing custom rule', () => {
    const result = buildSchedule(
      { ...input, repeatKind: 'custom' },
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=WE'
    );
    expect(result).toMatchObject({ schedule: { rrule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=WE' } });
  });

  it('reports a rule that never fires', () => {
    const result = buildSchedule({ ...input, until: '2026-10-06' }, null);
    expect(result).toEqual({ error: 'neverHappens', field: 'date' });
  });
});

describe('scheduleToValues', () => {
  it('turns a stored monthly rule back into form fields', () => {
    expect(scheduleToValues('FREQ=MONTHLY;BYDAY=2SA,4SA', '2026-01-10T20:30', 240)).toMatchObject({
      date: '2026-01-10',
      startTime: '20:30',
      endTime: '00:30',
      repeatKind: 'monthly',
      monthlyWeekday: 'SA',
      ordinals: [2, 4]
    });
  });

  it('flags rules the form cannot edit', () => {
    expect(
      scheduleToValues('FREQ=WEEKLY;INTERVAL=2;BYDAY=WE', '2026-01-07T20:00', 60).repeatKind
    ).toBe('custom');
  });
});
