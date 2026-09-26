import type { EventSeries, OccurrenceOverride, Organization, Venue } from '$lib/types';

export interface SeriesWithContext {
  series: EventSeries;
  org: Organization;
  venue: Venue;
  overrides: OccurrenceOverride[];
}

/** Where published events come from: the Supabase project, or demo fixtures. */
export interface EventSource {
  listPublishedSeries(orgSlug?: string): Promise<SeriesWithContext[]>;
  getPublishedSeries(id: string): Promise<SeriesWithContext | undefined>;
  listOrganizations(): Promise<Organization[]>;
}
