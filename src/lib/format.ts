// Locale-aware display formatting. Instants are shown in the display zone;
// date keys are calendar dates already, so they're formatted as UTC noon to
// stay on the same day whatever the runtime's own zone is.

import type { Messages } from './i18n/messages';
import { WEEKDAYS, type Weekday } from './repeat';
import { DISPLAY_TZ, addDays, type YearMonth } from './time';
import type { Locale, Price } from './types';

function keyAsDate(key: string): Date {
  return new Date(`${key}T12:00:00Z`);
}

function formatKey(key: string, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(keyAsDate(key));
}

export function formatMonthTitle({ year, month }: YearMonth, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, 15)));
}

export function formatWeekdayShort(key: string, locale: Locale): string {
  return formatKey(key, locale, { weekday: 'short' }).replace('.', '');
}

export function formatMonthShort(key: string, locale: Locale): string {
  return formatKey(key, locale, { month: 'short' }).replace('.', '');
}

/** "Sa., 10. Okt." / "Sat, Oct 10" */
export function formatShortDate(key: string, locale: Locale): string {
  return formatKey(key, locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "Samstag, 10. Oktober" */
export function formatLongDate(key: string, locale: Locale): string {
  return formatKey(key, locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Monday-first short weekday names for grid headers. */
export function weekdayHeaders(locale: Locale): string[] {
  const monday = '2026-01-05';
  return Array.from({ length: 7 }, (_, index) =>
    formatWeekdayShort(addDays(monday, index), locale)
  );
}

/** "WE" -> "Mittwoch" / "Wed". */
export function formatWeekday(
  weekday: Weekday,
  locale: Locale,
  width: 'long' | 'short' = 'long'
): string {
  const key = addDays('2026-01-05', WEEKDAYS.indexOf(weekday)); // a Monday
  return formatKey(key, locale, { weekday: width }).replace('.', '');
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DISPLAY_TZ
  }).format(new Date(iso));
}

export function formatTimeRange(startIso: string, endIso: string, locale: Locale): string {
  // En dash is fine for a real time range (see AGENTS.md > Copy & i18n).
  return `${formatTime(startIso, locale)} – ${formatTime(endIso, locale)}`;
}

export function formatEuro(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPrice(price: Price, locale: Locale, t: Messages): string {
  if (price.kind === 'free') return t.free;
  if (price.kind === 'donation') return t.donation;
  return formatEuro(price.amount ?? 0, locale);
}
