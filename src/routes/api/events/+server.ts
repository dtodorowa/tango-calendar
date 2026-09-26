import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eventSource, listOccurrences, rollingWindow } from '$lib/server/data';
import { CATEGORIES, type Category } from '$lib/types';

const MAX_DAYS = 180;

// The read API. Other sites can call this and server-render the result on their
// own domain. CORS is open so cross-origin embedders can fetch it too. Treat the
// response shape as a stable contract.
export const GET: RequestHandler = async ({ url, locals }) => {
  const orgSlug = url.searchParams.get('org') ?? undefined;
  const categoryParam = url.searchParams.get('category');
  const category = CATEGORIES.find((c) => c === categoryParam) as Category | undefined;
  const city = url.searchParams.get('city')?.toLowerCase();

  const daysParam = Number(url.searchParams.get('days'));
  const days = Number.isInteger(daysParam) && daysParam > 0 ? Math.min(daysParam, MAX_DAYS) : 56;

  const occurrences = (
    await listOccurrences(eventSource(locals), { ...rollingWindow(days), orgSlug })
  )
    .filter((o) => !category || o.categories.includes(category))
    .filter((o) => !city || o.venue.city.toLowerCase() === city);

  return json(
    { occurrences },
    { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=60' } }
  );
};
