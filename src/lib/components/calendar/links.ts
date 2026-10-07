import type { Occurrence, Venue } from '$lib/types';

export function eventHref(occurrence: Pick<Occurrence, 'eventId' | 'dateKey'>): string {
  return `/events/${encodeURIComponent(occurrence.eventId)}?date=${occurrence.dateKey}`;
}

export function organizerHref(slug: string): string {
  return `/organizers/${encodeURIComponent(slug)}`;
}

/** "https://www.example.org/path" -> "example.org/path" for display. */
export function websiteLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/**
 * Searching "name, address" lands on the venue's place card rather than a bare pin;
 * the universal URL opens the Google Maps app on phones where it is installed.
 */
export function googleMapsHref(venue: Pick<Venue, 'name' | 'address'>): string {
  const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
