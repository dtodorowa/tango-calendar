import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eventSource, expandAll } from '$lib/server/data';
import { addDays, localDateKey } from '$lib/time';

const UPCOMING_DAYS = 84;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const load: PageServerLoad = async ({ params, url, locals, depends }) => {
  depends('app:event');

  const entry = await eventSource(locals).getPublishedSeries(params.id);
  if (!entry) error(404, 'Event not found');
  const { series, org, venue } = entry;

  const todayKey = localDateKey(new Date());
  const upcoming = expandAll([entry], {
    startKey: todayKey,
    endKey: addDays(todayKey, UPCOMING_DAYS)
  });

  // A shared link may point at a past date; resolve it on its own.
  const requested = url.searchParams.get('date');
  const requestedKey = requested && DATE_KEY.test(requested) ? requested : null;
  const selected =
    (requestedKey &&
      (upcoming.find((o) => o.dateKey === requestedKey) ??
        expandAll([entry], { startKey: requestedKey, endKey: requestedKey })[0])) ||
    upcoming[0] ||
    null;

  return {
    event: {
      id: series.id,
      title: series.title,
      description: series.description,
      categories: series.categories,
      tags: series.tags,
      price: series.price,
      note: series.note ?? null,
      heroPhoto: series.heroPhoto ?? null,
      org,
      venue
    },
    selected,
    upcoming
  };
};
