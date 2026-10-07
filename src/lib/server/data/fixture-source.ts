// Demo data source, used when no Supabase project is configured.
import { events, organizations, overrides, venues } from '$lib/fixtures';
import type { Organization, Venue } from '$lib/types';
import type { EventSource, SeriesWithContext } from './source';

function requireOrg(id: string): Organization {
  const org = organizations.find((o) => o.id === id);
  if (!org) throw new Error(`Fixture integrity: no organization ${id}`);
  return org;
}

function requireVenue(id: string): Venue {
  const venue = venues.find((v) => v.id === id);
  if (!venue) throw new Error(`Fixture integrity: no venue ${id}`);
  return venue;
}

function withContext(id: string): SeriesWithContext | undefined {
  const series = events.find((e) => e.id === id && e.status === 'published');
  if (!series) return undefined;
  return {
    series,
    org: requireOrg(series.orgId),
    venue: requireVenue(series.venueId),
    overrides: overrides.filter((o) => o.eventId === series.id)
  };
}

export const fixtureSource: EventSource = {
  async listPublishedSeries(orgSlug) {
    return events
      .map((series) => withContext(series.id))
      .filter((entry): entry is SeriesWithContext => Boolean(entry))
      .filter((entry) => !orgSlug || entry.org.slug === orgSlug);
  },
  async getPublishedSeries(id) {
    return withContext(id);
  },
  async listOrganizations() {
    return [...organizations].sort((a, b) => a.name.localeCompare(b.name));
  },
  async getOrganization(slug) {
    return organizations.find((o) => o.slug === slug);
  }
};
