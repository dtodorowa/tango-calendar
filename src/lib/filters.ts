// Pure filter model for the public calendar. Filters live in the URL so every
// view is shareable and server-renders correctly; this module parses them from
// URLSearchParams, writes them back, and applies them to occurrences.

import { isOrganizerSlug } from './slug';
import { CATEGORIES, TAGS, type Category, type Locale, type Occurrence, type Tag } from './types';

/** Slider ceiling. A max at the ceiling means "no upper limit" (shown as "20 €+"). */
export const PRICE_CEILING = 20;

export interface Filters {
  query: string;
  categories: Category[];
  organizer: string | null;
  priceMin: number;
  priceMax: number;
  tags: Tag[];
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  categories: [],
  organizer: null,
  priceMin: 0,
  priceMax: PRICE_CEILING,
  tags: []
};

const FILTER_KEYS = ['q', 'cat', 'org', 'price', 'tags'] as const;

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  const values = raw.split(',').filter((value): value is T => allowed.includes(value as T));
  return [...new Set(values)];
}

function parsePrice(raw: string | null): { priceMin: number; priceMax: number } {
  const match = raw ? /^(\d{1,3})-(\d{1,3})$/.exec(raw) : null;
  if (!match) return { priceMin: 0, priceMax: PRICE_CEILING };
  const low = Math.min(Number(match[1]), PRICE_CEILING);
  const high = Math.min(Number(match[2]), PRICE_CEILING);
  return { priceMin: Math.min(low, high), priceMax: Math.max(low, high) };
}

export function parseFilters(params: URLSearchParams): Filters {
  const organizer = params.get('org');
  return {
    query: (params.get('q') ?? '').slice(0, 100),
    categories: parseList(params.get('cat'), CATEGORIES),
    organizer: organizer && isOrganizerSlug(organizer) ? organizer : null,
    ...parsePrice(params.get('price')),
    tags: parseList(params.get('tags'), TAGS)
  };
}

/** Returns a copy of `base` with filter params replaced by `filters` (defaults omitted). */
export function writeFilters(base: URLSearchParams, filters: Filters): URLSearchParams {
  const params = new URLSearchParams(base);
  for (const key of FILTER_KEYS) params.delete(key);

  const query = filters.query.trim();
  if (query) params.set('q', query);
  if (filters.categories.length) params.set('cat', filters.categories.join(','));
  if (filters.organizer) params.set('org', filters.organizer);
  if (filters.priceMin > 0 || filters.priceMax < PRICE_CEILING) {
    params.set('price', `${filters.priceMin}-${filters.priceMax}`);
  }
  if (filters.tags.length) params.set('tags', filters.tags.join(','));
  return params;
}

export function activeFilterCount(filters: Filters): number {
  let count = filters.categories.length + filters.tags.length;
  if (filters.organizer) count += 1;
  if (filters.priceMin > 0 || filters.priceMax < PRICE_CEILING) count += 1;
  return count;
}

/** Case- and accent-insensitive form for search ("Práctica" matches "practica"). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function effectivePrice(occurrence: Occurrence): number {
  return occurrence.price.kind === 'fixed' ? (occurrence.price.amount ?? 0) : 0;
}

export function matchesFilters(occurrence: Occurrence, filters: Filters, locale: Locale): boolean {
  if (
    filters.categories.length &&
    !occurrence.categories.some((category) => filters.categories.includes(category))
  ) {
    return false;
  }
  if (filters.tags.length && !filters.tags.every((tag) => occurrence.tags.includes(tag))) {
    return false;
  }
  if (filters.organizer && occurrence.org.slug !== filters.organizer) return false;

  const price = effectivePrice(occurrence);
  if (price < filters.priceMin) return false;
  if (filters.priceMax < PRICE_CEILING && price > filters.priceMax) return false;

  const query = normalizeForSearch(filters.query.trim());
  if (!query) return true;
  const haystack = normalizeForSearch(
    [
      occurrence.title[locale],
      occurrence.venue.name,
      occurrence.venue.city,
      occurrence.venue.address,
      occurrence.org.name
    ].join(' ')
  );
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(
  occurrences: Occurrence[],
  filters: Filters,
  locale: Locale
): Occurrence[] {
  return occurrences.filter((occurrence) => matchesFilters(occurrence, filters, locale));
}
