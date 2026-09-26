import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

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
