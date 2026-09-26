import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { NEXT_COOKIE, updateLocale } from '$lib/server/login';
import { safeNext } from '$lib/validation';

// Mail scanners (Outlook Safe Links and the like) open every link in an email.
// The token is single use, so a GET that verified it would sign the scanner in
// and leave the person with a dead link. GET only shows a button; the POST
// behind it spends the token.

function tokenHash(url: URL): string | null {
  const raw = url.searchParams.get('token_hash');
  return raw && raw.length <= 256 ? raw : null;
}

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
  if (!locals.supabase) error(503, 'Supabase is not configured');
  if (await locals.getUser()) redirect(303, safeNext(cookies.get(NEXT_COOKIE)));
  if (!tokenHash(url)) redirect(303, '/login?expired');
  return {};
};

export const actions: Actions = {
  default: async ({ locals, url, cookies }) => {
    if (!locals.supabase) error(503, 'Supabase is not configured');
    const token_hash = tokenHash(url);
    if (!token_hash) redirect(303, '/login?expired');

    const { data, error: authError } = await locals.supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    });
    if (authError) redirect(303, '/login?expired');

    await updateLocale(locals.supabase, data.user, locals.locale);
    const next = safeNext(cookies.get(NEXT_COOKIE));
    cookies.delete(NEXT_COOKIE, { path: '/' });
    redirect(303, next);
  }
};
