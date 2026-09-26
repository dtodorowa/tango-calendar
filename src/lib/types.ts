// Domain types shared across server, API, and UI. See CONTEXT.md for meanings.

export type Locale = 'de' | 'en' | 'fr';
export const LOCALES: Locale[] = ['de', 'en', 'fr'];
export const DEFAULT_LOCALE: Locale = 'de';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

export type Role = 'owner' | 'editor';
export type EventStatus = 'draft' | 'published';
export type OverrideStatus = 'cancelled' | 'moved';

export const CATEGORIES = ['milonga', 'practica', 'workshop', 'festival', 'show', 'cafe'] as const;
export type Category = (typeof CATEGORIES)[number];

export const TAGS = ['open-air', 'beginner-friendly', 'live-music', 'with-workshop'] as const;
export type Tag = (typeof TAGS)[number];

/**
 * "fixed" carries an amount in euros; "donation" is a la gorra / Spende / au
 * chapeau. Free and donation both count as 0 for the price filter.
 */
export type PriceKind = 'fixed' | 'donation' | 'free';

export interface Price {
  kind: PriceKind;
  amount: number | null;
}

/** A translatable string, one entry per supported locale. */
export type Localized = Record<Locale, string>;

/** Who runs events. Contact fields are public by the organizer's choice. */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface Venue {
  id: string;
  orgId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

/** An Event is a series; its dated instances are Occurrences. */
export interface EventSeries {
  id: string;
  orgId: string;
  venueId: string;
  categories: Category[];
  tags: Tag[];
  status: EventStatus;
  /** iCal RRULE body, e.g. "FREQ=WEEKLY" or "FREQ=MONTHLY;BYDAY=1SU". */
  rrule: string;
  /**
   * Wall-clock start of the first occurrence in `timezone`, "YYYY-MM-DDTHH:mm".
   * Stored as wall time so a 20:30 milonga stays 20:30 across DST changes.
   */
  dtstartLocal: string;
  timezone: string;
  durationMinutes: number;
  price: Price;
  sourceLang: Locale;
  title: Localized;
  description: Localized;
  /** Short highlight shown as a chip, e.g. "Rain alert via WhatsApp". */
  note?: Localized | null;
  heroPhoto?: string | null;
}

export interface OccurrenceOverride {
  eventId: string;
  /** Local date key (YYYY-MM-DD, in the series timezone) of the overridden occurrence. */
  date: string;
  status: OverrideStatus;
  /** For "moved": replacement wall-clock start, "YYYY-MM-DDTHH:mm". */
  overrideStartLocal?: string | null;
}

/** A resolved, displayable instance of an Event on a specific date. */
export interface Occurrence {
  eventId: string;
  /** Local date key (YYYY-MM-DD) in the display timezone. */
  dateKey: string;
  start: string;
  end: string;
  org: Organization;
  venue: Venue;
  categories: Category[];
  tags: Tag[];
  price: Price;
  title: Localized;
  description: Localized;
  note: Localized | null;
  heroPhoto: string | null;
}
