import type { PageServerLoad } from './$types';
import { eventSource, listOccurrences } from '$lib/server/data';
import {
  formatYearMonth,
  localDateKey,
  monthGridBounds,
  parseYearMonth,
  yearMonthOfKey
} from '$lib/time';

// The public calendar: the SEO home. Only `month` drives the data window;
// filters and view are applied client-side from the URL, so changing them
// doesn't re-run this load.
export const load: PageServerLoad = async ({ url, locals, depends }) => {
  depends('app:occurrences');

  const todayKey = localDateKey(new Date());
  const currentMonth = yearMonthOfKey(todayKey);
  const month = parseYearMonth(url.searchParams.get('month')) ?? currentMonth;
  const source = eventSource(locals);

  const [occurrences, organizers] = await Promise.all([
    listOccurrences(source, monthGridBounds(month)),
    source.listOrganizations()
  ]);

  return {
    todayKey,
    month: formatYearMonth(month),
    currentMonth: formatYearMonth(currentMonth),
    occurrences,
    organizers
  };
};
