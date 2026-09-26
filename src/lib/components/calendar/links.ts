import type { Occurrence } from '$lib/types';

export function eventHref(occurrence: Pick<Occurrence, 'eventId' | 'dateKey'>): string {
  return `/events/${encodeURIComponent(occurrence.eventId)}?date=${occurrence.dateKey}`;
}

/** "https://www.example.org/path" -> "example.org/path" for display. */
export function websiteLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function osmHref(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
