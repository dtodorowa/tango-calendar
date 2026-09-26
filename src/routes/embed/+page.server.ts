import type { PageServerLoad } from './$types';
import { eventSource, listOccurrences, rollingWindow } from '$lib/server/data';
import { CATEGORIES, DEFAULT_LOCALE, isLocale } from '$lib/types';

// The paste-and-go iframe embed. Self-contained styling; filters via URL params
// (org, category, city, view, lang). Auto-height is handled client-side.
export const load: PageServerLoad = async ({ url, locals }) => {
  const langParam = url.searchParams.get('lang');
  const locale = isLocale(langParam) ? langParam : DEFAULT_LOCALE;

  const orgSlug = url.searchParams.get('org') ?? undefined;
  const category = CATEGORIES.find((c) => c === url.searchParams.get('category'));
  const city = url.searchParams.get('city')?.toLowerCase();
  const view = url.searchParams.get('view') === 'month' ? 'month' : 'list';

  const occurrences = (await listOccurrences(eventSource(locals), { ...rollingWindow(), orgSlug }))
    .filter((o) => !category || o.categories.includes(category))
    .filter((o) => !city || o.venue.city.toLowerCase() === city);

  return { locale, occurrences, view };
};
