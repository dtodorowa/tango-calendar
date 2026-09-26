import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { LOCALE_COOKIE, resolveLocale } from '$lib/server/locale';
import { createRequestClient } from '$lib/server/supabase';
import { isLocale } from '$lib/types';

const locale: Handle = async ({ event, resolve }) => {
  const queryLang = event.url.searchParams.get('lang');
  const resolved = resolveLocale(
    queryLang,
    event.cookies.get(LOCALE_COOKIE),
    event.request.headers.get('accept-language')
  );

  if (isLocale(queryLang)) {
    event.cookies.set(LOCALE_COOKIE, queryLang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false
    });
  }

  event.locals.locale = resolved;
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', resolved)
  });
};

const supabase: Handle = async ({ event, resolve }) => {
  const client = createRequestClient(event.cookies);
  event.locals.supabase = client;

  // getSession() reads the cookie without verifying it; getUser() asks the auth
  // server, so only trust a session once getUser() agrees.
  event.locals.getUser = async () => {
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    return error ? null : data.user;
  };

  return resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === 'content-range' || name === 'x-supabase-api-version'
  });
};

export const handle = sequence(supabase, locale);
