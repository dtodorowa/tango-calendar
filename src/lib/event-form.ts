// Event form <-> stored event. Pure: FormData in, plain records out, so the
// fiddly bits (duration across midnight, repeat rules, DTSTART alignment) are
// unit-tested without a browser or database.

import type { ErrorCode } from '$lib/i18n/dashboard';
import { alignStart } from '$lib/recurrence';
import {
  parseRrule,
  toRrule,
  weekdayOfKey,
  type Ordinal,
  type Repeat,
  type Weekday
} from '$lib/repeat';
import type { Category, Locale, PriceKind, Tag } from '$lib/types';
import type { EventInput } from '$lib/validation';

export type RepeatKind = 'once' | 'weekly' | 'monthly' | 'custom';

export interface TranslationValues {
  title: string;
  description: string;
  note: string;
}

/** Everything the form shows, as the strings/arrays its inputs hold. */
export interface EventFormValues {
  orgId: string;
  sourceLang: Locale;
  translations: Record<Locale, TranslationValues>;
  categories: Category[];
  tags: Tag[];
  date: string;
  startTime: string;
  endTime: string;
  repeatKind: RepeatKind;
  weekdays: Weekday[];
  monthlyWeekday: Weekday;
  ordinals: Ordinal[];
  until: string;
  venueMode: 'saved' | 'new';
  venueId: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  priceKind: PriceKind;
  priceAmount: string;
  publish: boolean;
}

const emptyTranslation = (): TranslationValues => ({ title: '', description: '', note: '' });

export function blankEventValues(orgId: string, sourceLang: Locale, date: string): EventFormValues {
  return {
    orgId,
    sourceLang,
    translations: { de: emptyTranslation(), en: emptyTranslation(), fr: emptyTranslation() },
    categories: ['milonga'],
    tags: [],
    date,
    startTime: '20:00',
    endTime: '23:30',
    repeatKind: 'weekly',
    weekdays: [weekdayOfKey(date)],
    monthlyWeekday: weekdayOfKey(date),
    ordinals: [1],
    until: '',
    venueMode: 'new',
    venueId: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueCountry: 'DE',
    priceKind: 'fixed',
    priceAmount: '',
    publish: true
  };
}

/**
 * FormData -> form values. Unvalidated: the union-typed fields hold whatever the
 * browser sent until eventSchema checks them. Typed as EventFormValues so a
 * failed submission can re-render the form as the user left it.
 */
export function readEventForm(form: FormData): EventFormValues {
  const text = (name: string) => String(form.get(name) ?? '');
  const list = (name: string) => form.getAll(name).map(String);
  const translation = (locale: Locale): TranslationValues => ({
    title: text(`title_${locale}`),
    description: text(`description_${locale}`),
    note: text(`note_${locale}`)
  });
  return {
    orgId: text('orgId'),
    sourceLang: text('sourceLang') as Locale,
    translations: { de: translation('de'), en: translation('en'), fr: translation('fr') },
    categories: list('categories') as Category[],
    tags: list('tags') as Tag[],
    date: text('date'),
    startTime: text('startTime'),
    endTime: text('endTime'),
    repeatKind: text('repeatKind') as RepeatKind,
    weekdays: list('weekdays') as Weekday[],
    monthlyWeekday: text('monthlyWeekday') as Weekday,
    ordinals: list('ordinals').map(Number) as Ordinal[],
    until: text('until'),
    venueMode: text('venueMode') === 'saved' ? 'saved' : 'new',
    venueId: text('venueId'),
    venueName: text('venueName'),
    venueAddress: text('venueAddress'),
    venueCity: text('venueCity'),
    venueCountry: text('venueCountry'),
    priceKind: text('priceKind') as PriceKind,
    priceAmount: text('priceAmount'),
    publish: form.get('publish') === 'on'
  };
}

function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** End before (or equal to) start means the event runs past midnight. */
export function durationMinutes(startTime: string, endTime: string): number {
  const difference = minutesOf(endTime) - minutesOf(startTime);
  return difference > 0 ? difference : difference + 24 * 60;
}

function repeatFrom(input: EventInput): Repeat | null {
  if (input.repeatKind === 'once') return { kind: 'once' };
  if (input.repeatKind === 'weekly') return { kind: 'weekly', weekdays: input.weekdays };
  if (input.repeatKind === 'monthly') {
    return { kind: 'monthly', weekday: input.monthlyWeekday, ordinals: input.ordinals };
  }
  return null;
}

export interface Schedule {
  rrule: string;
  dtstartLocal: string;
  durationMinutes: number;
}

/**
 * Validated input -> what gets stored. `existingRrule` is the saved rule, used
 * only when the form kept a custom rule it can't edit.
 */
export function buildSchedule(
  input: EventInput,
  existingRrule: string | null
): { schedule: Schedule } | { error: ErrorCode; field: string } {
  const repeat = repeatFrom(input);
  const rrule = repeat
    ? toRrule({ repeat, until: repeat.kind === 'once' ? null : input.until })
    : existingRrule;
  if (!rrule) return { error: 'required', field: 'repeatKind' };

  const dtstartLocal = alignStart(rrule, `${input.date}T${input.startTime}`);
  if (!dtstartLocal) return { error: 'neverHappens', field: 'date' };

  return {
    schedule: {
      rrule,
      dtstartLocal,
      durationMinutes: durationMinutes(input.startTime, input.endTime)
    }
  };
}

/** Stored schedule -> the form's date/time/repeat fields. */
export function scheduleToValues(
  rrule: string,
  dtstartLocal: string,
  duration: number
): Pick<
  EventFormValues,
  | 'date'
  | 'startTime'
  | 'endTime'
  | 'repeatKind'
  | 'weekdays'
  | 'monthlyWeekday'
  | 'ordinals'
  | 'until'
> {
  const date = dtstartLocal.slice(0, 10);
  const startTime = dtstartLocal.slice(11, 16);
  const endMinutes = (minutesOf(startTime) + duration) % (24 * 60);
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  const weekday = weekdayOfKey(date);
  const base = {
    date,
    startTime,
    endTime,
    weekdays: [weekday],
    monthlyWeekday: weekday,
    ordinals: [1] as Ordinal[],
    until: ''
  };

  const rule = parseRrule(rrule);
  if (!rule) return { ...base, repeatKind: 'custom' };
  const until = rule.until ?? '';
  if (rule.repeat.kind === 'once') return { ...base, repeatKind: 'once' };
  if (rule.repeat.kind === 'weekly') {
    return { ...base, repeatKind: 'weekly', weekdays: rule.repeat.weekdays, until };
  }
  return {
    ...base,
    repeatKind: 'monthly',
    monthlyWeekday: rule.repeat.weekday,
    ordinals: rule.repeat.ordinals,
    until
  };
}
