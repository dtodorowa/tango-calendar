// Pure iCalendar (.ics) feed builder. One VEVENT per series, carrying the RRULE
// so native calendars expand the recurrence themselves; cancellations become
// EXDATE lines. No I/O — the timestamp is passed in for determinism/testability.
//
// DTSTART/EXDATE carry TZID + wall time (not UTC) so native calendars keep the
// local start time stable across DST, matching src/lib/recurrence.ts.

import type { EventSeries, Locale, OccurrenceOverride } from './types';

export interface IcsEventInput {
  series: EventSeries;
  overrides: OccurrenceOverride[];
  venueLabel: string;
  locale: Locale;
}

/** Date -> "YYYYMMDDTHHMMSSZ" (iCal UTC form). */
function toIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** RFC 5545 text escaping: backslash, semicolon, comma, newline. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** "YYYY-MM-DDTHH:mm" -> "YYYYMMDDTHHMM00" (iCal local form). */
function toIcsLocal(wallTime: string): string {
  return `${wallTime.replace(/[-:]/g, '')}00`;
}

function veventLines(input: IcsEventInput, dtstamp: Date): string[] {
  const { series, overrides } = input;
  const timeOfDay = series.dtstartLocal.slice(11); // HH:mm
  const tzid = `TZID=${series.timezone}`;
  const uid = `UID:${series.id}@saarlorlux-tango`;

  const own = overrides.filter((o) => o.eventId === series.id);
  const exdates = own
    .filter((o) => o.status === 'cancelled')
    .map((o) => toIcsLocal(`${o.date}T${timeOfDay}`));

  const details: string[] = [`SUMMARY:${escapeText(series.title[input.locale])}`];
  if (input.venueLabel) details.push(`LOCATION:${escapeText(input.venueLabel)}`);
  const description = series.description[input.locale];
  if (description) details.push(`DESCRIPTION:${escapeText(description)}`);

  const lines = [
    'BEGIN:VEVENT',
    uid,
    `DTSTAMP:${toIcsUtc(dtstamp)}`,
    `DTSTART;${tzid}:${toIcsLocal(series.dtstartLocal)}`,
    `DURATION:PT${series.durationMinutes}M`,
    `RRULE:${series.rrule}`
  ];
  for (const exdate of exdates) lines.push(`EXDATE;${tzid}:${exdate}`);
  lines.push(...details, 'END:VEVENT');

  // A moved date is its own VEVENT that replaces the original instance by RECURRENCE-ID.
  for (const moved of own) {
    if (moved.status !== 'moved' || !moved.overrideStartLocal) continue;
    lines.push(
      'BEGIN:VEVENT',
      uid,
      `DTSTAMP:${toIcsUtc(dtstamp)}`,
      `RECURRENCE-ID;${tzid}:${toIcsLocal(`${moved.date}T${timeOfDay}`)}`,
      `DTSTART;${tzid}:${toIcsLocal(moved.overrideStartLocal)}`,
      `DURATION:PT${series.durationMinutes}M`,
      ...details,
      'END:VEVENT'
    );
  }
  return lines;
}

export function buildIcsFeed(events: IcsEventInput[], dtstamp: Date): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaarLorLux+ Tango Calendar//EN',
    'CALSCALE:GREGORIAN',
    ...events.flatMap((event) => veventLines(event, dtstamp)),
    'END:VCALENDAR'
  ];
  return lines.join('\r\n') + '\r\n';
}
