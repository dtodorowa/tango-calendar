// Organizer-area data access. Every call uses the request's anon-key client, so
// RLS decides what the signed-in user may read or change (ADR-0003); nothing
// here needs the service role.

import type { EventFormValues } from '$lib/event-form';
import { scheduleToValues } from '$lib/event-form';
import { slugify } from '$lib/slug';
import { LOCALES, isLocale, type Locale, type Organization, type Venue } from '$lib/types';
import type { OrganizerInput } from '$lib/validation';
import {
  EVENT_SELECT,
  toOrganization,
  toSeriesWithContext,
  toVenue,
  toWallTime,
  type EventRow
} from './data/rows';
import type { SeriesWithContext } from './data/source';
import type { AppSupabaseClient } from './supabase';

const UNIQUE_VIOLATION = '23505';

export interface Membership {
  organization: Organization;
  role: 'owner' | 'editor';
}

export async function listMemberships(
  client: AppSupabaseClient,
  userId: string
): Promise<Membership[]> {
  const { data, error } = await client
    .from('memberships')
    .select('role, organizations ( id, name, slug, email, phone, website, social_links )')
    .eq('user_id', userId);
  if (error) throw error;
  return data
    .filter((row) => row.organizations)
    .map((row): Membership => ({
      organization: toOrganization(row.organizations!),
      role: row.role === 'owner' ? 'owner' : 'editor'
    }))
    .sort((a, b) => a.organization.name.localeCompare(b.organization.name));
}

/** Creates the organizer with the caller as owner; retries the slug on collisions. */
export async function createOrganization(
  client: AppSupabaseClient,
  input: OrganizerInput
): Promise<Organization> {
  const base = slugify(input.name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data, error } = await client.rpc('create_organization', {
      p_name: input.name,
      p_slug: slug,
      p_email: input.email ?? undefined,
      p_phone: input.phone ?? undefined,
      p_website: input.website ?? undefined,
      p_social_links: input.socialLinks
    });
    if (!error) return toOrganization(data);
    if (error.code !== UNIQUE_VIOLATION) throw error;
  }
  throw new Error('Could not find a free organizer slug');
}

export async function updateOrganization(
  client: AppSupabaseClient,
  id: string,
  input: OrganizerInput
): Promise<void> {
  const { error } = await client
    .from('organizations')
    .update({
      name: input.name,
      email: input.email,
      phone: input.phone,
      website: input.website,
      social_links: input.socialLinks
    })
    .eq('id', id);
  if (error) throw error;
}

export async function listVenues(client: AppSupabaseClient, orgIds: string[]): Promise<Venue[]> {
  if (orgIds.length === 0) return [];
  const { data, error } = await client
    .from('venues')
    .select('id, org_id, name, address, lat, lng, city, country')
    .in('org_id', orgIds)
    .order('name');
  if (error) throw error;
  return data.map(toVenue);
}

export async function createVenue(
  client: AppSupabaseClient,
  venue: Omit<Venue, 'id'>
): Promise<string> {
  const { data, error } = await client
    .from('venues')
    .insert({
      org_id: venue.orgId,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      country: venue.country,
      lat: venue.lat,
      lng: venue.lng
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export interface DashboardEvent {
  entry: SeriesWithContext;
  status: 'draft' | 'published';
}

/** All events of these organizers, drafts included (RLS allows members to see them). */
export async function listOrganizerEvents(
  client: AppSupabaseClient,
  orgIds: string[]
): Promise<DashboardEvent[]> {
  if (orgIds.length === 0) return [];
  const { data, error } = await client
    .from('events')
    .select(EVENT_SELECT)
    .in('org_id', orgIds)
    .order('dtstart_local')
    .returns<EventRow[]>();
  if (error) throw error;
  return data.flatMap((row) => {
    const entry = toSeriesWithContext(row);
    return entry ? [{ entry, status: entry.series.status }] : [];
  });
}

export interface EditableEvent {
  entry: SeriesWithContext;
  values: EventFormValues;
}

/** One event as form values, with raw per-locale texts (no fallbacks filled in). */
export async function getEditableEvent(
  client: AppSupabaseClient,
  id: string,
  orgIds: string[]
): Promise<EditableEvent | null> {
  const { data, error } = await client
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .in('org_id', orgIds)
    .returns<EventRow[]>()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const entry = toSeriesWithContext(data);
  if (!entry) return null;

  const raw = new Map(data.event_i18n.map((row) => [row.locale, row]));
  const translations = Object.fromEntries(
    LOCALES.map((locale) => {
      const row = raw.get(locale);
      return [
        locale,
        { title: row?.title ?? '', description: row?.description ?? '', note: row?.note ?? '' }
      ];
    })
  ) as EventFormValues['translations'];

  const sourceLang: Locale = isLocale(data.source_lang) ? data.source_lang : 'de';
  return {
    entry,
    values: {
      orgId: data.org_id,
      sourceLang,
      translations,
      categories: entry.series.categories,
      tags: entry.series.tags,
      ...scheduleToValues(data.rrule, toWallTime(data.dtstart_local), data.duration_minutes),
      venueMode: 'saved',
      venueId: data.venue_id,
      venueName: '',
      venueAddress: '',
      venueCity: '',
      venueCountry: entry.venue.country,
      priceKind: entry.series.price.kind,
      priceAmount: entry.series.price.amount === null ? '' : String(entry.series.price.amount),
      publish: data.status === 'published'
    }
  };
}

export interface EventRecord {
  orgId: string;
  venueId: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published';
  rrule: string;
  dtstartLocal: string;
  durationMinutes: number;
  priceKind: string;
  priceAmount: number | null;
  sourceLang: Locale;
  translations: { locale: Locale; title: string; description: string; note: string }[];
}

/** Insert (id null) or update an event plus translations in one transaction. */
export async function saveEvent(
  client: AppSupabaseClient,
  id: string | null,
  record: EventRecord
): Promise<string> {
  const { data, error } = await client.rpc('save_event', {
    // The generated type says string, but the function takes null to mean "insert".
    p_id: id as string,
    p_event: {
      org_id: record.orgId,
      venue_id: record.venueId,
      categories: record.categories,
      tags: record.tags,
      status: record.status,
      rrule: record.rrule,
      dtstart_local: record.dtstartLocal,
      duration_minutes: record.durationMinutes,
      price_kind: record.priceKind,
      price_amount: record.priceAmount,
      source_lang: record.sourceLang
    },
    p_translations: record.translations
  });
  if (error) throw error;
  return data;
}

export async function deleteEvent(client: AppSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function cancelOccurrence(
  client: AppSupabaseClient,
  eventId: string,
  dateKey: string
): Promise<void> {
  const { error } = await client
    .from('occurrence_overrides')
    .upsert(
      { event_id: eventId, occ_date: dateKey, status: 'cancelled', override_start_local: null },
      { onConflict: 'event_id,occ_date' }
    );
  if (error) throw error;
}

export async function restoreOccurrence(
  client: AppSupabaseClient,
  eventId: string,
  dateKey: string
): Promise<void> {
  const { error } = await client
    .from('occurrence_overrides')
    .delete()
    .eq('event_id', eventId)
    .eq('occ_date', dateKey);
  if (error) throw error;
}
