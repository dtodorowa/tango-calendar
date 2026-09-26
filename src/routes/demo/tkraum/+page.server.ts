import type { PageServerLoad } from './$types';
import type { Occurrence } from '$lib/types';

// A stand-in for a consuming site. It calls the read API on the SERVER (in load),
// so the events are server-rendered into the host's own HTML: indexable on its
// domain, no iframe. View source to confirm the titles are in the initial HTML.
export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch('/api/events?org=tango-saar&days=56');
  const data = (await response.json()) as { occurrences: Occurrence[] };
  return { occurrences: data.occurrences };
};
