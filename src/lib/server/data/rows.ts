// Supabase rows -> domain types. Pure, so the mapping is unit-testable without
// a database. Column shapes follow supabase/migrations/0002_tango_calendar.sql.

import type { Tables } from '$lib/database.types';
import { logoUrl, photoUrls } from '$lib/media';
import {
  CATEGORIES,
  LOCALES,
  TAGS,
  isLocale,
  type Category,
  type EventSeries,
  type Locale,
  type Localized,
  type OccurrenceOverride,
  type Organization,
  type PriceKind,
  type Tag,
  type Venue
} from '$lib/types';
import type { SeriesWithContext } from './source';

export type OrganizationRow = Pick<
  Tables<'organizations'>,
  'id' | 'name' | 'slug' | 'email' | 'phone' | 'website' | 'social_links' | 'logo'
>;
export type VenueRow = Pick<
  Tables<'venues'>,
  'id' | 'org_id' | 'name' | 'address' | 'lat' | 'lng' | 'city' | 'country'
>;
export type I18nRow = Pick<Tables<'event_i18n'>, 'locale' | 'title' | 'description' | 'note'>;
export type OverrideRow = Pick<
  Tables<'occurrence_overrides'>,
  'occ_date' | 'status' | 'override_start_local'
>;
export type EventRow = Pick<
  Tables<'events'>,
  | 'id'
  | 'org_id'
  | 'venue_id'
  | 'categories'
  | 'tags'
  | 'status'
  | 'rrule'
  | 'dtstart_local'
  | 'timezone'
  | 'duration_minutes'
  | 'price_kind'
  | 'price_amount'
  | 'source_lang'
  | 'hero_photo'
> & {
  organizations: OrganizationRow | null;
  venues: VenueRow | null;
  event_i18n: I18nRow[];
  occurrence_overrides: OverrideRow[];
};

/** The select string that produces an EventRow. */
export const EVENT_SELECT = `
  id, org_id, venue_id, categories, tags, status, rrule, dtstart_local, timezone,
  duration_minutes, price_kind, price_amount, source_lang, hero_photo,
  organizations ( id, name, slug, email, phone, website, social_links, logo ),
  venues ( id, org_id, name, address, lat, lng, city, country ),
  event_i18n ( locale, title, description, note ),
  occurrence_overrides ( occ_date, status, override_start_local )
`;

/** `storageBase` is the Supabase project URL that media keys resolve against. */
export function toOrganization(row: OrganizationRow, storageBase: string): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    phone: row.phone,
    website: row.website,
    socialLinks: row.social_links,
    logo: logoUrl(storageBase, row.logo)
  };
}

export function toVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    city: row.city,
    country: row.country
  };
}

/** Postgres `timestamp` comes back as "YYYY-MM-DDTHH:mm:ss"; the domain uses minutes. */
export function toWallTime(value: string): string {
  return value.replace(' ', 'T').slice(0, 16);
}

type I18nField = 'title' | 'description' | 'note';

/** Missing or blank translations fall back to the source language, then any text. */
export function localize(rows: I18nRow[], field: I18nField, sourceLang: Locale): Localized {
  const byLocale = new Map(rows.map((row) => [row.locale, row[field].trim()]));
  const fallback =
    byLocale.get(sourceLang) || rows.map((row) => row[field].trim()).find(Boolean) || '';
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, byLocale.get(locale) || fallback])
  ) as Localized;
}

function knownValues<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((value): value is T => (allowed as readonly string[]).includes(value));
}

export function toSeriesWithContext(row: EventRow, storageBase: string): SeriesWithContext | null {
  if (!row.organizations || !row.venues) return null;
  const sourceLang: Locale = isLocale(row.source_lang) ? row.source_lang : 'de';
  const note = localize(row.event_i18n, 'note', sourceLang);

  const series: EventSeries = {
    id: row.id,
    orgId: row.org_id,
    venueId: row.venue_id,
    categories: knownValues<Category>(row.categories, CATEGORIES),
    tags: knownValues<Tag>(row.tags, TAGS),
    status: row.status === 'published' ? 'published' : 'draft',
    rrule: row.rrule,
    dtstartLocal: toWallTime(row.dtstart_local),
    timezone: row.timezone,
    durationMinutes: row.duration_minutes,
    price: {
      kind: row.price_kind as PriceKind,
      amount: row.price_amount === null ? null : Number(row.price_amount)
    },
    sourceLang,
    title: localize(row.event_i18n, 'title', sourceLang),
    description: localize(row.event_i18n, 'description', sourceLang),
    note: note[sourceLang] ? note : null,
    heroPhoto: photoUrls(storageBase, row.hero_photo)
  };

  const overrides: OccurrenceOverride[] = row.occurrence_overrides.map((override) => ({
    eventId: row.id,
    date: override.occ_date,
    status: override.status === 'moved' ? 'moved' : 'cancelled',
    overrideStartLocal: override.override_start_local
      ? toWallTime(override.override_start_local)
      : null
  }));

  return {
    series,
    org: toOrganization(row.organizations, storageBase),
    venue: toVenue(row.venues),
    overrides
  };
}
