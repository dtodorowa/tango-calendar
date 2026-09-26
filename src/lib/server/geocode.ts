// Server-side geocoding via Nominatim (OpenStreetMap): no API key, EU/GDPR-clean.
// The usage policy asks for an identifying User-Agent and at most one request a
// second; venues are geocoded once when created, which stays far below that.

export interface GeocodeResult {
  lat: number;
  lng: number;
  display: string;
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'saarlorlux-tango-calendar/0.2 (community events calendar)';

/** Resolve a free-text address to coordinates. `fetchFn` is SvelteKit's event.fetch. */
export async function geocode(
  query: string,
  fetchFn: typeof fetch,
  countryCode?: string
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams({ format: 'json', limit: '1', q: trimmed });
  if (countryCode) params.set('countrycodes', countryCode.toLowerCase());

  let response: Response;
  try {
    response = await fetchFn(`${ENDPOINT}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de,fr,en' }
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0] as { lat?: string; lon?: string; display_name?: string };
  if (!first.lat || !first.lon) return null;

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    display: String(first.display_name ?? trimmed)
  };
}
