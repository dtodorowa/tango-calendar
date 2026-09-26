// Locale resolution: explicit ?lang= wins (and is remembered in a cookie), then
// the cookie, then Accept-Language, then German as the region's default.
import { DEFAULT_LOCALE, isLocale, type Locale } from '$lib/types';

export const LOCALE_COOKIE = 'lang';

export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const quality = params.find((p) => p.trim().startsWith('q='));
      return {
        base: tag.slice(0, 2).toLowerCase(),
        q: quality ? Number(quality.split('=')[1]) : 1
      };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => isLocale(entry.base));
  return match ? (match.base as Locale) : null;
}

export function resolveLocale(
  queryLang: string | null,
  cookieLang: string | undefined,
  acceptLanguage: string | null
): Locale {
  if (isLocale(queryLang)) return queryLang;
  if (isLocale(cookieLang)) return cookieLang;
  return localeFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}
