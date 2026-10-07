import { describe, it, expect } from 'vitest';
import { isOrganizerSlug, slugify } from './slug';

describe('slugify', () => {
  it('handles German and French characters', () => {
    expect(slugify('Tangofreunde Saarbrücken e.V.')).toBe('tangofreunde-saarbruecken-e-v');
    expect(slugify('Tango Frontière')).toBe('tango-frontiere');
    expect(slugify('Straße')).toBe('strasse');
  });

  it('never returns an empty slug', () => {
    expect(slugify('!!!')).toBe('organizer');
  });
});

describe('isOrganizerSlug', () => {
  it('accepts what slugify produces', () => {
    expect(isOrganizerSlug(slugify('Tango Frontière'))).toBe(true);
  });

  it('rejects path tricks, capitals and empty input', () => {
    expect(isOrganizerSlug('../x')).toBe(false);
    expect(isOrganizerSlug('Tango')).toBe(false);
    expect(isOrganizerSlug('')).toBe(false);
    expect(isOrganizerSlug('a'.repeat(65))).toBe(false);
  });
});
