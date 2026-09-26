// Supabase-backed source. Runs under RLS with the request's client, so anon
// visitors only ever see published events.
import type { AppSupabaseClient } from '$lib/server/supabase';
import { EVENT_SELECT, toOrganization, toSeriesWithContext, type EventRow } from './rows';
import type { EventSource, SeriesWithContext } from './source';

function mapRows(rows: EventRow[]): SeriesWithContext[] {
  return rows
    .map(toSeriesWithContext)
    .filter((entry): entry is SeriesWithContext => Boolean(entry));
}

export function supabaseSource(client: AppSupabaseClient): EventSource {
  return {
    async listPublishedSeries(orgSlug) {
      let query = client.from('events').select(EVENT_SELECT).eq('status', 'published');
      if (orgSlug) {
        const { data: org } = await client
          .from('organizations')
          .select('id')
          .eq('slug', orgSlug)
          .maybeSingle();
        if (!org) return [];
        query = query.eq('org_id', org.id);
      }
      const { data, error } = await query.returns<EventRow[]>();
      if (error) throw error;
      return mapRows(data);
    },

    async getPublishedSeries(id) {
      const { data, error } = await client
        .from('events')
        .select(EVENT_SELECT)
        .eq('id', id)
        .eq('status', 'published')
        .returns<EventRow[]>()
        .maybeSingle();
      if (error) throw error;
      return data ? (toSeriesWithContext(data) ?? undefined) : undefined;
    },

    async listOrganizations() {
      const { data, error } = await client
        .from('organizations')
        .select('id, name, slug, email, phone, website, social_links')
        .order('name');
      if (error) throw error;
      return data.map(toOrganization);
    }
  };
}
