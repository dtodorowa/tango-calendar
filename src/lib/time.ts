// Pure timezone + calendar-month helpers. Everything the region cares about
// (DE, LU, FR) shares Europe/Berlin wall time, so that is the display zone.
//
// "Date key" = local calendar date "YYYY-MM-DD". Date keys are compared as
// strings and turned into arithmetic via Date.UTC, which has no DST.

export const DISPLAY_TZ = 'Europe/Berlin';

export interface WallTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    partsFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The wall-clock reading of `instant` in `timeZone`. */
export function wallTimeOf(instant: Date, timeZone: string = DISPLAY_TZ): WallTime {
  const parts: Record<string, number> = {};
  for (const part of partsFormatter(timeZone).formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute
  };
}

function offsetMs(instantMs: number, timeZone: string): number {
  const wall = wallTimeOf(new Date(instantMs), timeZone);
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  return asUtc - Math.floor(instantMs / 60_000) * 60_000;
}

/** The real instant at which `timeZone` clocks read `wall`. */
export function wallTimeToInstant(wall: WallTime, timeZone: string = DISPLAY_TZ): Date {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const firstOffset = offsetMs(guess, timeZone);
  const candidate = guess - firstOffset;
  // Second pass settles instants whose offset differs from the guess's (DST edges).
  const secondOffset = offsetMs(candidate, timeZone);
  return new Date(secondOffset === firstOffset ? candidate : guess - secondOffset);
}

/** "YYYY-MM-DDTHH:mm" -> WallTime. */
export function parseWallTime(value: string): WallTime {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid wall time: ${value}`);
  const [, year, month, day, hour, minute] = match.map(Number);
  return { year, month, day, hour, minute };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Local date key of an instant in the display zone. */
export function localDateKey(instant: Date | string, timeZone: string = DISPLAY_TZ): string {
  const wall = wallTimeOf(typeof instant === 'string' ? new Date(instant) : instant, timeZone);
  return toDateKey(wall.year, wall.month, wall.day);
}

function keyToUtcMs(key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addDays(key: string, days: number): string {
  const date = new Date(keyToUtcMs(key) + days * 86_400_000);
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(key: string): number {
  return (new Date(keyToUtcMs(key)).getUTCDay() + 6) % 7;
}

// ---------------------------------------------------------------------------
// Calendar months
// ---------------------------------------------------------------------------

export interface YearMonth {
  year: number;
  month: number; // 1-12
}

/** "YYYY-MM" -> YearMonth, or null when malformed. */
export function parseYearMonth(value: string | null | undefined): YearMonth | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}

export function formatYearMonth({ year, month }: YearMonth): string {
  return `${year}-${pad(month)}`;
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function yearMonthOfKey(key: string): YearMonth {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

export function monthBounds({ year, month }: YearMonth): { firstKey: string; lastKey: string } {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { firstKey: toDateKey(year, month, 1), lastKey: toDateKey(year, month, lastDay) };
}

export interface GridDay {
  key: string;
  day: number;
  inMonth: boolean;
}

/** Monday-first weeks covering the month, padded with neighbouring days. */
export function monthGrid(yearMonth: YearMonth): GridDay[][] {
  const { firstKey, lastKey } = monthBounds(yearMonth);
  const gridStart = addDays(firstKey, -weekdayIndex(firstKey));
  const gridEnd = addDays(lastKey, 6 - weekdayIndex(lastKey));

  const weeks: GridDay[][] = [];
  let week: GridDay[] = [];
  for (let key = gridStart; key <= gridEnd; key = addDays(key, 1)) {
    const { month } = yearMonthOfKey(key);
    week.push({ key, day: Number(key.slice(8)), inMonth: month === yearMonth.month });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  return weeks;
}

/** First and last date keys shown by `monthGrid` (the data window for a month). */
export function monthGridBounds(yearMonth: YearMonth): { startKey: string; endKey: string } {
  const weeks = monthGrid(yearMonth);
  return { startKey: weeks[0][0].key, endKey: weeks[weeks.length - 1][6].key };
}
