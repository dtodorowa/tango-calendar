// Pure recurrence expansion: (series + overrides + window) -> occurrences.
// No I/O, no globals: deterministic and unit-testable. See AGENTS.md.
//
// Timezone note: rrule expands in "floating" wall time. We feed it the series'
// wall-clock DTSTART disguised as UTC, then convert each wall-clock result to a
// real instant in the series timezone. That keeps a weekly 20:30 milonga at
// 20:30 local on both sides of a DST change.

import { rrulestr } from 'rrule';
import type { EventSeries, OccurrenceOverride } from './types';
import { parseWallTime, toDateKey, wallTimeToInstant, type WallTime } from './time';

export interface ExpandedOccurrence {
  eventId: string;
  /** Local date key of the occurrence in the series timezone. */
  dateKey: string;
  start: Date;
  end: Date;
}

function wallToFakeUtc(wall: WallTime): Date {
  return new Date(Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute));
}

function fakeUtcToWall(date: Date): WallTime {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes()
  };
}

function buildRule(rrule: string, dtstart: Date) {
  // rrulestr wants a full "DTSTART...\nRRULE:..." block to anchor the series.
  const dt = dtstart
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return rrulestr(`DTSTART:${dt}\nRRULE:${rrule}`);
}

/**
 * Expand a single series for local dates in [startKey, endKey] (inclusive date
 * keys, "YYYY-MM-DD"), applying per-date overrides: "cancelled" drops the date;
 * "moved" shifts its start. Returns occurrences sorted ascending by start.
 */
export function expandSeries(
  series: EventSeries,
  overrides: OccurrenceOverride[],
  startKey: string,
  endKey: string
): ExpandedOccurrence[] {
  const rule = buildRule(series.rrule, wallToFakeUtc(parseWallTime(series.dtstartLocal)));
  const windowStart = new Date(`${startKey}T00:00:00Z`);
  const windowEnd = new Date(`${endKey}T23:59:59Z`);
  const dates = rule.between(windowStart, windowEnd, true);

  const overrideByDate = new Map<string, OccurrenceOverride>();
  for (const override of overrides) {
    if (override.eventId === series.id) overrideByDate.set(override.date, override);
  }

  const durationMs = series.durationMinutes * 60_000;
  const occurrences: ExpandedOccurrence[] = [];

  for (const fakeDate of dates) {
    let wall = fakeUtcToWall(fakeDate);
    const override = overrideByDate.get(toDateKey(wall.year, wall.month, wall.day));
    if (override?.status === 'cancelled') continue;
    if (override?.overrideStartLocal) wall = parseWallTime(override.overrideStartLocal);

    const start = wallTimeToInstant(wall, series.timezone);
    occurrences.push({
      eventId: series.id,
      dateKey: toDateKey(wall.year, wall.month, wall.day),
      start,
      end: new Date(start.getTime() + durationMs)
    });
  }

  occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
  return occurrences;
}

/**
 * First occurrence on or after `dtstartLocal` ("YYYY-MM-DDTHH:mm"), or null if
 * the rule never fires. Saving this as DTSTART keeps rrule.js and native
 * calendars in agreement: RFC 5545 always counts DTSTART as an occurrence,
 * rrule.js only does when it matches the rule.
 */
export function alignStart(rrule: string, dtstartLocal: string): string | null {
  const anchor = wallToFakeUtc(parseWallTime(dtstartLocal));
  const first = buildRule(rrule, anchor).after(anchor, true);
  if (!first) return null;
  return first.toISOString().slice(0, 16);
}
