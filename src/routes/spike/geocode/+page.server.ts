import type { PageServerLoad } from './$types';
import { geocode } from '$lib/server/geocode';

// SPIKE check 6: address -> coordinates (Nominatim/OSM) -> map pin. Requires
// network at runtime. Proves the venue-geocoding path without a create-venue UI.
export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q') ?? '';
  const result = query ? await geocode(query, fetch) : null;
  return { query, result };
};
