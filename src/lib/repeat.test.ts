import { describe, it, expect } from 'vitest';
import { parseRrule, toRrule, weekdayOfKey, type RepeatRule } from './repeat';

describe('toRrule / parseRrule', () => {
  const cases: [string, RepeatRule, string][] = [
    ['once', { repeat: { kind: 'once' }, until: null }, 'FREQ=DAILY;COUNT=1'],
    [
      'weekly on two days, sorted',
      { repeat: { kind: 'weekly', weekdays: ['FR', 'WE'] }, until: null },
      'FREQ=WEEKLY;BYDAY=WE,FR'
    ],
    [
      'weekly until a date',
      { repeat: { kind: 'weekly', weekdays: ['SU'] }, until: '2026-10-18' },
      'FREQ=WEEKLY;BYDAY=SU;UNTIL=20261018T235900Z'
    ],
    [
      '2nd and 4th Saturday',
      { repeat: { kind: 'monthly', weekday: 'SA', ordinals: [4, 2] }, until: null },
      'FREQ=MONTHLY;BYDAY=2SA,4SA'
    ],
    [
      'last Saturday',
      { repeat: { kind: 'monthly', weekday: 'SA', ordinals: [-1] }, until: null },
      'FREQ=MONTHLY;BYDAY=-1SA'
    ]
  ];

  for (const [name, rule, rrule] of cases) {
    it(`encodes ${name}`, () => {
      expect(toRrule(rule)).toBe(rrule);
    });
    it(`round-trips ${name}`, () => {
      expect(toRrule(parseRrule(rrule)!)).toBe(rrule);
    });
  }

  it('parses fixture-style rules', () => {
    expect(parseRrule('FREQ=MONTHLY;BYDAY=1SA,3SA')).toEqual({
      repeat: { kind: 'monthly', weekday: 'SA', ordinals: [1, 3] },
      until: null
    });
  });

  it('returns null for shapes the form cannot edit', () => {
    expect(parseRrule('FREQ=WEEKLY')).toBeNull();
    expect(parseRrule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO')).toBeNull();
    expect(parseRrule('FREQ=MONTHLY;BYDAY=1SA,3SU')).toBeNull();
    expect(parseRrule('FREQ=YEARLY;BYMONTH=1')).toBeNull();
    expect(parseRrule('garbage')).toBeNull();
  });
});

describe('weekdayOfKey', () => {
  it('maps date keys to weekday codes', () => {
    expect(weekdayOfKey('2026-10-07')).toBe('WE');
    expect(weekdayOfKey('2026-10-11')).toBe('SU');
  });
});
