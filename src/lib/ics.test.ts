import { describe, it, expect } from 'vitest';
import { buildIcsFeed, type IcsEventInput } from './ics';
import type { EventSeries } from './types';

const series: EventSeries = {
  id: 'evt-1',
  orgId: 'org-a',
  venueId: 'venue-a',
  categories: ['milonga'],
  tags: [],
  status: 'published',
  rrule: 'FREQ=WEEKLY',
  dtstartLocal: '2026-01-06T20:00',
  timezone: 'Europe/Berlin',
  durationMinutes: 120,
  price: { kind: 'fixed', amount: 8 },
  sourceLang: 'de',
  title: { de: 'Milonga; Dienstag', en: 'Tuesday Milonga', fr: 'Milonga du mardi' },
  description: { de: '', en: 'Come dance', fr: '' }
};

const input: IcsEventInput = {
  series,
  overrides: [{ eventId: 'evt-1', date: '2026-01-20', status: 'cancelled' }],
  venueLabel: 'tkRaum, Saarbrücken',
  locale: 'en'
};

const stamp = new Date('2026-01-01T00:00:00Z');

describe('buildIcsFeed', () => {
  it('wraps events in a VCALENDAR', () => {
    const ics = buildIcsFeed([input], stamp);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
  });

  it('carries the RRULE and the DTSTART', () => {
    const ics = buildIcsFeed([input], stamp);
    expect(ics).toContain('RRULE:FREQ=WEEKLY');
    expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20260106T200000');
  });

  it('emits an EXDATE for each cancellation at the series wall time', () => {
    const ics = buildIcsFeed([input], stamp);
    expect(ics).toContain('EXDATE;TZID=Europe/Berlin:20260120T200000');
  });

  it('uses the requested locale and escapes text', () => {
    const ics = buildIcsFeed([input], stamp);
    expect(ics).toContain('SUMMARY:Tuesday Milonga');
    // semicolons in text are escaped
    const de = buildIcsFeed([{ ...input, locale: 'de' }], stamp);
    expect(de).toContain('SUMMARY:Milonga\\; Dienstag');
  });

  it('replaces a moved date with a RECURRENCE-ID instance', () => {
    const ics = buildIcsFeed(
      [
        {
          ...input,
          overrides: [
            {
              eventId: 'evt-1',
              date: '2026-01-13',
              status: 'moved',
              overrideStartLocal: '2026-01-14T21:00'
            }
          ]
        }
      ],
      stamp
    );
    expect(ics).toContain('RECURRENCE-ID;TZID=Europe/Berlin:20260113T200000');
    expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20260114T210000');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });

  it('uses CRLF line endings', () => {
    const ics = buildIcsFeed([input], stamp);
    expect(ics.includes('\r\n')).toBe(true);
  });
});
