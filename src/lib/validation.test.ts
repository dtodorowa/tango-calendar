import { describe, it, expect } from 'vitest';
import { eventSchema, organizerSchema, safeNext, toFieldErrors } from './validation';
import { MAX_SOCIAL_LINKS } from './social';

const blankTranslation = { title: '', description: '', note: '' };

const validEvent = {
  orgId: '0b7a0c4e-58f5-5e2f-2f2d-6a5b8a1f7c3e',
  sourceLang: 'de',
  translations: {
    de: { title: 'Milonga', description: '', note: '' },
    en: blankTranslation,
    fr: blankTranslation
  },
  categories: ['milonga'],
  tags: [],
  date: '2026-10-07',
  startTime: '20:30',
  endTime: '00:30',
  repeatKind: 'weekly',
  weekdays: ['WE'],
  monthlyWeekday: 'SA',
  ordinals: [],
  until: '',
  venueMode: 'saved',
  venueId: 'abc',
  venueName: '',
  venueAddress: '',
  venueCity: '',
  venueCountry: 'DE',
  priceKind: 'fixed',
  priceAmount: '7,50',
  publish: true
};

describe('eventSchema', () => {
  it('accepts a valid event and normalizes values', () => {
    const result = eventSchema.parse(validEvent);
    expect(result.priceAmount).toBe(7.5);
    expect(result.until).toBeNull();
    expect(result.translations.en.title).toBeNull();
  });

  it('reports field-level error codes', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      translations: { de: blankTranslation, en: blankTranslation, fr: blankTranslation },
      categories: [],
      weekdays: [],
      priceAmount: '',
      venueMode: 'new'
    });
    expect(result.success).toBe(false);
    const errors = toFieldErrors(result.error!);
    expect(errors).toMatchObject({
      'translations.de.title': 'required',
      categories: 'pickCategory',
      weekdays: 'pickWeekday',
      priceAmount: 'priceRequired',
      venueName: 'required',
      venueAddress: 'required'
    });
  });

  it('rejects an end date before the start', () => {
    const result = eventSchema.safeParse({ ...validEvent, until: '2026-10-01' });
    expect(toFieldErrors(result.error!).until).toBe('untilBeforeStart');
  });
});

describe('organizerSchema', () => {
  it('turns empty optionals into null and checks formats', () => {
    expect(
      organizerSchema.parse({
        name: 'Tango Saar',
        email: '',
        phone: '',
        website: '',
        socialLinks: ['', ' ']
      })
    ).toEqual({ name: 'Tango Saar', email: null, phone: null, website: null, socialLinks: [] });
    const result = organizerSchema.safeParse({
      name: '',
      email: 'nope',
      phone: '',
      website: 'tango.de',
      socialLinks: ['https://instagram.com/tangosaar', 'not a link']
    });
    expect(toFieldErrors(result.error!)).toEqual({
      name: 'required',
      email: 'invalidEmail',
      website: 'invalidUrl',
      'socialLinks.1': 'invalidUrl'
    });
  });

  it('keeps filled social links and caps how many', () => {
    const base = { name: 'Tango Saar', email: '', phone: '', website: '' };
    expect(
      organizerSchema.parse({ ...base, socialLinks: ['', 'https://t.me/tangosaar'] }).socialLinks
    ).toEqual(['https://t.me/tangosaar']);
    expect(
      organizerSchema.parse({ ...base, socialLinks: ['instagram.com/tangosaar'] }).socialLinks
    ).toEqual(['https://instagram.com/tangosaar']);
    const tooMany = Array.from(
      { length: MAX_SOCIAL_LINKS + 1 },
      (_, index) => `https://example.org/${index}`
    );
    const result = organizerSchema.safeParse({ ...base, socialLinks: tooMany });
    expect(toFieldErrors(result.error!)).toEqual({ socialLinks: 'tooMany' });
  });
});

describe('safeNext', () => {
  it('only allows same-site paths', () => {
    expect(safeNext('/dashboard/events/new')).toBe('/dashboard/events/new');
    expect(safeNext('//evil.example')).toBe('/dashboard');
    expect(safeNext('https://evil.example')).toBe('/dashboard');
    expect(safeNext(null)).toBe('/dashboard');
  });
});
