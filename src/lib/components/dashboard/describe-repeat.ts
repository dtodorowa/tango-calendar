import { formatShortDate, formatWeekday } from '$lib/format';
import type { DashboardMessages } from '$lib/i18n/dashboard';
import { parseRrule } from '$lib/repeat';
import type { Locale } from '$lib/types';

function joinList(items: string[], and: string): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

/** "Jeden 2. und 4. Samstag im Monat"; falls back to the raw rule if it's custom. */
export function describeRepeat(
  rrule: string,
  firstDateKey: string,
  locale: Locale,
  d: DashboardMessages
): string {
  const rule = parseRrule(rrule);
  if (!rule) return rrule;
  const { repeat } = rule;
  if (repeat.kind === 'once') return d.repeatOnce(formatShortDate(firstDateKey, locale));
  if (repeat.kind === 'weekly') {
    return d.repeatWeekly(
      joinList(
        repeat.weekdays.map((day) => formatWeekday(day, locale)),
        d.and
      )
    );
  }
  return d.repeatMonthly(
    joinList(
      repeat.ordinals.map((ordinal) => d.ordinals[String(ordinal) as keyof typeof d.ordinals]),
      d.and
    ),
    formatWeekday(repeat.weekday, locale)
  );
}
