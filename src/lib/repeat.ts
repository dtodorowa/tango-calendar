// The friendly repeat model behind the event form, and its RRULE encoding.
// Only the shapes organizers actually use are editable (once, weekly on some
// weekdays, monthly on the nth weekday); anything else parses to null and is
// kept verbatim. Pure: see ADR-0004 for why RRULE is the storage format.

export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** 1st–4th, or -1 for "last". */
export const ORDINALS = [1, 2, 3, 4, -1] as const;
export type Ordinal = (typeof ORDINALS)[number];

export type Repeat =
  | { kind: 'once' }
  | { kind: 'weekly'; weekdays: Weekday[] }
  | { kind: 'monthly'; weekday: Weekday; ordinals: Ordinal[] };

export interface RepeatRule {
  repeat: Repeat;
  /** Last date the series may run on (local date key), or null for open-ended. */
  until: string | null;
}

function sortedWeekdays(days: Weekday[]): Weekday[] {
  return WEEKDAYS.filter((day) => days.includes(day));
}

function sortedOrdinals(ordinals: Ordinal[]): Ordinal[] {
  return ORDINALS.filter((ordinal) => ordinals.includes(ordinal));
}

function untilPart(until: string | null): string {
  // Floating end-of-day; see recurrence.ts for why the "Z" is wall time here.
  return until ? `;UNTIL=${until.replace(/-/g, '')}T235900Z` : '';
}

export function toRrule({ repeat, until }: RepeatRule): string {
  if (repeat.kind === 'once') return 'FREQ=DAILY;COUNT=1';
  if (repeat.kind === 'weekly') {
    return `FREQ=WEEKLY;BYDAY=${sortedWeekdays(repeat.weekdays).join(',')}${untilPart(until)}`;
  }
  const byDay = sortedOrdinals(repeat.ordinals)
    .map((ordinal) => `${ordinal}${repeat.weekday}`)
    .join(',');
  return `FREQ=MONTHLY;BYDAY=${byDay}${untilPart(until)}`;
}

function parseUntil(raw: string | undefined): string | null | undefined {
  if (raw === undefined) return null;
  const match = /^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/.exec(raw);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function isWeekday(value: string): value is Weekday {
  return (WEEKDAYS as readonly string[]).includes(value);
}

/** RRULE body -> RepeatRule, or null when the rule is outside the editable shapes. */
export function parseRrule(rrule: string): RepeatRule | null {
  const parts = new Map<string, string>();
  for (const part of rrule.split(';')) {
    const [key, value] = part.split('=');
    if (!key || value === undefined) return null;
    parts.set(key.toUpperCase(), value.toUpperCase());
  }

  const frequency = parts.get('FREQ');
  if (frequency === 'DAILY' && parts.get('COUNT') === '1' && parts.size === 2) {
    return { repeat: { kind: 'once' }, until: null };
  }

  const until = parseUntil(parts.get('UNTIL'));
  if (until === undefined) return null;
  if (parts.has('INTERVAL') && parts.get('INTERVAL') !== '1') return null;
  const allowed = new Set(['FREQ', 'BYDAY', 'UNTIL', 'INTERVAL']);
  if ([...parts.keys()].some((key) => !allowed.has(key))) return null;

  const byDay = parts.get('BYDAY')?.split(',') ?? [];
  if (byDay.length === 0) return null;

  if (frequency === 'WEEKLY') {
    if (!byDay.every(isWeekday)) return null;
    return { repeat: { kind: 'weekly', weekdays: sortedWeekdays(byDay) }, until };
  }

  if (frequency === 'MONTHLY') {
    const entries = byDay.map((entry) => /^(-1|[1-4])(MO|TU|WE|TH|FR|SA|SU)$/.exec(entry));
    if (entries.some((entry) => !entry)) return null;
    const weekdays = new Set(entries.map((entry) => entry![2]));
    if (weekdays.size !== 1) return null;
    const weekday = entries[0]![2] as Weekday;
    const ordinals = sortedOrdinals(entries.map((entry) => Number(entry![1]) as Ordinal));
    return { repeat: { kind: 'monthly', weekday, ordinals }, until };
  }

  return null;
}

/** Weekday code of a local date key ("2026-10-07" -> "WE"). */
export function weekdayOfKey(key: string): Weekday {
  const [year, month, day] = key.split('-').map(Number);
  const index = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
  return WEEKDAYS[index];
}
