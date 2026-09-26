// The public read boundary. Pages, the API, the embed and the .ics feed ask for
// an EventSource and expand occurrences through here, whichever backend is live.

import { expandSeries } from '$lib/recurrence';
import { addDays, localDateKey } from '$lib/time';
import type { Occurrence } from '$lib/types';
import { fixtureSource } from './fixture-source';
import type { EventSource, SeriesWithContext } from './source';
import { supabaseSource } from './supabase-source';

export type { EventSource, SeriesWithContext } from './source';

/** Supabase when configured, demo fixtures otherwise. */
export function eventSource(locals: App.Locals): EventSource {
  return locals.supabase ? supabaseSource(locals.supabase) : fixtureSource;
}

export interface OccurrenceQuery {
  /** Inclusive local date keys. */
  startKey: string;
  endKey: string;
}

/** Today's local date key and the key `days` later: a rolling window. */
export function rollingWindow(days = 56, now = new Date()): OccurrenceQuery {
  const startKey = localDateKey(now);
  return { startKey, endKey: addDays(startKey, days) };
}

/** Occurrences of the given series in the window, sorted ascending by start. */
export function expandAll(entries: SeriesWithContext[], query: OccurrenceQuery): Occurrence[] {
  const results: Occurrence[] = [];

  for (const { series, org, venue, overrides } of entries) {
    for (const expanded of expandSeries(series, overrides, query.startKey, query.endKey)) {
      results.push({
        eventId: series.id,
        dateKey: expanded.dateKey,
        start: expanded.start.toISOString(),
        end: expanded.end.toISOString(),
        org,
        venue,
        categories: series.categories,
        tags: series.tags,
        price: series.price,
        title: series.title,
        description: series.description,
        note: series.note ?? null,
        heroPhoto: series.heroPhoto ?? null
      });
    }
  }

  results.sort((a, b) => a.start.localeCompare(b.start));
  return results;
}

/** Published occurrences in the window, optionally for one organizer. */
export async function listOccurrences(
  source: EventSource,
  query: OccurrenceQuery & { orgSlug?: string }
): Promise<Occurrence[]> {
  return expandAll(await source.listPublishedSeries(query.orgSlug), query);
}
