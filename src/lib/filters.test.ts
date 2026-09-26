import { describe, it, expect } from 'vitest';
import {
  EMPTY_FILTERS,
  PRICE_CEILING,
  activeFilterCount,
  applyFilters,
  parseFilters,
  writeFilters
} from './filters';
import type { Occurrence } from './types';

function occurrence(overrides: Partial<Occurrence>): Occurrence {
  return {
    eventId: 'e',
    dateKey: '2026-10-02',
    start: '2026-10-02T19:00:00.000Z',
    end: '2026-10-02T22:00:00.000Z',
    org: { id: 'o', name: 'Tango Saar', slug: 'tango-saar' },
    venue: {
      id: 'v',
      orgId: 'o',
      name: 'Kulturhaus',
      address: 'Nauwieserstraße 1',
      lat: 0,
      lng: 0,
      city: 'Saarbrücken',
      country: 'DE'
    },
    categories: ['milonga'],
    tags: [],
    price: { kind: 'fixed', amount: 10 },
    title: { de: 'Práctica', en: 'Práctica', fr: 'Práctica' },
    description: { de: '', en: '', fr: '' },
    note: null,
    heroPhoto: null,
    ...overrides
  };
}

describe('parseFilters / writeFilters', () => {
  it('round-trips through the URL', () => {
    const filters = {
      query: 'grund',
      categories: ['milonga' as const, 'practica' as const],
      organizer: 'tango-saar',
      priceMin: 0,
      priceMax: 12,
      tags: ['open-air' as const]
    };
    const params = writeFilters(new URLSearchParams('view=map'), filters);
    expect(params.get('view')).toBe('map');
    expect(parseFilters(params)).toEqual(filters);
  });

  it('omits defaults', () => {
    expect(writeFilters(new URLSearchParams(), EMPTY_FILTERS).toString()).toBe('');
  });

  it('drops unknown and malformed values', () => {
    const filters = parseFilters(new URLSearchParams('cat=milonga,rave&org=../x&price=abc'));
    expect(filters.categories).toEqual(['milonga']);
    expect(filters.organizer).toBeNull();
    expect(filters.priceMax).toBe(PRICE_CEILING);
  });

  it('clamps and orders the price range', () => {
    const filters = parseFilters(new URLSearchParams('price=50-5'));
    expect(filters.priceMin).toBe(5);
    expect(filters.priceMax).toBe(PRICE_CEILING);
  });
});

describe('applyFilters', () => {
  const milonga = occurrence({ eventId: 'milonga' });
  const donation = occurrence({
    eventId: 'donation',
    price: { kind: 'donation', amount: null },
    tags: ['open-air']
  });
  const pricey = occurrence({
    eventId: 'festival',
    categories: ['festival'],
    price: { kind: 'fixed', amount: 90 }
  });
  const all = [milonga, donation, pricey];

  const ids = (list: Occurrence[]) => list.map((o) => o.eventId);

  it('filters by category', () => {
    const result = applyFilters(all, { ...EMPTY_FILTERS, categories: ['festival'] }, 'de');
    expect(ids(result)).toEqual(['festival']);
  });

  it('treats donation as 0 and the ceiling as unbounded', () => {
    expect(ids(applyFilters(all, { ...EMPTY_FILTERS, priceMax: 5 }, 'de'))).toEqual(['donation']);
    expect(ids(applyFilters(all, EMPTY_FILTERS, 'de'))).toEqual(ids(all));
    expect(ids(applyFilters(all, { ...EMPTY_FILTERS, priceMin: 1 }, 'de'))).toEqual([
      'milonga',
      'festival'
    ]);
  });

  it('requires every selected tag', () => {
    const result = applyFilters(all, { ...EMPTY_FILTERS, tags: ['open-air'] }, 'de');
    expect(ids(result)).toEqual(['donation']);
  });

  it('searches accent-insensitively across title, venue and organizer', () => {
    expect(applyFilters(all, { ...EMPTY_FILTERS, query: 'practica' }, 'de')).toHaveLength(3);
    expect(applyFilters(all, { ...EMPTY_FILTERS, query: 'saarbrucken saar' }, 'de')).toHaveLength(
      3
    );
    expect(applyFilters(all, { ...EMPTY_FILTERS, query: 'trier' }, 'de')).toHaveLength(0);
  });

  it('counts active filters, not the search query', () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, query: 'x', categories: ['milonga'] })).toBe(1);
  });
});
