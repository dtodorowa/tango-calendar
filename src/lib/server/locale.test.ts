import { describe, it, expect } from 'vitest';
import { localeFromAcceptLanguage, resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('prefers the query, then the cookie, then the header', () => {
    expect(resolveLocale('fr', 'en', 'de')).toBe('fr');
    expect(resolveLocale(null, 'en', 'fr')).toBe('en');
    expect(resolveLocale(null, undefined, 'fr-LU,fr;q=0.9')).toBe('fr');
    expect(resolveLocale('xx', 'yy', null)).toBe('de');
  });

  it('ranks Accept-Language by quality', () => {
    expect(localeFromAcceptLanguage('nl;q=1, en;q=0.5, fr;q=0.8')).toBe('fr');
    expect(localeFromAcceptLanguage('nl, es')).toBeNull();
  });
});
