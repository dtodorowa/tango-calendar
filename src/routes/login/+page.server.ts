import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ErrorCode } from '$lib/i18n/dashboard';
import { emailSchema, otpSchema, safeNext } from '$lib/validation';

export const load: PageServerLoad = async ({ locals, url }) => {
  const next = safeNext(url.searchParams.get('next'));
  if (await locals.getUser()) redirect(303, next);
  return { configured: Boolean(locals.supabase), next };
};

function authErrorCode(status: number | undefined): ErrorCode {
  return status === 429 ? 'rateLimited' : 'generic';
}

export const actions: Actions = {
  // Step 1: email a 6-digit code. New addresses get an account on first use.
  send: async ({ request, locals }) => {
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
      options: { shouldCreateUser: true }
    });
    if (error) {
      return fail(error.status ?? 500, {
        step: 'email',
        email: parsed.data,
        error: authErrorCode(error.status)
      });
    }
    return { step: 'code', email: parsed.data };
  },

  // Step 2: exchange email + code for a session cookie.
  verify: async ({ request, locals, url }) => {
    if (!locals.supabase) return fail(503, { step: 'email', error: 'notConfigured' as ErrorCode });
    const form = await request.formData();
    const email = emailSchema.safeParse(form.get('email') ?? '');
    const token = otpSchema.safeParse(form.get('code') ?? '');
    if (!email.success) return fail(400, { step: 'email', error: 'invalidEmail' as ErrorCode });
    if (!token.success) {
      return fail(400, { step: 'code', email: email.data, error: 'invalidCode' as ErrorCode });
    }

    const { error } = await locals.supabase.auth.verifyOtp({
      email: email.data,
      token: token.data,
      type: 'email'
    });
    if (error) {
      const code: ErrorCode = error.status === 429 ? 'rateLimited' : 'invalidCode';
      return fail(400, { step: 'code', email: email.data, error: code });
    }
    redirect(303, safeNext(url.searchParams.get('next')));
  }
};
