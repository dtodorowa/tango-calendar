import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ErrorCode } from '$lib/i18n/dashboard';
import { NEXT_COOKIE } from '$lib/server/login';
import { emailSchema, safeNext } from '$lib/validation';

export const load: PageServerLoad = async ({ locals, url }) => {
  const next = safeNext(url.searchParams.get('next'));
  if (await locals.getUser()) redirect(303, next);
  // /auth/confirm sends people back here when their link no longer works.
  const linkError: ErrorCode | null = url.searchParams.has('expired') ? 'invalidLink' : null;
  return { configured: Boolean(locals.supabase), next, linkError };
};

function authErrorCode(status: number | undefined): ErrorCode {
  return status === 429 ? 'rateLimited' : 'generic';
}

export const actions: Actions = {
  // Email a sign-in link; /auth/confirm finishes the login. New addresses get an
  // account on first use.
  send: async ({ request, locals, url, cookies }) => {
    if (!locals.supabase) return fail(503, { step: 'email', error: 'notConfigured' as ErrorCode });
    const form = await request.formData();
    const parsed = emailSchema.safeParse(form.get('email') ?? '');
    if (!parsed.success) {
      return fail(400, {
        step: 'email',
        email: String(form.get('email') ?? ''),
        error: parsed.error.issues[0].message as ErrorCode
      });
    }

    const { error } = await locals.supabase.auth.signInWithOtp({
      email: parsed.data,
      // The email template reads `.Data.locale`, but Supabase only stores `data` when it
      // creates the account. Returning users get the locale saved at their last login.
      options: { shouldCreateUser: true, data: { locale: locals.locale } }
    });
    if (error) {
      return fail(error.status ?? 500, {
        step: 'email',
        email: parsed.data,
        error: authErrorCode(error.status)
      });
    }
    // The link in the email can't carry `next`, so park it here for /auth/confirm.
    // Opened on another device, the link just lands on the default page.
    cookies.set(NEXT_COOKIE, safeNext(url.searchParams.get('next')), {
      path: '/',
      maxAge: 60 * 60,
      httpOnly: true,
      sameSite: 'lax'
    });
    return { step: 'sent', email: parsed.data };
  }
};
